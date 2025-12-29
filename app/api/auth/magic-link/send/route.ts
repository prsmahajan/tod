// app/api/auth/magic-link/send/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMagicLinkToken } from "@/lib/tokens";
import { sendMagicLinkEmail } from "@/lib/mail";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export async function POST(req: Request) {
  // Rate limiting - 5 requests per minute per IP
  const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const ip = ipHeader.split(",")[0].trim();

  const { success } = await checkAuthRateLimit(`magic-link:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    const emailNorm = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 404 }
      );
    }

    // Create magic link token
    const token = await createMagicLinkToken(emailNorm);
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/auth/magic-link/verify?token=${encodeURIComponent(token)}`;

    // Send email
    await sendMagicLinkEmail(emailNorm, url);

    return NextResponse.json({
      ok: true,
      message: "Magic link sent! Check your email to sign in.",
    });
  } catch (err: any) {
    console.error("MAGIC_LINK_SEND_ERROR →", err);

    if (err?.issues?.length) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }

    if (err?.message?.includes("Resend") || err?.message?.includes("email")) {
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? `Email send failed: ${err.message}`
              : "We couldn't send the magic link. Check mail settings and try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? err.message : "Failed to send magic link." },
      { status: 500 }
    );
  }
}


