"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Edit, Trash2, Clock, Search, Eye, FileText } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  coverImage?: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
  categories?: {
    category: {
      name: string;
    };
  }[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
      toast.success("Post deleted successfully");
      fetchPosts();
    } else {
      toast.error("Failed to delete post");
    }
  }

  async function publishScheduled() {
    if (!confirm("Publish all scheduled posts that are due now?")) return;

    setPublishing(true);
    try {
      const res = await fetch("/api/cron/publish-scheduled", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Successfully published ${data.published} post(s)`);
        fetchPosts();
      } else {
        toast.error(data.error || "Failed to publish scheduled posts");
      }
    } catch (error) {
      toast.error("Failed to publish scheduled posts");
    } finally {
      setPublishing(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-[#3a3a3a] text-[#999] border border-[#444]",
      PUBLISHED: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      SCHEDULED: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      PENDING_REVIEW: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      ARCHIVED: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-[#3a3a3a] text-[#999]"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#888]" />
            Posts
          </h1>
          <p className="text-[#666] mt-1">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={publishScheduled}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-lg hover:bg-[#3a3a3a] disabled:opacity-50 text-sm font-medium transition-colors"
          >
            <Clock size={16} />
            {publishing ? "Publishing..." : "Publish Scheduled"}
          </button>
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1a1a1a] rounded-lg hover:bg-[#f0f0f0] text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Post
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-1">
          {["all", "draft", "published", "scheduled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-white text-[#1a1a1a]"
                  : "text-[#888] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#3a3a3a] border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#666]">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-[#666]" />
            </div>
            <p className="text-white font-medium mb-1">No posts found</p>
            <p className="text-[#666] text-sm mb-4">Create your first post to get started</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#1a1a1a] rounded-lg hover:bg-[#f0f0f0] text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add Post
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Preview
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Updated
                </th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#252525] transition-colors">
                  {/* Preview Image */}
                  <td className="px-6 py-4">
                    <div className="w-20 h-14 bg-[#2a2a2a] rounded-lg overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#555]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-white hover:text-[#a5b4fc] transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#888]">{post.author.name}</span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#888]">
                      {post.categories?.[0]?.category?.name || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>

                  {/* Updated */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#666]">
                      {formatDate(post.updatedAt || post.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === "PUBLISHED" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-[#888] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="p-2 text-[#888] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-[#888] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
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
