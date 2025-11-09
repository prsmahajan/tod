import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Generate a simple unsubscribe token
function generateUnsubToken(email: string): string {
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
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

// GET - Generate unsubscribe token (for testing or preview)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const token = generateUnsubToken(email);

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
