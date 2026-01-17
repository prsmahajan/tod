import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET /api/admin/subscriptions - Get all subscriptions with stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    // Build where clause for users with subscriptions
    let whereClause: any = {
      OR: [
        { razorpaySubscriptionId: { not: null } },
        { subscriptionStatus: { not: null } },
      ],
    };

    // Apply status filter
    switch (filter) {
      case "active":
        whereClause.subscriptionStatus = "active";
        break;
      case "cancelled":
        whereClause.subscriptionStatus = "cancelled";
        break;
      case "paused":
        whereClause.subscriptionStatus = "paused";
        break;
    }

    // Apply search
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Fetch subscriptions
    const [subscriptions, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          razorpaySubscriptionId: true,
          subscriptionStatus: true,
          subscriptionStartedAt: true,
          subscriptionEndsAt: true,
          nextBillingDate: true,
          animalsFed: true,
          createdAt: true,
        },
        orderBy: { subscriptionStartedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Calculate stats
    const allSubscribers = await prisma.user.findMany({
      where: {
        OR: [
          { razorpaySubscriptionId: { not: null } },
          { subscriptionStatus: { not: null } },
        ],
      },
      select: {
        subscriptionStatus: true,
        animalsFed: true,
      },
    });

    const stats = {
      totalSubscribers: allSubscribers.length,
      activeSubscriptions: allSubscribers.filter((s) => s.subscriptionStatus === "active").length,
      cancelledSubscriptions: allSubscribers.filter((s) => s.subscriptionStatus === "cancelled").length,
      pausedSubscriptions: allSubscribers.filter((s) => s.subscriptionStatus === "paused").length,
      totalAnimalsFed: allSubscribers.reduce((sum, s) => sum + s.animalsFed, 0),
      // MRR calculation (assuming Rs. 199/month per active subscriber)
      mrr: allSubscribers.filter((s) => s.subscriptionStatus === "active").length * 199,
      // Estimated total revenue (basic calculation)
      totalRevenue: allSubscribers.length * 199 * 6, // Rough estimate
    };

    return NextResponse.json({
      subscriptions,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Subscriptions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
