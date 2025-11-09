import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function NewsletterPage() {
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Newsletter</h1>
          <p className="text-xl text-gray-600">
            Helping you understand the technology that runs your systems
          </p>
        </div>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts published yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                {post.coverImage && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <Link href={`/newsletter/${post.slug}`}>
                  <h2 className="text-3xl font-bold mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>

                {post.excerpt && (
                  <p className="text-gray-600 mb-4 text-lg">{post.excerpt}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
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

                <Link
                  href={`/newsletter/${post.slug}`}
                  className="inline-block mt-4 text-blue-600 font-semibold hover:underline"
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
