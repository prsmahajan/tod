import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

// GET - fetch posts pending approval
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Only admins and editors can view pending approvals" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "PENDING_REVIEW";

    const posts = await prisma.post.findMany({
      where: { status: statusParam as any },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return NextResponse.json({ error: "Failed to fetch pending approvals" }, { status: 500 });
  }
}

// POST - approve or reject a post
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Only admins and editors can approve posts" }, { status: 403 });
    }

    const body = await req.json();
    const { postId, action, notes } = body;

    if (!postId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create approval record
    await prisma.workflowApproval.create({
      data: {
        postId,
        approverId: user.id,
        status: action === "approve" ? "APPROVED" : "REJECTED",
        notes,
      },
    });

    // Update post status
    const newStatus = action === "approve" ? "PUBLISHED" : "DRAFT";
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: newStatus,
        reviewerId: user.id,
        reviewedAt: new Date(),
        reviewNotes: notes,
        publishedAt: action === "approve" ? new Date() : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      action: action === "approve" ? "APPROVE" : "REJECT",
      entityType: "Post",
      entityId: postId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        title: post.title,
        previousStatus: post.status,
        newStatus,
        notes,
      },
      req,
    });

    // Revalidate if published
    if (action === "approve") {
      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath("/newsletter");
      revalidatePath(`/newsletter/${updatedPost.slug}`);

      // Send newsletter email
      try {
        const { sendNewsletterEmail } = await import("@/lib/newsletter");
        await sendNewsletterEmail(updatedPost as any);
      } catch (emailError) {
        console.error("Failed to send newsletter email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: action === "approve" ? "Post approved and published" : "Post rejected and returned to draft",
    });
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}
