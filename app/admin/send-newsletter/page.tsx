"use client";

import { useEffect, useState } from "react";
import { Mail, Send, CheckCircle, XCircle, Loader } from "lucide-react";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  publishedAt: Date | null;
  status: string;
}

export default function SendNewsletterPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.filter((p: Post) => p.status === "PUBLISHED"));
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!selectedPost) {
      setError("Please select a post");
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/emails/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPost }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to send newsletter");
      }
    } catch (error: any) {
      setError(error.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail size={32} />
          Send Newsletter
        </h1>
        <p className="text-gray-600 mt-1">
          Send an article to all active subscribers via email
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {loading ? (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Select Article
              </label>
              <select
                value={selectedPost}
                onChange={(e) => {
                  setSelectedPost(e.target.value);
                  setError(null);
                  setResult(null);
                }}
                className="w-full border rounded-lg p-3"
                disabled={sending}
              >
                <option value="">-- Choose an article --</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedPost && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Preview</h3>
                {posts.find((p) => p.id === selectedPost) && (
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Title:</strong>{" "}
                      {posts.find((p) => p.id === selectedPost)?.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Excerpt:</strong>{" "}
                      {posts.find((p) => p.id === selectedPost)?.excerpt ||
                        "No excerpt"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-green-800 font-semibold">
                    Newsletter sent successfully!
                  </p>
                </div>
                <div className="text-sm text-green-700 ml-7">
                  <p>✓ Sent: {result.sent} emails</p>
                  {result.failed > 0 && <p>✗ Failed: {result.failed} emails</p>}
                  <p>Total subscribers: {result.total}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !selectedPost}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {sending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Newsletter to All Subscribers
                </>
              )}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will send an email to all active
                subscribers with the selected article. The email includes the
                article title, excerpt, and a link to read the full post.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
