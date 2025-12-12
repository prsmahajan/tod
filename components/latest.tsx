import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";

export async function Latest() {
  if (!process.env.DATABASE_URL) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 text-center text-[#212121]">
          <h2 className="text-2xl font-semibold mb-4 text-black">Latest Articles</h2>
          <p>Database connection not configured. Add a DATABASE_URL to load recent posts.</p>
        </div>
      </section>
    );
  }

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      coverImage: true,
      categories: {
        include: { category: true },
      },
    },
  });

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Info Message */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-8">
            <h2 className="text-2xl font-semibold mb-4 text-black">We're Building Something Special</h2>
            <div className="text-[#212121] space-y-3">
              <p>I'm creating in-depth articles to help you understand technology in simple, clear terms.</p>
              <p>New content is coming soon! Thank you for your patience.</p>
              <p className="mt-6 text-sm">
                Questions or feedback? Reach me at{" "}
                <a href="mailto:account@theopendraft.com" className="text-[#212121] underline hover:opacity-70 transition-opacity">
                  account@theopendraft.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Latest Articles */}
        {posts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-semibold text-black">
                Latest Articles
              </h2>
              <Link
                href="/articles"
                className="text-[#212121] hover:opacity-70 font-semibold flex items-center gap-2 transition-opacity"
              >
                View All
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  className="group block bg-white border border-[#E5E5E5] hover:opacity-80 transition-opacity"
                >
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden bg-[#FAFAFA]">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {post.categories.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {post.categories.slice(0, 2).map(({ category }) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-[#FAFAFA] text-[#212121] border border-[#E5E5E5] text-xs font-medium"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-xl font-semibold mb-2 text-black line-clamp-2">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-[#212121] text-sm mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    )}

                    <div className="flex items-center text-xs text-[#212121] pt-4 border-t border-[#E5E5E5]">
                      <Calendar size={14} className="mr-1" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Latest;
