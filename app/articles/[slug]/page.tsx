import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SavePostButton } from "@/components/SavePostButton";
import { SocialShare } from "@/components/SocialShare";
import { generateSEO } from "@/components/SEOHead";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import { RelatedPosts } from "@/components/RelatedPosts";
import { TableOfContents } from "@/components/TableOfContents";
import { PostViews } from "@/components/PostViews";
import { Clock } from "lucide-react";

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  if (!post) {
    return {};
  }

  return generateSEO({
    title: post.title,
    description: post.excerpt || `Read ${post.title} on The Open Draft - Technology explained simply while feeding stray animals in India.`,
    image: post.coverImage || undefined,
    url: `/articles/${params.slug}`,
    type: 'article',
    publishedTime: post.publishedAt?.toISOString(),
    author: post.author.name,
  });
}

export default async function NewsletterPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      status: true,
      slug: true,
      views: true,
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

  const readingTime = calculateReadingTime(post.content);

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
            <article className="max-w-3xl">
              <Link
                href="/articles"
                className="inline-block mb-8 text-[#212121] underline hover:opacity-70 transition-opacity"
              >
                ← Back to all posts
              </Link>

              {post.coverImage && (
                <div className="mb-8 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              <header className="mb-8">
                <h1 className="text-4xl font-semibold mb-4 text-black">{post.title}</h1>

                {post.excerpt && (
                  <p className="text-base text-[#212121] mb-6 leading-relaxed">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-4 text-[#212121] mb-6">
                  {post.author.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-black">{post.author.name}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <time>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </time>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatReadingTime(readingTime)}</span>
                      </div>
                      <span>•</span>
                      <PostViews postId={post.id} initialViews={post.views} />
                    </div>
                  </div>
                </div>

                {post.categories.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {post.categories.map(({ category }) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-[#FAFAFA] text-[#212121] border border-[#E5E5E5] text-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <SavePostButton postId={post.id} showText />
                </div>
              </header>

              <div
                className="prose prose-lg max-w-none bg-white"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Social Sharing */}
              <div className="mt-8 p-6 bg-[#FAFAFA] border border-[#E5E5E5]">
                <SocialShare
                  url={`/articles/${post.slug}`}
                  title={post.title}
                  description={post.excerpt || undefined}
                />
              </div>

              {post.author.bio && (
                <div className="mt-12 p-6 bg-[#FAFAFA] border border-[#E5E5E5]">
                  <h3 className="font-semibold text-lg mb-2 text-black">About the Author</h3>
                  <p className="text-[#212121]">{post.author.bio}</p>
                </div>
              )}

              {/* Related Posts */}
              <RelatedPosts
                currentPostId={post.id}
                categoryIds={post.categories.map(c => c.category.id)}
              />
            </article>

            {/* Table of Contents - Right Sidebar */}
            <aside className="hidden lg:block">
              <TableOfContents content={post.content} />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
