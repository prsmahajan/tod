import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MODERATION_STATUS } from "@/lib/moderation/constants";

// Helper to get authenticated user (supports both NextAuth and Appwrite via header)
async function getAuthenticatedUser(req: NextRequest) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    return user;
  }

  // Fallback: Check x-user-email header (set by client when using Appwrite)
  const userEmail = req.headers.get("x-user-email");
  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    return user;
  }

  return null;
}

// GET /api/moderation/queue - Get items from the moderation queue
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build the where clause based on status filter
    let whereClause: any = {};

    switch (status) {
      case "pending":
        whereClause.status = MODERATION_STATUS.PENDING;
        break;
      case "analyzing":
        whereClause.status = MODERATION_STATUS.ANALYZING;
        break;
      case "ai_approved":
        whereClause.status = MODERATION_STATUS.AI_APPROVED;
        break;
      case "ai_rejected":
        whereClause.status = MODERATION_STATUS.AI_REJECTED;
        break;
      case "human_review":
        whereClause.status = MODERATION_STATUS.HUMAN_REVIEW;
        break;
      case "approved":
        whereClause.status = MODERATION_STATUS.APPROVED;
        break;
      case "rejected":
        whereClause.status = MODERATION_STATUS.REJECTED;
        break;
      case "needs_review":
        // All items that need human attention
        whereClause.status = {
          in: [
            MODERATION_STATUS.HUMAN_REVIEW,
            MODERATION_STATUS.AI_APPROVED,
            MODERATION_STATUS.AI_REJECTED,
          ],
        };
        whereClause.humanReviewed = false;
        break;
      case "all":
      default:
        // No filter
        break;
    }

    // Fetch items with pagination
    const [items, total] = await Promise.all([
      prisma.photoModerationQueue.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.photoModerationQueue.count({ where: whereClause }),
    ]);

    // Get statistics
    const stats = await prisma.photoModerationQueue.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusCounts = stats.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statusCounts,
    });
  } catch (error) {
    console.error("Moderation queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation queue" },
      { status: 500 }
    );
  }
}

// POST /api/moderation/queue - Add a new item to the moderation queue
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, uploadedById } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Create the queue item
    const item = await prisma.photoModerationQueue.create({
      data: {
        imageUrl,
        uploadedById: uploadedById || session.user.email || "anonymous",
        status: MODERATION_STATUS.PENDING,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Moderation queue create error:", error);
    return NextResponse.json(
      { error: "Failed to add to moderation queue" },
      { status: 500 }
    );
  }
}
