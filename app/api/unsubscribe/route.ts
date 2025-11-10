import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Generate a simple unsubscribe token
// Exported for use in newsletter email generation
export function generateUnsubToken(email: string): string {
  // Simple hash of email with a secret
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  return crypto.createHash("sha256").update(email + secret).digest("hex").slice(0, 32);
}

// Verify unsubscribe token
function verifyUnsubToken(email: string, token: string): boolean {
  return generateUnsubToken(email) === token;
}

// POST - Unsubscribe user
export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Verify token
    if (!verifyUnsubToken(email, token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Find subscriber
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { message: "You are already unsubscribed" },
        { status: 200 }
      );
    }

    // Update subscriber to inactive
    await prisma.subscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

// NOTE: Unsubscribe tokens are generated server-side only when sending emails.
// No public API endpoint for token generation to prevent abuse.
