import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, FileText } from "lucide-react";

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
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Info Message */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700">
            <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              We're Building Something Special
            </h2>
            <div className="text-slate-600 dark:text-slate-300 space-y-3">
              <p>Creating in-depth articles to help you understand technology in simple, clear terms.</p>
              <p className="font-medium">New content coming soon! Thank you for your patience.</p>
              <div className="pt-4">
                <a
                  href="mailto:account@theopendraft.com"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Questions or feedback? Email us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Articles */}
        {posts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50">
                Latest Articles
              </h2>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
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
                  className="group block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
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
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium rounded"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Calendar size={14} className="mr-1.5" />
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
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
