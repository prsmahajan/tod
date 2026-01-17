import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// POST /api/admin/subscriptions/[id]/extend - Extend a subscription
export async function POST(
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
    const { days } = body;

    if (!days || days < 1 || days > 365) {
      return NextResponse.json(
        { error: "Days must be between 1 and 365" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        nextBillingDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate new end date
    const currentEndDate = user.subscriptionEndsAt || user.nextBillingDate || new Date();
    const baseDate = new Date(currentEndDate) > new Date() ? new Date(currentEndDate) : new Date();
    const newEndDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    // Update subscription
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        subscriptionStatus: "active",
        subscriptionEndsAt: newEndDate,
        nextBillingDate: newEndDate,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "SUBSCRIPTION_EXTENDED",
        entityType: "User",
        entityId: id,
        userId: session.user.email || "admin",
        details: {
          extendedBy: session.user.email,
          daysAdded: days,
          previousEndDate: currentEndDate,
          newEndDate: newEndDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subscription extended by ${days} days`,
      newEndDate,
    });
  } catch (error) {
    console.error("Extend subscription error:", error);
    return NextResponse.json(
      { error: "Failed to extend subscription" },
      { status: 500 }
    );
  }
}
