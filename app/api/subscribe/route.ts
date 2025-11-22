import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

function generateReferralCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

// Redirect subscribe to waitlist
export async function POST(req: Request) {
  try {
    // Rate limiting - 5 signups per 10 seconds per IP
    const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
    const ip = ipHeader.split(",")[0].trim();

    const { success } = await checkRateLimit(`waitlist:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, name } = subscribeSchema.parse(body);

    // Normalize email
    const emailNormalized = email.trim().toLowerCase();

    // Check if already on waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      return NextResponse.json(
        { 
          error: "You're already on the waitlist!",
          position: existing.position,
          referralCode: existing.referralCode,
        },
        { status: 400 }
      );
    }

    // Get current waitlist count to determine position
    const currentCount = await prisma.waitlist.count();
    const position = currentCount + 1;

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let codeExists = await prisma.waitlist.findUnique({ where: { referralCode } });
    while (codeExists) {
      referralCode = generateReferralCode();
      codeExists = await prisma.waitlist.findUnique({ where: { referralCode } });
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: emailNormalized,
        name: name?.trim() || null,
        position,
        referralCode,
      },
    });

    return NextResponse.json({
      success: true,
      position,
      referralCode,
      message: `You're on the waitlist! You're position #${position}.`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}
