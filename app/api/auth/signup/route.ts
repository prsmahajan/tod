// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string, windowMs = 60_000, max = 20) {
  const now = Date.now();
  const rec = hits.get(ip) ?? { count: 0, ts: now };
  if (now - rec.ts > windowMs) {
    rec.count = 0;
    rec.ts = now;
  }
  rec.count++;
  hits.set(ip, rec);
  return rec.count <= max;
}

const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/, "Password must include at least one symbol");

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: passwordPolicy,
});

export async function POST(req: Request) {
  // --- RATE LIMIT CHECK ---
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    // Fast check to give immediate UX feedback
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 } // Conflict
      );
    }

    // Hash & create (race-safe with unique constraint)
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email, passwordHash } });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    // If validation failed, show the first Zod message
    if (err?.issues?.length) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }

    // Handle unique constraint race (P2002)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Fallback
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
