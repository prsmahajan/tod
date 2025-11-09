// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Extract subdomain
  const isQuirkySubdomain = hostname.startsWith("quirky.");
  const isMainDomain = !hostname.startsWith("quirky.") &&
                       (hostname.includes("theopendraft.com") ||
                        hostname.includes("localhost") ||
                        hostname.includes("vercel.app"));

  // Admin routes - check authentication
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('[MIDDLEWARE] Admin access attempt');
    console.log('[MIDDLEWARE] Path:', pathname);
    console.log('[MIDDLEWARE] Host:', hostname);
    console.log('[MIDDLEWARE] Token found:', !!token);
    if (token) {
      console.log('[MIDDLEWARE] User role:', (token as any).role);
    }

    if (!token) {
      console.log('[MIDDLEWARE] No token - redirecting to login');
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    const userRole = (token as any).role;
    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(userRole)) {
      console.log('[MIDDLEWARE] User not admin - redirecting home');
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log('[MIDDLEWARE] Admin access granted');
    return NextResponse.next();
  }

  // Dashboard, account, settings - require auth on any domain
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/settings")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*", "/settings/:path*"],
};
