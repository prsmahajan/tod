import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/subscriptions/[id]/cancel - Cancel a subscription
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add proper Appwrite authentication check here
    const { id } = await params;

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        razorpaySubscriptionId: true,
        subscriptionStatus: true,
        nextBillingDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: "Subscription is not active" },
        { status: 400 }
      );
    }

    // If there's a Razorpay subscription, cancel it via API
    if (user.razorpaySubscriptionId && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Cancel at end of billing period
        await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, {
          cancel_at_cycle_end: true,
        });
      } catch (razorpayError) {
        console.error("Razorpay cancel error:", razorpayError);
        // Continue with local update even if Razorpay fails
      }
    }

    // Update user's subscription status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        subscriptionStatus: "cancelled",
        subscriptionEndsAt: user.nextBillingDate || new Date(),
      },
    });

    // TODO: Log the action once auth is set up properly
    // await prisma.auditLog.create({
    //   data: {
    //     action: "SUBSCRIPTION_CANCELLED",
    //     entityType: "User",
    //     entityId: id,
    //     userId: "admin",
    //     details: {
    //       cancelledBy: "admin",
    //       subscriptionId: user.razorpaySubscriptionId,
    //       endsAt: updatedUser.subscriptionEndsAt,
    //     },
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
