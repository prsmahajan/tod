import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createAuditLog, createPostVersion } from "@/lib/audit";

// GET single post
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true, bio: true },
        },
        categories: {
          include: { category: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// UPDATE post
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Authors can only edit their own posts, editors/admins can edit any
    if (user.role === "AUTHOR" && existingPost.authorId !== user.id) {
      return NextResponse.json({ error: "Cannot edit other authors' posts" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      contentMarkdown,
      coverImage,
      status,
      scheduledFor,
      categoryIds,
      changeNote,
      // SEO fields
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      canonicalUrl,
      noIndex,
    } = body;

    // Create a version snapshot before updating (if content changed)
    const hasContentChanges =
      title !== existingPost.title ||
      content !== existingPost.content ||
      excerpt !== existingPost.excerpt;

    if (hasContentChanges) {
      await createPostVersion({
        postId: params.id,
        post: existingPost,
        userId: user.id,
        changeNote: changeNote || "Manual save",
      });
    }

    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      contentMarkdown,
      coverImage,
      status,
      scheduledFor,
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      canonicalUrl,
      noIndex,
    };

    // Set publishedAt when status changes to PUBLISHED
    if (status === "PUBLISHED" && existingPost.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    // Handle categories update
    if (categoryIds !== undefined) {
      await prisma.postCategory.deleteMany({
        where: { postId: params.id },
      });
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...updateData,
        categories: categoryIds
          ? {
              create: categoryIds.map((catId: string) => ({
                category: { connect: { id: catId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: { include: { category: true } },
      },
    });

    // Send newsletter email when changing to published
    if (status === "PUBLISHED" && existingPost.status !== "PUBLISHED" && !existingPost.emailSent) {
      try {
        const { sendNewsletterEmail } = await import("@/lib/newsletter");
        await sendNewsletterEmail(post as any);
      } catch (emailError) {
        console.error("Failed to send newsletter email:", emailError);
        // Don't fail the update if email fails
      }
    }

    // Revalidate pages when post is published or updated
    if (status === "PUBLISHED") {
      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath("/newsletter");
      revalidatePath(`/newsletter/${post.slug}`);
    }

    // Create audit log
    const auditAction = status === "PUBLISHED" && existingPost.status !== "PUBLISHED"
      ? "PUBLISH"
      : "UPDATE";

    await createAuditLog({
      action: auditAction,
      entityType: "Post",
      entityId: params.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        title: post.title,
        status: post.status,
        previousStatus: existingPost.status,
        hasContentChanges,
      },
      req,
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Post update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE post
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Only admins and editors can delete posts" }, { status: 403 });
    }

    // Get post info before deletion for audit log
    const postToDelete = await prisma.post.findUnique({
      where: { id: params.id },
      select: { title: true, slug: true, status: true },
    });

    const deletedPost = await prisma.post.delete({
      where: { id: params.id },
    });

    // Create audit log for deletion
    await createAuditLog({
      action: "DELETE",
      entityType: "Post",
      entityId: params.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        deletedTitle: postToDelete?.title,
        deletedSlug: postToDelete?.slug,
        previousStatus: postToDelete?.status,
      },
      req,
    });

    // Revalidate pages after deletion
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/newsletter");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
