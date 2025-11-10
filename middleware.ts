// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  console.log('[MIDDLEWARE] Request:', {
    pathname,
    hostname,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
  });

  // Admin routes - check authentication
  if (pathname.startsWith("/admin")) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      console.log('[MIDDLEWARE] Admin access attempt:', {
        pathname,
        hostname,
        hasToken: !!token,
        tokenData: token ? {
          role: (token as any).role,
          email: token.email,
          name: token.name,
          uid: (token as any).uid,
        } : null,
      });

      if (!token) {
        console.log('[MIDDLEWARE] No token - redirecting to login');
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has admin role
      const userRole = (token as any).role;
      console.log('[MIDDLEWARE] User role check:', { userRole, allowedRoles: ["ADMIN", "EDITOR", "AUTHOR"] });

      if (!["ADMIN", "EDITOR", "AUTHOR"].includes(userRole)) {
        console.log('[MIDDLEWARE] User not admin - redirecting home');
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log('[MIDDLEWARE] Admin access granted');
      return NextResponse.next();
    } catch (error: any) {
      console.error('[MIDDLEWARE] Error in admin check:', error.message, error.stack);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "auth_error");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Dashboard, account, settings - require auth on any domain
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/settings")
  ) {
    try {
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
    } catch (error: any) {
      console.error('[MIDDLEWARE] Error in auth check:', error.message);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*", "/settings/:path*"],
};
