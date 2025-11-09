"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedPosts, setSavedPosts] = useState<SavedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchSavedPosts();
    }
  }, [status, router]);

  async function fetchSavedPosts() {
    try {
      const res = await fetch("/api/saved-posts");
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
      });

      if (res.ok) {
        setSavedPosts(savedPosts.filter((sp) => sp.post.id !== postId));
      } else {
        alert("Failed to remove post");
      }
    } catch (error) {
      console.error("Failed to remove saved post:", error);
      alert("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Bookmark size={36} className="text-blue-600" />
            Saved Posts
          </h1>
          <p className="text-gray-600">
            Your collection of bookmarked articles
          </p>
        </div>

        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bookmark size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">No saved posts yet</h2>
            <p className="text-gray-600 mb-6">
              Start saving posts you want to read later by clicking the bookmark icon
            </p>
            <Link
              href="/newsletter"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Posts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPosts.map((savedPost) => (
              <div
                key={savedPost.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 group"
              >
                {savedPost.post.coverImage && (
                  <div className="h-48 overflow-hidden bg-gray-200">
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
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href={`/newsletter/${savedPost.post.slug}`}>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {savedPost.post.title}
                    </h3>
                  </Link>

                  {savedPost.post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {savedPost.post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
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
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
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
