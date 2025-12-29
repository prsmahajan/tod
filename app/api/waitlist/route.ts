import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { WaitlistWelcomeEmail } from "@/lib/email-templates";
import crypto from "crypto";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  city: z.string().optional(),
  referredBy: z.string().optional(),
  source: z.string().optional(),
});

function generateReferralCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

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
    const { email, name, city, referredBy, source } = waitlistSchema.parse(body);

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

    // Handle referral code - if referredBy is a code (not email), look up the referrer's email
    let referrerEmail: string | null = null;
    if (referredBy) {
      const referredByNormalized = referredBy.trim();
      if (referredByNormalized.includes("@")) {
        // It's an email
        referrerEmail = referredByNormalized.toLowerCase();
      } else {
        // It's a referral code - look up the referrer
        const referrer = await prisma.waitlist.findUnique({
          where: { referralCode: referredByNormalized.toUpperCase() },
          select: { email: true },
        });
        if (referrer) {
          referrerEmail = referrer.email;
        }
      }
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
        city: city?.trim() || null,
        referredBy: referrerEmail,
        source: source?.trim() || null,
        position,
        referralCode,
      },
    });

    // Send welcome email
    try {
      const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://theopendraft.com";
      const dashboardUrl = `${baseUrl}/waitlist-dashboard?code=${referralCode}`;
      
      await resend.emails.send({
        from: EMAIL_FROM,
        to: waitlistEntry.email,
        subject: `🎉 Welcome! You're Feeder #${position}`,
        react: WaitlistWelcomeEmail({
          name: waitlistEntry.name || undefined,
          position,
          referralCode,
          dashboardUrl,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the signup if email fails
    }

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

    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Get waitlist stats or individual position
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const referralCode = searchParams.get("code");
    const email = searchParams.get("email");

    if (referralCode) {
      // Get waitlist entry by referral code
      const entry = await prisma.waitlist.findUnique({
        where: { referralCode },
        select: {
          position: true,
          referralCode: true,
          email: true,
          name: true,
          joinedAt: true,
        },
      });

      if (!entry) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 404 }
        );
      }

      // Count referrals
      const referralCount = await prisma.waitlist.count({
        where: { referredBy: entry.email },
      });

      // Get total count
      const totalCount = await prisma.waitlist.count();

      return NextResponse.json({
        position: entry.position,
        referralCode: entry.referralCode,
        referralCount,
        totalCount,
        remaining: Math.max(0, 1000 - totalCount),
      });
    }

    if (email) {
      // Get waitlist entry by email
      const entry = await prisma.waitlist.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          position: true,
          referralCode: true,
        },
      });

      if (!entry) {
        return NextResponse.json(
          { error: "Email not found on waitlist" },
          { status: 404 }
        );
      }

      return NextResponse.json(entry);
    }

    // Return total count only
    const totalCount = await prisma.waitlist.count();
    return NextResponse.json({ totalCount, remaining: Math.max(0, 1000 - totalCount) });
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist data" },
      { status: 500 }
    );
  }
}

