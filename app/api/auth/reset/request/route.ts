import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string") throw new Error("bad");

    // Rate limiting - 3 password resets per minute per IP
    const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
    const ip = ipHeader.split(",")[0].trim();

    const { success } = await checkAuthRateLimit(`reset:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Try again later." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
    // Always respond success to avoid enumeration
    if (!user) return NextResponse.json({ ok: true });

    const raw = await createPasswordResetToken(user.id);
    const base = process.env.APP_URL!;
    const url = `${base}/reset/confirm?token=${encodeURIComponent(raw)}`;
    await sendPasswordResetEmail(email, url);

    return NextResponse.json({ ok: true });
  } catch {
    // Still mask
    return NextResponse.json({ ok: true });
  }
}
