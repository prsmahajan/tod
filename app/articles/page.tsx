import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/SearchBar";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";
// Revalidate every 60 seconds for Vercel (ISR)
export const revalidate = 60;

export default async function ArticlesPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <h1 className="text-3xl font-semibold mb-4 text-black">Articles</h1>
          <p className="text-base text-[#212121]">Database connection not configured.</p>
        </div>
      </main>
    );
  }

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold mb-4 text-black">Articles</h1>
          <p className="text-base text-[#212121]">
            Helping you understand the technology that runs your systems
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar />
        </div>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#212121] text-base">No posts published yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-[#E5E5E5] p-8 hover:opacity-80 transition-opacity"
              >
                {post.coverImage && (
                  <div className="mb-6 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <Link href={`/articles/${post.slug}`}>
                  <h2 className="text-2xl font-semibold mb-3 hover:opacity-70 transition-opacity text-black">
                    {post.title}
                  </h2>
                </Link>

                {post.excerpt && (
                  <p className="text-[#212121] mb-4 text-base leading-relaxed">{post.excerpt}</p>
                )}

                <div className="flex items-center justify-between text-sm text-[#212121] pt-4 border-t border-[#E5E5E5]">
                  <div className="flex items-center gap-2">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span>By {post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <time>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </time>
                  </div>
                </div>

                <Link
                  href={`/articles/${post.slug}`}
                  className="inline-block mt-4 text-[#212121] font-semibold underline hover:opacity-70 transition-opacity"
                >
                  Read more →
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
