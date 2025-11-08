import crypto from "crypto";
import { prisma } from "@/lib/db";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createEmailVerificationToken(email: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await prisma.emailVerificationToken.create({ data: { email, tokenHash, expiresAt } });
  return token;
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15m
  await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  return token;
}
