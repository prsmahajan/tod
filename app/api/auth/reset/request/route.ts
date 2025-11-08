import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string") throw new Error("bad");

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
