// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

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
  // Rate limiting - 3 signups per minute per IP
  const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const ip = ipHeader.split(",")[0].trim();

  const { success } = await checkAuthRateLimit(`signup:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }

  try {
    // 1) parse & normalize
    const body = await req.json();
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

    // 4) create user
    const passwordHash = await bcrypt.hash(password, 12);
    const isFirstUser = userCount === 0;

    console.log('[SIGNUP] Creating user:', {
      email: emailNorm,
      userCount,
      isFirstUser,
      role: isFirstUser ? 'ADMIN' : 'SUBSCRIBER',
      requiresEmailVerification: !isFirstUser,
    });

    // First user is auto-admin with verified email
    // All other users are subscribers requiring email verification
    await prisma.user.create({
      data: {
        name: nameNorm,
        email: emailNorm,
        passwordHash,
        role: isFirstUser ? "ADMIN" : "SUBSCRIBER",
        emailVerified: isFirstUser ? new Date() : null,
      },
    });

    console.log(`[SIGNUP] User created successfully as ${isFirstUser ? 'ADMIN (first user)' : 'USER'}`);

    // 5) Send verification email for non-first users
    if (!isFirstUser) {
      const raw = await createEmailVerificationToken(emailNorm);
      const base = process.env.APP_URL!;
      const url = `${base}/verify?token=${encodeURIComponent(raw)}`;
      await sendVerificationEmail(emailNorm, url);
    }

    // 6) success
    return NextResponse.json(
      {
        ok: true,
        message: isFirstUser
          ? "Admin account created! You can now access the admin panel."
          : "Account created! Check your email to verify your account.",
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
