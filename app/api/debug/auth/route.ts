import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    // Get token from JWT
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Get session
    const session = await getServerSession();

    // Get cookies
    const cookies = request.cookies.getAll();

    // Get headers
    const host = request.headers.get("host");
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      host,
      origin,
      referer,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      token: token ? {
        hasToken: true,
        role: (token as any).role,
        name: token.name,
        email: token.email,
        uid: (token as any).uid,
        emailVerified: (token as any).emailVerified,
      } : { hasToken: false },
      session: session ? {
        hasSession: true,
        user: session.user,
        role: (session as any).user?.role,
      } : { hasSession: false },
      cookies: cookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0,
      })),
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
