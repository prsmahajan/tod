import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      NEXTAUTH_SECRET: {
        set: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
      },
      NEXTAUTH_URL: {
        set: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || "NOT SET",
      },
      DATABASE_URL: {
        set: !!process.env.DATABASE_URL,
        startsWithPostgresql: process.env.DATABASE_URL?.startsWith("postgresql://") || false,
      },
      RESEND_API_KEY: {
        set: !!process.env.RESEND_API_KEY,
        length: process.env.RESEND_API_KEY?.length || 0,
      },
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: {
        set: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        value: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "NOT SET",
      },
    },
    criticalMissing: [] as string[],
    warnings: [] as string[],
  };

  // Check critical variables
  if (!envCheck.checks.NEXTAUTH_SECRET.set) {
    envCheck.criticalMissing.push("NEXTAUTH_SECRET is required for authentication to work");
  }

  if (!envCheck.checks.NEXTAUTH_URL.set) {
    envCheck.criticalMissing.push("NEXTAUTH_URL is required for authentication to work");
  }

  if (!envCheck.checks.DATABASE_URL.set) {
    envCheck.criticalMissing.push("DATABASE_URL is required for database access");
  }

  // Warnings
  if (!envCheck.checks.RESEND_API_KEY.set) {
    envCheck.warnings.push("RESEND_API_KEY not set - email sending will fail");
  }

  if (envCheck.checks.NEXTAUTH_URL.value && !envCheck.checks.NEXTAUTH_URL.value.startsWith("https://")) {
    if (process.env.NODE_ENV === "production") {
      envCheck.warnings.push("NEXTAUTH_URL should use https:// in production");
    }
  }

  const status = envCheck.criticalMissing.length > 0 ? 500 : 200;

  return NextResponse.json(envCheck, { status });
}
