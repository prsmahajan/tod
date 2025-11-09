import { Resend } from "resend";
import { prisma } from "./db";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate unsubscribe token
function generateUnsubToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  return crypto.createHash("sha256").update(email + secret).digest("hex").slice(0, 32);
}

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  author: {
    name: string;
  };
}

export async function sendNewsletterEmail(post: Post) {
  try {
    // Get all active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true },
    });

    if (subscribers.length === 0) {
      console.log("No active subscribers to send email to");
      return { success: true, sent: 0 };
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const postUrl = `${appUrl}/newsletter/${post.slug}`;

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background: #fff; padding: 30px; }
            .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The Open Draft</h1>
            </div>
            <div class="content">
              <h2>${post.title}</h2>
              ${post.excerpt ? `<p style="font-size: 16px; color: #666;">${post.excerpt}</p>` : ""}
              <a href="${postUrl}" class="button">Read Full Article</a>
              <p style="color: #666; font-size: 14px;">By ${post.author.name}</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to The Open Draft newsletter.</p>
              <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const promises = batch.map(subscriber => {
        const token = generateUnsubToken(subscriber.email);
        const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${token}`;
        return resend.emails.send({
          from: process.env.EMAIL_FROM || "newsletter@theopendraft.com",
          to: subscriber.email,
          subject: `New Post: ${post.title}`,
          html: htmlContent.replace("{{email}}", encodeURIComponent(subscriber.email)).replace("{{unsubscribeUrl}}", unsubscribeUrl),
        });
      });

      await Promise.allSettled(promises);
      sentCount += batch.length;
    }

    // Mark post as email sent
    await prisma.post.update({
      where: { id: post.id },
      data: { emailSent: true },
    });

    console.log(`Newsletter sent to ${sentCount} subscribers for post: ${post.title}`);
    return { success: true, sent: sentCount };
  } catch (error) {
    console.error("Failed to send newsletter email:", error);
    throw error;
  }
}
