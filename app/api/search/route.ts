import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const categoryId = searchParams.get("category");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const searchQuery = query.trim().toLowerCase();

    // Build where clause
    const where: any = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { excerpt: { contains: searchQuery, mode: "insensitive" } },
        { content: { contains: searchQuery, mode: "insensitive" } },
      ],
    };

    // Add category filter if provided
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    const posts = await prisma.post.findMany({
      where,
      take: 20,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ posts, count: posts.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
