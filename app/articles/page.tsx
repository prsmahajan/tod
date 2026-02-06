import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/SearchBar";
import { Calendar } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles - Tech Education for Animal Welfare",
  description: "Read insightful technology articles on The Open Draft. Every read supports feeding stray animals across India. Simple explanations, real impact.",
  openGraph: {
    title: "Articles | The Open Draft",
    description: "Tech articles that make a difference. Every read supports stray animal welfare in India.",
    url: "https://theopendraft.com/articles",
  },
};

// Revalidate every 60 seconds for Vercel (ISR)
export const revalidate = 60;

export default async function ArticlesPage() {
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
    <>
      <main className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-24">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 text-[var(--color-text-primary)]">
                Articles
              </h1>
              <p className="text-base text-[var(--color-text-secondary)]">
                Helping you understand the technology that runs your systems
              </p>
            </div>
          </AnimatedSection>

          {/* Search Bar */}
          <AnimatedSection>
            <div className="mb-12 max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-[var(--color-text-secondary)] text-base">
                  No posts published yet. Check back soon!
                </p>
              </div>
            ) : (
              posts.map((post, index) => (
                <AnimatedSection key={post.id} direction={index % 2 === 0 ? "left" : "right"}>
                  <article className="bg-[var(--color-card-bg)] rounded-lg overflow-hidden border border-[var(--color-border)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                    {post.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      <Link href={`/articles/${post.slug}`}>
                        <h2 className="font-heading text-xl font-bold mb-3 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
                          {post.title}
                        </h2>
                      </Link>

                      {post.excerpt && (
                        <p className="text-[var(--color-text-secondary)] mb-4 text-sm leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pb-4 border-b border-[var(--color-border)]">
                          <div className="flex items-center gap-2">
                            {post.author.avatar && (
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <time>
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : ""}
                            </time>
                          </div>
                        </div>

                        <Link
                          href={`/articles/${post.slug}`}
                          className="inline-block mt-4 text-[var(--color-accent)] text-sm font-medium hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          Read more →
                        </Link>
                      </div>
                    </div>
                  </article>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
