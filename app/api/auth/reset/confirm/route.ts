import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]/, "Password must include at least one symbol");

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    const pwd = passwordPolicy.parse(password);

    const tokenHash = hashToken(String(token));
    const rec = await prisma.passResetToken.findUnique({ where: { tokenHash } });
    if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(pwd, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } }),
      prisma.passResetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message ?? "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
