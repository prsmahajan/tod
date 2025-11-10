import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";

export async function Latest() {
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
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Info Message */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">We're Building Something Special 🚀</h2>
            <div className="text-gray-600 space-y-3">
              <p>I'm creating in-depth articles to help you understand technology in simple, clear terms.</p>
              <p>New content is coming soon! Thank you for your patience.</p>
              <p className="mt-6 text-sm">
                Questions or feedback? Reach me at{" "}
                <a href="mailto:tod@theopendraft.com" className="text-blue-600 font-semibold hover:underline">
                  account@theopendraft.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Latest Articles */}
        {posts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold">
                <span className="font-serif bg-gradient-to-r from-gray-400 to-gray-900 bg-clip-text text-transparent">
                  Latest Articles
                </span>
              </h2>
              <Link
                href="/newsletter"
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 group"
              >
                View All
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/newsletter/${post.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200"
                >
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden bg-gray-200">
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
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    )}

                    <div className="flex items-center text-xs text-gray-500">
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