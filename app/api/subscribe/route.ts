import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appendSubscriberToSheet } from "@/lib/google-sheets";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
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
