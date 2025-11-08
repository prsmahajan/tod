import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/verify?status=invalid", req.url));
  }
  const tokenHash = hashToken(token);
  const rec = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/verify?status=invalid", req.url));
  }

  // mark user verified
  await prisma.$transaction([
    prisma.user.update({ where: { email: rec.email }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.update({ where: { tokenHash }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.redirect(new URL("/verify?status=success", req.url));
}
