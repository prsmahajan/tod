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

  // Admin routes should ONLY work on quirky subdomain
  if (pathname.startsWith("/admin")) {
    if (!isQuirkySubdomain) {
      // Redirect to quirky subdomain
      const quirkyUrl = new URL(request.url);
      quirkyUrl.host = hostname.replace(/^(www\.)?/, "quirky.");

      // If localhost, use quirky.localhost
      if (hostname.includes("localhost")) {
        quirkyUrl.host = `quirky.${hostname}`;
      }

      return NextResponse.redirect(quirkyUrl);
    }

    // On quirky subdomain - check authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    const userRole = (token as any).role;
    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

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
