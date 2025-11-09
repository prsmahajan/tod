"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Clock } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  async function fetchPosts() {
    setLoading(true);
    const url = filter === "all" ? "/api/posts" : `/api/posts?status=${filter.toUpperCase()}`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPosts();
    }
  }

  async function publishScheduled() {
    if (!confirm("Publish all scheduled posts that are due now?")) return;

    setPublishing(true);
    try {
      const res = await fetch("/api/cron/publish-scheduled", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert(`Successfully published ${data.published} post(s)`);
        fetchPosts();
      } else {
        alert(data.error || "Failed to publish scheduled posts");
      }
    } catch (error) {
      alert("Failed to publish scheduled posts");
    } finally {
      setPublishing(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-200 text-gray-800",
      PUBLISHED: "bg-green-200 text-green-800",
      SCHEDULED: "bg-blue-200 text-blue-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[status] || "bg-gray-200"}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <div className="flex gap-3">
          <button
            onClick={publishScheduled}
            disabled={publishing}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            <Clock size={20} />
            {publishing ? "Publishing..." : "Publish Scheduled"}
          </button>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Post
          </Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {["all", "draft", "published", "scheduled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded capitalize ${
              filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No posts found. Create your first post!</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Title</th>
                <th className="text-left p-4 font-semibold">Author</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/admin/posts/${post.id}`} className="font-medium hover:text-blue-600">
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">{post.author.name}</td>
                  <td className="p-4">{getStatusBadge(post.status)}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
