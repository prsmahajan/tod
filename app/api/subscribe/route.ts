import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appendSubscriberToSheet } from "@/lib/google-sheets";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { WelcomeEmail } from "@/lib/email-templates";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Rate limiting - 5 subscriptions per 10 seconds per IP
    const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
    const ip = ipHeader.split(",")[0].trim();

    const { success } = await checkRateLimit(`subscribe:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, name } = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "You're already subscribed!" },
          { status: 400 }
        );
      }

      // Reactivate if previously unsubscribed
      const updated = await prisma.subscriber.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null, name },
      });

      // Append to Google Sheet
      await appendSubscriberToSheet({
        email: updated.email,
        name: updated.name,
        subscribedAt: updated.subscribedAt,
      });

      return NextResponse.json({ success: true, message: "Subscription reactivated!" });
    }

    // Create new subscriber in database
    const subscriber = await prisma.subscriber.create({
      data: { email, name },
    });

    // Append to Google Sheet
    await appendSubscriberToSheet({
      email: subscriber.email,
      name: subscriber.name,
      subscribedAt: subscriber.subscribedAt,
    });

    // Send welcome email
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: subscriber.email,
        subject: "Welcome to The Open Draft!",
        react: WelcomeEmail({
          subscriberName: subscriber.name || undefined,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ success: true, message: "Successfully subscribed!" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
