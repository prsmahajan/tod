import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeImage, getModerationDecision } from "@/lib/services/vision";
import { MODERATION_STATUS, MODERATION_CONFIG } from "@/lib/moderation/constants";

// POST /api/moderation/process - Process pending photos with AI
// This can be called by a cron job or manually triggered
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret or admin authentication
    const apiKey = req.headers.get("x-api-key");
    const userEmail = req.headers.get("x-user-email");

    let isAuthorized = apiKey === process.env.CRON_SECRET;

    // Also allow authenticated admin/editor users
    if (!isAuthorized && userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      isAuthorized = user ? ["ADMIN", "EDITOR"].includes(user.role) : false;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(
      body.limit || MODERATION_CONFIG.maxImagesPerBatch,
      MODERATION_CONFIG.maxImagesPerBatch
    );

    // Find pending photos that haven't been analyzed yet
    const pendingPhotos = await prisma.photoModerationQueue.findMany({
      where: {
        status: MODERATION_STATUS.PENDING,
        aiScore: null, // Not yet analyzed
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    if (pendingPhotos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending photos to process",
        processed: 0,
      });
    }

    // Mark as analyzing
    await prisma.photoModerationQueue.updateMany({
      where: {
        id: { in: pendingPhotos.map((p) => p.id) },
      },
      data: {
        status: MODERATION_STATUS.ANALYZING,
      },
    });

    // Process each photo
    const results = {
      processed: 0,
      autoApproved: 0,
      autoRejected: 0,
      needsReview: 0,
      errors: 0,
    };

    for (const photo of pendingPhotos) {
      try {
        // Analyze with AI
        const analysis = await analyzeImage(photo.imageUrl);
        const decision = getModerationDecision(analysis);

        // Determine new status
        let newStatus = MODERATION_STATUS.HUMAN_REVIEW;
        if (decision.autoApprove) {
          newStatus = MODERATION_STATUS.AI_APPROVED;
          results.autoApproved++;
        } else if (decision.autoReject) {
          newStatus = MODERATION_STATUS.AI_REJECTED;
          results.autoRejected++;
        } else {
          results.needsReview++;
        }

        // Update the record
        await prisma.photoModerationQueue.update({
          where: { id: photo.id },
          data: {
            aiScore: analysis.safetyScore,
            aiLabels: {
              labels: analysis.labels,
              animals: analysis.detectedAnimals,
              flags: analysis.contentFlags,
              description: analysis.description,
              confidence: analysis.confidence,
              decision: {
                ...decision,
                reason: decision.reason,
              },
            },
            aiSafe: analysis.isSafe,
            status: newStatus,
          },
        });

        results.processed++;
      } catch (error) {
        console.error(`Error processing photo ${photo.id}:`, error);
        results.errors++;

        // Reset to pending for retry
        await prisma.photoModerationQueue.update({
          where: { id: photo.id },
          data: {
            status: MODERATION_STATUS.PENDING,
          },
        });
      }
    }

    // Log the batch processing result
    try {
      await prisma.auditLog.create({
        data: {
          action: "MODERATION_BATCH_PROCESS",
          entityType: "PhotoModerationQueue",
          entityId: "batch",
          userId: "system",
          details: results,
        },
      });
    } catch (auditError) {
      console.error("Audit log error:", auditError);
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Batch processing error:", error);
    return NextResponse.json(
      { error: "Failed to process photos" },
      { status: 500 }
    );
  }
}

// GET /api/moderation/process - Get processing statistics
export async function GET(req: NextRequest) {
  try {
    // Get queue statistics
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

    // Get recent processing logs
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        action: "MODERATION_BATCH_PROCESS",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Calculate pending count
    const pendingCount = await prisma.photoModerationQueue.count({
      where: {
        status: MODERATION_STATUS.PENDING,
        aiScore: null,
      },
    });

    return NextResponse.json({
      queueStats: statusCounts,
      pendingAnalysis: pendingCount,
      recentProcessing: recentLogs,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
