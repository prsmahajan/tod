import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// GET all posts (with filtering)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");

    // Check authentication
    const session = await getServerSession(authOptions);
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    const isAuthorized = user && ["ADMIN", "EDITOR", "AUTHOR"].includes(user.role);

    const where: any = {};

    // Only authenticated users can filter by status
    // Unauthenticated users only see PUBLISHED posts
    if (isAuthorized) {
      if (status) where.status = status;
      if (authorId) where.authorId = authorId;
    } else {
      // Public access - only published posts
      where.status = "PUBLISHED";
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        categories: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// CREATE new post
export async function POST(req: Request) {
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
    const {
      title,
      slug,
      excerpt,
      content,
      contentMarkdown,
      coverImage,
      status,
      publishedAt,
      scheduledFor,
      categoryIds,
    } = body;

    // Create slug from title if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        contentMarkdown,
        coverImage,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : publishedAt,
        scheduledFor,
        authorId: user.id,
        categories: categoryIds
          ? {
              create: categoryIds.map((catId: string) => ({
                category: { connect: { id: catId } },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: { include: { category: true } },
      },
    });

    // Send newsletter email when publishing
    if (status === "PUBLISHED" && !post.emailSent) {
      try {
        const { sendNewsletterEmail } = await import("@/lib/newsletter");
        await sendNewsletterEmail(post as any);
      } catch (emailError) {
        console.error("Failed to send newsletter email:", emailError);
        // Don't fail the post creation if email fails
      }
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
