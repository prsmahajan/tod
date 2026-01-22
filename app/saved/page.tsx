"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/appwrite/auth";
import Link from "next/link";
import { Bookmark, Calendar, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

interface SavedPostData {
  id: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: string | null;
    author: {
      id: string;
      name: string;
      email: string;
    };
    categories: Array<{
      category: {
        id: string;
        name: string;
      };
    }>;
  };
}

export default function SavedPostsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedPosts, setSavedPosts] = useState<SavedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchSavedPosts();
      }
    }
  }, [user, authLoading, router]);

  async function fetchSavedPosts() {
    try {
      const res = await fetch("/api/saved-posts", {
        headers: {
          "x-user-email": user?.email || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(postId: string) {
    if (!confirm("Remove this post from your saved list?")) return;

    setRemovingId(postId);
    try {
      const res = await fetch(`/api/saved-posts?postId=${postId}`, {
        method: "DELETE",
        headers: {
          "x-user-email": user?.email || "",
        },
      });

      if (res.ok) {
        setSavedPosts(savedPosts.filter((sp) => sp.post.id !== postId));
      } else {
        toast.error("Failed to remove post");
      }
    } catch (error) {
      console.error("Failed to remove saved post:", error);
      toast.error("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#212121]" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold mb-2 flex items-center gap-3 text-black">
            <Bookmark size={36} className="text-[#DC2626]" />
            Saved Posts
          </h1>
          <p className="text-[#212121]">
            Your collection of bookmarked articles
          </p>
        </div>

        {savedPosts.length === 0 ? (
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-12 text-center">
            <Bookmark size={64} className="mx-auto mb-4 text-[#E5E5E5]" />
            <h2 className="text-2xl font-semibold mb-2 text-black">No saved posts yet</h2>
            <p className="text-[#212121] mb-6">
              Start saving posts you want to read later by clicking the bookmark icon
            </p>
            <Link
              href="/articles"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
            >
              Browse Posts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {savedPosts.map((savedPost) => (
              <div
                key={savedPost.id}
                className="bg-white border border-[#E5E5E5] hover:opacity-80 transition-opacity"
              >
                {savedPost.post.coverImage && (
                  <div className="h-48 overflow-hidden bg-[#FAFAFA]">
                    <img
                      src={savedPost.post.coverImage}
                      alt={savedPost.post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {savedPost.post.categories.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {savedPost.post.categories.slice(0, 2).map(({ category }) => (
                        <span
                          key={category.id}
                          className="px-2 py-1 bg-[#FAFAFA] text-[#212121] border border-[#E5E5E5] text-xs font-medium"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href={`/articles/${savedPost.post.slug}`}>
                    <h3 className="text-xl font-semibold mb-2 text-black hover:opacity-70 transition-opacity line-clamp-2">
                      {savedPost.post.title}
                    </h3>
                  </Link>

                  {savedPost.post.excerpt && (
                    <p className="text-[#212121] text-sm mb-4 line-clamp-3 leading-relaxed">
                      {savedPost.post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
                    <div className="flex items-center text-xs text-[#212121]">
                      <Calendar size={14} className="mr-1" />
                      {savedPost.post.publishedAt
                        ? new Date(savedPost.post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </div>

                    <button
                      onClick={() => handleRemove(savedPost.post.id)}
                      disabled={removingId === savedPost.post.id}
                      className="flex items-center gap-1 text-[#DC2626] hover:opacity-70 text-sm font-medium disabled:opacity-50 transition-opacity"
                    >
                      {removingId === savedPost.post.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
