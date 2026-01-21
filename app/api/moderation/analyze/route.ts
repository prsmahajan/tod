import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeImage, getModerationDecision } from "@/lib/services/vision";
import { MODERATION_STATUS } from "@/lib/moderation/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/moderation/analyze - Analyze an image with AI
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow authenticated users, system calls, or x-user-email header
    const apiKey = req.headers.get("x-api-key");
    const userEmail = req.headers.get("x-user-email");
    const isSystemCall = apiKey === process.env.CRON_SECRET;

    let isAuthorized = isSystemCall || !!session?.user?.email;

    // Check x-user-email header fallback
    if (!isAuthorized && userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail.toLowerCase() },
      });
      isAuthorized = user ? ["ADMIN", "EDITOR"].includes(user.role) : false;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, queueId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Analyze the image with AI
    const analysis = await analyzeImage(imageUrl);
    const decision = getModerationDecision(analysis);

    // Determine the new status based on AI decision
    let newStatus: string = MODERATION_STATUS.HUMAN_REVIEW;
    if (decision.autoApprove) {
      newStatus = MODERATION_STATUS.AI_APPROVED;
    } else if (decision.autoReject) {
      newStatus = MODERATION_STATUS.AI_REJECTED;
    }

    // If we have a queue ID, update the database record
    let updatedRecord = null;
    if (queueId) {
      updatedRecord = await prisma.photoModerationQueue.update({
        where: { id: queueId },
        data: {
          aiScore: analysis.safetyScore,
          aiLabels: {
            labels: analysis.labels,
            animals: analysis.detectedAnimals,
            flags: analysis.contentFlags,
            description: analysis.description,
            confidence: analysis.confidence,
            decision: JSON.parse(JSON.stringify(decision)),
          },
          aiSafe: analysis.isSafe,
          status: newStatus,
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      decision,
      status: newStatus,
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Moderation analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
