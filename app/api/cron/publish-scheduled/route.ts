import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// This endpoint should be called by a cron job to publish scheduled posts
export async function GET(req: Request) {
  try {
    // Verify the request is from a cron job - REQUIRED
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // CRON_SECRET is required - fail if not set
    if (!cronSecret) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find all scheduled posts that are due to be published
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          lte: now, // Less than or equal to now
        },
      },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts to publish",
        published: 0,
      });
    }

    // Update all due posts to PUBLISHED
    const updatePromises = scheduledPosts.map((post) =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
        },
      })
    );

    await Promise.all(updatePromises);

    // Send newsletter emails for newly published posts
    const { sendNewsletterEmail } = await import("@/lib/newsletter");
    for (const post of scheduledPosts) {
      try {
        if (!post.emailSent) {
          await sendNewsletterEmail(post as any);
        }
      } catch (emailError) {
        console.error(`Failed to send newsletter for post ${post.id}:`, emailError);
        // Continue with other posts even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Published ${scheduledPosts.length} post(s)`,
      published: scheduledPosts.length,
      posts: scheduledPosts.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to publish scheduled posts" },
      { status: 500 }
    );
  }
}
