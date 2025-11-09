import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SavePostButton } from "@/components/SavePostButton";

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function NewsletterPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { name: true, bio: true, avatar: true },
      },
      categories: {
        include: { category: true },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <article className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/newsletter"
          className="inline-block mb-8 text-blue-600 hover:underline"
        >
          ← Back to all posts
        </Link>

        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-5xl font-bold mb-4">{post.title}</h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-gray-600">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{post.author.name}</p>
              <time className="text-sm">
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

          {post.categories.length > 0 && (
            <div className="flex gap-2 mt-4">
              {post.categories.map(({ category }) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6">
            <SavePostButton postId={post.id} showText />
          </div>
        </header>

        <div
          className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.author.bio && (
          <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">About the Author</h3>
            <p className="text-gray-600">{post.author.bio}</p>
          </div>
        )}
      </article>
    </main>
  );
}
