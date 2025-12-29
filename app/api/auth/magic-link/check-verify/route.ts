// app/api/auth/magic-link/check-verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { verifyCode } = body;

    if (!verifyCode || typeof verifyCode !== "string") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    // Find token with this verification code
    const tokenRecord = await prisma.magicLinkToken.findUnique({
      where: { verifyCode },
    });

    // Verify the code exists, was used, and hasn't expired
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    if (!tokenRecord.usedAt) {
      return NextResponse.json({ error: "Token not verified" }, { status: 401 });
    }

    if (!tokenRecord.verifyExpiresAt || tokenRecord.verifyExpiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 401 });
    }

    // Check that token was used recently (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (tokenRecord.usedAt < fiveMinutesAgo) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 401 });
    }

    // Verification successful - return email for sign-in
    return NextResponse.json({
      ok: true,
      email: tokenRecord.email,
    });
  } catch (err: any) {
    console.error("MAGIC_LINK_CHECK_VERIFY_ERROR →", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}


