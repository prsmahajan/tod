import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MODERATION_STATUS } from "@/lib/moderation/constants";

// Helper to get authenticated user
async function getAuthenticatedUser(req: NextRequest) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    return user;
  }

  // Fallback: Check x-user-email header
  const userEmail = req.headers.get("x-user-email");
  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    });
    return user;
  }

  return null;
}

// GET /api/moderation/queue/[id] - Get a specific queue item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const item = await prisma.photoModerationQueue.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Moderation queue get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue item" },
      { status: 500 }
    );
  }
}

// PATCH /api/moderation/queue/[id] - Update moderation status (human review)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, notes } = body;

    // Validate action
    if (!["approve", "reject", "feature"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use: approve, reject, or feature" },
        { status: 400 }
      );
    }

    // Determine the new status and approval state
    let newStatus: string;
    let humanApproved: boolean;

    switch (action) {
      case "approve":
        newStatus = MODERATION_STATUS.APPROVED;
        humanApproved = true;
        break;
      case "feature":
        newStatus = MODERATION_STATUS.FEATURED;
        humanApproved = true;
        break;
      case "reject":
        newStatus = MODERATION_STATUS.REJECTED;
        humanApproved = false;
        if (!notes) {
          return NextResponse.json(
            { error: "Rejection reason (notes) is required" },
            { status: 400 }
          );
        }
        break;
      default:
        newStatus = MODERATION_STATUS.PENDING;
        humanApproved = false;
    }

    // Update the queue item
    const updatedItem = await prisma.photoModerationQueue.update({
      where: { id },
      data: {
        status: newStatus,
        humanReviewed: true,
        humanApproved,
        reviewedById: user.email,
        reviewNotes: notes || null,
        reviewedAt: new Date(),
      },
    });

    // Log the audit trail
    try {
      await prisma.auditLog.create({
        data: {
          action: action === "approve" ? "APPROVE" : action === "reject" ? "REJECT" : "UPDATE",
          entityType: "PhotoModerationQueue",
          entityId: id,
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          details: {
            previousStatus: body.previousStatus || "unknown",
            newStatus,
            notes,
            aiScore: updatedItem.aiScore,
          },
        },
      });
    } catch (auditError) {
      console.error("Audit log error:", auditError);
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Moderation queue update error:", error);
    return NextResponse.json(
      { error: "Failed to update queue item" },
      { status: 500 }
    );
  }
}

// DELETE /api/moderation/queue/[id] - Delete a queue item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.photoModerationQueue.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Moderation queue delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete queue item" },
      { status: 500 }
    );
  }
}
