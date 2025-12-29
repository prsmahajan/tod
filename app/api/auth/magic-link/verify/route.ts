// app/api/auth/magic-link/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken, generateToken } from "@/lib/tokens";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    const tokenHash = hashToken(token);

    // Find and validate token
    const tokenRecord = await prisma.magicLinkToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/login?error=expired_token", req.url));
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=user_not_found", req.url));
    }

    // Generate verification code for the complete page (expires in 5 minutes)
    const verifyCode = generateToken();
    const verifyExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Mark token as used and store verification code
    await prisma.magicLinkToken.update({
      where: { tokenHash },
      data: { 
        usedAt: new Date(),
        verifyCode,
        verifyExpiresAt,
      },
    });

    // Redirect to complete page with verification code
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const redirectUrl = `/auth/magic-link/complete?verify=${encodeURIComponent(verifyCode)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (err: any) {
    console.error("MAGIC_LINK_VERIFY_ERROR →", err);
    return NextResponse.redirect(new URL("/login?error=verification_failed", req.url));
  }
}
