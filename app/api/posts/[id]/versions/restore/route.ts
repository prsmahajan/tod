import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

// POST - restore a specific version
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Only admins and editors can restore versions" }, { status: 403 });
    }

    const body = await req.json();
    const { versionId } = body;

    // Get the version to restore
    const version = await prisma.postVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.postId !== params.id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Get current post to create a backup version before restoring
    const currentPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!currentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get the current highest version number
    const latestVersion = await prisma.postVersion.findFirst({
      where: { postId: params.id },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create a backup of current state before restoring
    await prisma.postVersion.create({
      data: {
        postId: params.id,
        versionNumber: nextVersionNumber,
        title: currentPost.title,
        content: currentPost.content,
        contentMarkdown: currentPost.contentMarkdown,
        excerpt: currentPost.excerpt,
        coverImage: currentPost.coverImage,
        metaTitle: currentPost.metaTitle,
        metaDescription: currentPost.metaDescription,
        keywords: currentPost.keywords,
        changeNote: `Auto-backup before restoring to version ${version.versionNumber}`,
        createdById: user.id,
      },
    });

    // Restore the post to the selected version
    const restoredPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: version.title,
        content: version.content,
        contentMarkdown: version.contentMarkdown,
        excerpt: version.excerpt,
        coverImage: version.coverImage,
        metaTitle: version.metaTitle,
        metaDescription: version.metaDescription,
        keywords: version.keywords,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "UPDATE",
      entityType: "Post",
      entityId: params.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        action: "version_restore",
        restoredVersionNumber: version.versionNumber,
        restoredVersionId: versionId,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      post: restoredPost,
      message: `Restored to version ${version.versionNumber}`,
    });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
