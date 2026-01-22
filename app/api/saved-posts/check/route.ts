import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

// GET - Check if a post is saved
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ saved: false });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    return NextResponse.json({ saved: !!savedPost });
  } catch (error) {
    console.error("Failed to check saved status:", error);
    return NextResponse.json({ saved: false });
  }
}
