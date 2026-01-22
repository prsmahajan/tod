import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { NewsletterEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        title: true,
        excerpt: true,
        slug: true,
        status: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Can only send newsletters for published posts" },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      select: {
        email: true,
        name: true,
        id: true,
      },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers" },
        { status: 400 }
      );
    }

    const postUrl = `${process.env.NEXTAUTH_URL || "https://theopendraft.com"}/articles/${post.slug}`;

    // Send emails in batches (Resend free tier has rate limits)
    const batchSize = 100;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const promises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${process.env.NEXTAUTH_URL || "https://theopendraft.com"}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

          await resend.emails.send({
            from: EMAIL_FROM,
            to: subscriber.email,
            subject: post.title,
            react: NewsletterEmail({
              subscriberName: subscriber.name || undefined,
              postTitle: post.title,
              postExcerpt: post.excerpt || "Read the full article to learn more!",
              postUrl,
              unsubscribeUrl,
            }),
          });

          sent++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          failed++;
        }
      });

      await Promise.all(promises);

      // Rate limiting - wait 1 second between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscribers.length,
    });
  } catch (error: any) {
    console.error("Newsletter send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
