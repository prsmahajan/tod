import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/subscriptions - Get all subscriptions with stats
export async function GET(req: NextRequest) {
  try {
    // TODO: Add proper Appwrite authentication check here
    // For now, relying on AdminAuthWrapper client-side protection

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
        whereClause.subscriptionStatus = "ACTIVE";
        break;
      case "cancelled":
        whereClause.subscriptionStatus = "CANCELLED";
        break;
      case "paused":
        whereClause.subscriptionStatus = "PAUSED";
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

    // OPTIMIZATION: Use aggregate queries instead of loading all subscribers
    const baseWhere = {
      OR: [
        { razorpaySubscriptionId: { not: null } },
        { subscriptionStatus: { not: null } },
      ],
    };

    // Run all queries in parallel for better performance
    const [subscriptions, total, totalSubscribers, activeCount, cancelledCount, pausedCount, animalsFedSum] = await Promise.all([
      // Paginated subscriptions
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
      // Total count for pagination
      prisma.user.count({ where: whereClause }),
      // Stats using efficient aggregate queries
      prisma.user.count({ where: baseWhere }),
      prisma.user.count({ where: { ...baseWhere, subscriptionStatus: "ACTIVE" } }),
      prisma.user.count({ where: { ...baseWhere, subscriptionStatus: "CANCELLED" } }),
      prisma.user.count({ where: { ...baseWhere, subscriptionStatus: "PAUSED" } }),
      prisma.user.aggregate({
        where: baseWhere,
        _sum: { animalsFed: true },
      }),
    ]);

    const stats = {
      totalSubscribers,
      activeSubscriptions: activeCount,
      cancelledSubscriptions: cancelledCount,
      pausedSubscriptions: pausedCount,
      totalAnimalsFed: animalsFedSum._sum.animalsFed || 0,
      // MRR calculation (assuming Rs. 199/month per active subscriber)
      mrr: activeCount * 199,
      // Estimated total revenue (basic calculation)
      totalRevenue: totalSubscribers * 199 * 6, // Rough estimate
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
