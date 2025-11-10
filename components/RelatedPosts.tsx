import { prisma } from "@/lib/db";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";

interface RelatedPostsProps {
  currentPostId: string;
  categoryIds: string[];
}

export async function RelatedPosts({ currentPostId, categoryIds }: RelatedPostsProps) {
  // Find related posts based on shared categories
  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      status: "PUBLISHED",
      categories: categoryIds.length > 0 ? {
        some: {
          categoryId: { in: categoryIds },
        },
      } : undefined,
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      categories: {
        include: { category: true },
      },
    },
  });

  // If no related posts based on categories, get latest posts
  const postsToShow = relatedPosts.length > 0
    ? relatedPosts
    : await prisma.post.findMany({
        where: {
          id: { not: currentPostId },
          status: "PUBLISHED",
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          publishedAt: true,
          categories: {
            include: { category: true },
          },
        },
      });

  if (postsToShow.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t-2 border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
        <Link
          href="/newsletter"
          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 group text-sm"
        >
          View All
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {postsToShow.map((post) => {
          const readingTime = calculateReadingTime(post.content);

          return (
            <Link
              key={post.id}
              href={`/newsletter/${post.slug}`}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200"
            >
              {post.coverImage && (
                <div className="relative h-40 overflow-hidden bg-gray-200">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                {post.categories.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {post.categories.slice(0, 2).map(({ category }) => (
                      <span
                        key={category.id}
                        className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <time>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </time>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatReadingTime(readingTime)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
