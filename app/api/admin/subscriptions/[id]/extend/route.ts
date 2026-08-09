import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncStatusFromPostgres } from "@/lib/subscription-sync";
import { AdminAuthError, requireAdminRequest } from "@/lib/admin/admin-api-auth";

// POST /api/admin/subscriptions/[id]/extend - Extend a subscription
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminRequest(req);
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
        subscriptionStatus: "ACTIVE",
        subscriptionEndsAt: newEndDate,
        nextBillingDate: newEndDate,
      },
    });

    console.log(
      `Subscription for ${updatedUser.email} extended ${days} days by admin ${admin.email} (now ends ${newEndDate.toISOString()})`,
    );

    // Sync changes to Appwrite
    try {
      await syncStatusFromPostgres(updatedUser.email);
    } catch (syncError) {
      console.error('Error syncing to Appwrite:', syncError);
      // Don't fail the request if sync fails
    }

    return NextResponse.json({
      success: true,
      message: `Subscription extended by ${days} days`,
      newEndDate,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Extend subscription error:", error);
    return NextResponse.json(
      { error: "Failed to extend subscription" },
      { status: 500 }
    );
  }
}
