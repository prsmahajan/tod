// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const runtime = "nodejs";

// ---------- tiny, in-memory rate limit (per instance) ----------
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

// ---------- validation ----------
const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|`~]/, "Password must include at least one symbol");

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: passwordPolicy,
});

// ---------- helpers ----------
function titleCase(str: string) {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ---------- main handler ----------
export async function POST(req: Request) {
  const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const ip = ipHeader.split(",")[0].trim();
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    // 1) parse & normalize
    const body = await req.json();
    console.log('[SIGNUP] Signup attempt');
    const { name, email, password } = schema.parse(body);
    const emailNorm = email.trim().toLowerCase();
    const nameNorm = titleCase(name);

    // 2) Check user limit (TEMPORARILY DISABLED for initial setup)
    const userCount = await prisma.user.count();
    console.log('[SIGNUP] Current user count:', userCount);
    // User limit temporarily disabled to allow owner to sign up
    // TODO: Re-enable after initial admin setup
    // if (userCount >= 3) {
    //   console.log('[SIGNUP] User limit reached');
    //   return NextResponse.json(
    //     { error: "Maximum user limit reached. Contact admin for access." },
    //     { status: 403 }
    //   );
    // }

    // 3) duplicate email check
    const exists = await prisma.user.findUnique({
      where: { email: emailNorm },
      select: { id: true, emailVerified: true },
    });
    if (exists) {
      console.log('[SIGNUP] Email already exists:', emailNorm);
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 }
      );
    }

    // 4) create user (first user OR first admin becomes ADMIN automatically)
    const passwordHash = await bcrypt.hash(password, 12);
    const isFirstUser = userCount === 0;

    // Check if there's any admin yet
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    const shouldBeAdmin = isFirstUser || adminCount === 0;

    console.log('[SIGNUP] Creating user:', {
      email: emailNorm,
      isFirstUser,
      adminCount,
      shouldBeAdmin,
      role: shouldBeAdmin ? 'ADMIN' : 'USER'
    });

    await prisma.user.create({
      data: {
        name: nameNorm,
        email: emailNorm,
        passwordHash,
        role: shouldBeAdmin ? "ADMIN" : "USER",
        emailVerified: shouldBeAdmin ? new Date() : null, // Admin auto-verified
      },
    });

    console.log('[SIGNUP] User created successfully');

    // 5) create verification token + send email (skip for admin - already verified)
    if (!shouldBeAdmin) {
      try {
        const rawToken = await createEmailVerificationToken(emailNorm);
        const base =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.APP_URL ||
          new URL(req.url).origin;
        const verifyUrl = `${base}/verify?token=${encodeURIComponent(rawToken)}`;

        await sendVerificationEmail(emailNorm, verifyUrl);
      } catch (emailErr: any) {
      console.error("EMAIL_FLOW_ERROR →", emailErr);
      const msg = String(emailErr?.message ?? "").toLowerCase();
      const mailError =
        emailErr?.name === "ResendError" ||
        msg.includes("resend") ||
        msg.includes("smtp") ||
        msg.includes("mail") ||
        msg.includes("invalid from") ||
        msg.includes("unauthorized") ||
        msg.includes("apikey") ||
        msg.includes("domain") ||
        msg.includes("dns") ||
        msg.includes("app_url");

      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? `Email send failed: ${emailErr?.message || emailErr}`
              : mailError
              ? "We couldn't send the verification email. Check mail settings and try again."
              : "We couldn't complete email verification. Try again shortly.",
        },
        { status: 502 }
      );
      }
    }

    // 6) success
    return NextResponse.json(
      {
        ok: true,
        message: shouldBeAdmin
          ? "Admin account created! You can now access the admin panel."
          : "Account created! Check your email for verification.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("SIGNUP_ERROR →", err);

    // zod validation
    if (err?.issues?.length) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }

    // Prisma duplicate race
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 }
      );
    }

    // Mailer / ENV errors (fallback)
    const msg = String(err?.message ?? "");
    const lower = msg.toLowerCase();
    if (
      err?.name === "ResendError" ||
      lower.includes("resend") ||
      lower.includes("smtp") ||
      lower.includes("mail") ||
      lower.includes("invalid from") ||
      lower.includes("unauthorized") ||
      lower.includes("apikey") ||
      lower.includes("domain") ||
      lower.includes("dns") ||
      lower.includes("app_url")
    ) {
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? `Email send failed: ${msg}`
              : "We couldn't send the verification email. Check mail settings and try again.",
        },
        { status: 502 }
      );
    }

    // DEV mode: show full error
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          error: msg || err?.name || "Unknown error",
          code: err?.code,
        },
        { status: 500 }
      );
    }

    // Fallback for production
    return NextResponse.json({ error: "Unexpected error during sign up." }, { status: 500 });
  }
}
