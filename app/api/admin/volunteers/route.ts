import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET /api/admin/volunteers - Get all volunteers (users with non-subscriber roles)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    // Build where clause for volunteers (non-subscriber users)
    let whereClause: any = {
      role: { not: "SUBSCRIBER" },
    };

    // Apply filters
    switch (filter) {
      case "active":
        // Users who have activity in the last 30 days
        whereClause.auditLogs = {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        };
        break;
      case "authors":
        whereClause.role = "AUTHOR";
        break;
      case "editors":
        whereClause.role = { in: ["EDITOR", "ADMIN"] };
        break;
    }

    // Apply search
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch volunteers (users with author/editor/admin roles)
    const volunteers = await prisma.user.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalVolunteers = volunteers.length;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeThisMonth = await prisma.user.count({
      where: {
        role: { not: "SUBSCRIBER" },
        auditLogs: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
    });

    const totalPostsCreated = volunteers.reduce((sum, v) => sum + v._count.posts, 0);
    const totalAnimalsFed = volunteers.reduce((sum, v) => sum + v.animalsFed, 0);

    return NextResponse.json({
      volunteers,
      stats: {
        totalVolunteers,
        activeThisMonth,
        totalPostsCreated,
        totalAnimalsFed,
      },
    });
  } catch (error) {
    console.error("Volunteers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}
