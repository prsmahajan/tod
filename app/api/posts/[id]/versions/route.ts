import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// GET all versions for a post
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const versions = await prisma.postVersion.findMany({
      where: { postId: params.id },
      orderBy: { versionNumber: "desc" },
      select: {
        id: true,
        versionNumber: true,
        title: true,
        changeNote: true,
        createdAt: true,
        createdById: true,
      },
    });

    // Get user names for the versions
    const userIds = [...new Set(versions.map((v) => v.createdById))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const versionsWithUsers = versions.map((v) => ({
      ...v,
      createdBy: userMap.get(v.createdById) || { name: "Unknown" },
    }));

    return NextResponse.json(versionsWithUsers);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

// GET a specific version
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { versionId } = body;

    const version = await prisma.postVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.postId !== params.id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error("Error fetching version:", error);
    return NextResponse.json({ error: "Failed to fetch version" }, { status: 500 });
  }
}
