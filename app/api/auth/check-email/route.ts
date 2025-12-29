// app/api/auth/check-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!user });
  } catch (err: any) {
    console.error("CHECK_EMAIL_ERROR →", err);
    return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
  }
}

