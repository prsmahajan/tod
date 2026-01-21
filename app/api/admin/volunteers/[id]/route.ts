import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET /api/admin/volunteers/[id] - Get a specific volunteer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const volunteer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        avatar: true,
        bio: true,
        subscriptionStatus: true,
        animalsFed: true,
        _count: {
          select: {
            posts: true,
            auditLogs: true,
            approvalsMade: true,
          },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    // Get recent activity
    const recentActivity = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
      },
    });

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      where: { authorId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        publishedAt: true,
      },
    });

    return NextResponse.json({
      volunteer,
      recentActivity,
      recentPosts,
    });
  } catch (error) {
    console.error("Volunteer fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/volunteers/[id] - Update volunteer role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    // Validate role
    const validRoles = ["ADMIN", "EDITOR", "AUTHOR", "SUBSCRIBER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "UPDATE" as any,
        entityType: "User",
        entityId: id,
        userId: session.user.email || "admin",
        details: {
          newRole: role,
          updatedBy: session.user.email,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Volunteer update error:", error);
    return NextResponse.json(
      { error: "Failed to update volunteer" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/volunteers/[id] - Remove volunteer (set to subscriber)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Don't delete, just demote to subscriber
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: "SUBSCRIBER" },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "DELETE" as any,
        entityType: "User",
        entityId: id,
        userId: session.user.email || "admin",
        details: {
          removedBy: session.user.email,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Volunteer remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove volunteer" },
      { status: 500 }
    );
  }
}
