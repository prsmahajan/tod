import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { databases, DATABASE_ID, COLLECTIONS, Query, users } from "@/lib/appwrite/server";
import { getSubscriptionByEmail } from "@/lib/subscription-sync";
import Razorpay from "razorpay";

async function calculateTotalRevenue(): Promise<number> {
  try {
    let total = 0;
    let cursor: string | undefined;

    // Paginate through all successful transaction documents to sum amounts.
    // This is safe for current scale and can be optimized later if needed.
    // Appwrite max limit is 100 per page, so we loop until fewer than 100 docs are returned.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const queries = [Query.limit(100)];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [
          ...queries,
          Query.equal("status", "success"),
        ]
      );

      for (const doc of res.documents as any[]) {
        if (typeof doc.amount === "number") {
          total += doc.amount;
        }
      }

      if (res.documents.length < 100) {
        break;
      }

      cursor = res.documents[res.documents.length - 1].$id;
    }

    return total;
  } catch (error) {
    console.error("Error calculating total revenue from Appwrite:", error);
    return 0;
  }
}

async function calculateMrr(): Promise<number> {
  try {
    let mrr = 0;
    let cursor: string | undefined;

    // Fetch active subscriptions from Appwrite and approximate MRR
    // Weekly plans are converted to monthly by multiplying by 4.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const queries = [
        Query.limit(100),
        Query.equal("status", "active"),
      ];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, queries);

      for (const doc of res.documents as any[]) {
        const amount = typeof doc.amount === "number" ? doc.amount : 0;
        const billingCycle = doc.billingCycle || "monthly";

        if (!amount) continue;

        if (billingCycle === "weekly") {
          // Approximate 4 weeks per month
          mrr += amount * 4;
        } else {
          // Treat anything else as monthly for now
          mrr += amount;
        }
      }

      if (res.documents.length < 100) {
        break;
      }

      cursor = res.documents[res.documents.length - 1].$id;
    }

    return mrr;
  } catch (error) {
    console.error("Error calculating MRR from Appwrite:", error);
    return 0;
  }
}

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
          avatar: true,
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

    // Enrich subscriptions with latest billing amount and fallback metadata.
    // We prefer the Appwrite SUBSCRIPTIONS amount, but if that's missing/zero
    // we fall back to the latest successful subscription transaction.
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const appwriteSub = await getSubscriptionByEmail(sub.email);
          let latestBillingAmount = appwriteSub ? appwriteSub.amount : null;
          let billingCycle = appwriteSub ? appwriteSub.billingCycle : null;
          let planType = appwriteSub ? (appwriteSub as any).planType || null : null;
          let avatar = (sub as any).avatar || null;

          // Prefer the human-readable name stored in Appwrite subscriptions
          // (userName) since that's what the supporter entered when
          // subscribing. Fall back to the Postgres user.name, then finally
          // to the email prefix.
          const effectiveName =
            (appwriteSub as any)?.userName ||
            sub.name ||
            sub.email.split("@")[0];

          // If subscriptionStartedAt is missing in Postgres, use the
          // Appwrite subscription creation time so the "Started" column
          // always has a meaningful value.
          const effectiveStartedAt =
            sub.subscriptionStartedAt || (appwriteSub ? appwriteSub.$createdAt : null);

          // If the subscription amount in Appwrite is missing or zero,
          // look at the most recent successful subscription transaction.
          if (!latestBillingAmount || latestBillingAmount <= 0) {
            const txRes = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.TRANSACTIONS,
              [
                Query.equal("userEmail", sub.email),
                Query.equal("type", "subscription"),
                Query.equal("status", "success"),
                Query.orderDesc("$createdAt"),
                Query.limit(1),
              ]
            );

            if (txRes.documents.length > 0) {
              const tx = txRes.documents[0] as any;
              latestBillingAmount = typeof tx.amount === "number" ? tx.amount : latestBillingAmount;
              billingCycle = tx.billingCycle || billingCycle;
              planType = tx.planType || planType;
            }
          }

          // Estimate impact:
          //  - seedling → 1 animal per billing
          //  - sprout   → 2 animals per billing
          //  - tree     → 5 animals per billing
          // Fallback to amount bands when planType is missing.
          let perCycleImpact = 0;
          if (planType === "seedling") perCycleImpact = 1;
          else if (planType === "sprout") perCycleImpact = 2;
          else if (planType === "tree") perCycleImpact = 5;
          else if (latestBillingAmount && latestBillingAmount > 0) {
            if (latestBillingAmount <= 100) perCycleImpact = 1;
            else if (latestBillingAmount <= 600) perCycleImpact = 2;
            else perCycleImpact = 5;
          }

          // Count successful subscription billing cycles for this user
          let totalCycles = 0;
          try {
            const allTxRes = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.TRANSACTIONS,
              [
                Query.equal("userEmail", sub.email),
                Query.equal("type", "subscription"),
                Query.equal("status", "success"),
                Query.limit(100),
              ]
            );
            totalCycles = allTxRes.documents.length;
          } catch (txError) {
            console.error("Error counting subscription transactions for impact:", txError);
          }

          const totalImpact = perCycleImpact * totalCycles;

          // Always try to get the avatar from Appwrite user prefs (most up-to-date source)
          // Try both userId lookup and email lookup as fallback
          if (appwriteSub && appwriteSub.userId) {
            try {
              const appwriteUser = await users.get(appwriteSub.userId);
              const appwriteAvatar = (appwriteUser as any).prefs?.avatar;
              if (appwriteAvatar) {
                avatar = appwriteAvatar;
              }
            } catch (userError: any) {
              // Fallback: try to find user by email
              try {
                const usersList = await users.list([Query.equal('email', sub.email)]);
                if (usersList.total > 0) {
                  const appwriteUser = usersList.users[0];
                  const appwriteAvatar = (appwriteUser as any).prefs?.avatar;
                  if (appwriteAvatar) {
                    avatar = appwriteAvatar;
                  }
                }
              } catch (emailError: any) {
                console.error(`Failed to fetch avatar for ${sub.email}:`, emailError.message);
              }
            }
          }

          // Check if autopay is disabled by querying Razorpay
          let autopayDisabled = false;
          let razorpayStatus = null;
          if (sub.razorpaySubscriptionId && sub.subscriptionStatus === 'ACTIVE') {
            try {
              const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_LIVE_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                key_secret: process.env.RAZORPAY_LIVE_KEY || process.env.RAZORPAY_KEY_SECRET || '',
              });

              const razorpaySub = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
              razorpayStatus = razorpaySub.status;
              
              // Check if subscription is truly cancelled or paused
              const isCancelled = razorpaySub.status === 'cancelled' || razorpaySub.status === 'completed';
              const isPauseInitiated = razorpaySub.pause_initiated === true;
              const hasScheduledCancel = razorpaySub.has_scheduled_changes && 
                                        razorpaySub.scheduled_changes?.some((change: any) => 
                                          change.action === 'cancel'
                                        );
              
              autopayDisabled = isCancelled || isPauseInitiated || hasScheduledCancel;
            } catch (razorpayError: any) {
              console.error(`Failed to check autopay for ${sub.email}:`, razorpayError.message);
            }
          }

          return {
            ...sub,
            name: effectiveName,
            subscriptionStartedAt: effectiveStartedAt,
            latestBillingAmount,
            billingCycle,
            planType,
            avatar,
            animalsFed: totalImpact,
            autopayDisabled,
            razorpayStatus,
          };
        } catch (error) {
          console.error("Error enriching subscription with Appwrite data:", error);
          return {
            ...sub,
            latestBillingAmount: null,
            billingCycle: null,
          };
        }
      })
    );

    const [mrr, totalRevenue] = await Promise.all([
      calculateMrr(),
      calculateTotalRevenue(),
    ]);

    const stats = {
      totalSubscribers,
      activeSubscriptions: activeCount,
      cancelledSubscriptions: cancelledCount,
      pausedSubscriptions: pausedCount,
      totalAnimalsFed: animalsFedSum._sum.animalsFed || 0,
      // MRR and total revenue are now calculated from real
      // Appwrite subscription and transaction data.
      mrr,
      totalRevenue,
    };

    return NextResponse.json({
      subscriptions: enrichedSubscriptions,
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
