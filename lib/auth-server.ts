import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Get authenticated user from request
 * Supports Appwrite authentication via x-user-email header
 */
export async function getAuthenticatedUser(req: NextRequest | Request) {
  // Check x-user-email header (set by client when using Appwrite)
  const userEmail = req.headers.get("x-user-email");
  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    });
    return user;
  }

  return null;
}

/**
 * Check if user is authenticated and has required role
 */
export async function requireAuth(
  req: NextRequest | Request,
  requiredRoles?: string[]
): Promise<{ user: any; error?: never } | { user?: never; error: NextResponse }> {
  const { NextResponse } = await import("next/server");
  
  const user = await getAuthenticatedUser(req);
  
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as any,
    };
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) as any,
    };
  }

  return { user };
}
