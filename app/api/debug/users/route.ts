import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const userCount = users.length;

    return NextResponse.json({
      count: userCount,
      limit: 3,
      limitReached: userCount >= 3,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        emailVerified: !!u.emailVerified,
        createdAt: u.createdAt,
      })),
      message: userCount >= 3
        ? "User limit reached. If you're one of these users, use /login instead of /signup. To delete test users, contact admin."
        : `${userCount} of 3 users registered. ${3 - userCount} spots remaining.`,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
