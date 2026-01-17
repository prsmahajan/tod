"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckSquare,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  approvals: {
    id: string;
    status: string;
    notes: string | null;
    createdAt: string;
    approver: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export default function ApprovalsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  async function fetchPendingPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approvals");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      // Ensure data is an array
      setPosts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Approvals fetch error:", error);
      toast.error(error.message || "Failed to fetch pending posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(postId: string, action: "approve" | "reject") {
    const confirmMessage =
      action === "approve"
        ? "Are you sure you want to approve and publish this post?"
        : "Are you sure you want to reject this post? It will be returned to draft.";

    if (!confirm(confirmMessage)) return;

    setProcessing(postId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          action,
          notes: reviewNotes[postId] || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process action");
      }

      toast.success(data.message);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setReviewNotes((prev) => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(null);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-[#888]" />
            Content Approval Queue
          </h1>
          <p className="text-[#666] mt-1">
            Review and approve posts submitted by authors
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
          <Clock size={18} />
          <span className="font-medium">{posts.length} pending</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#3a3a3a] border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-[#666] mt-4">Loading pending posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">All caught up!</h2>
          <p className="text-[#666] mt-2">
            There are no posts waiting for approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-[#2a2a2a]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#888]">
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {post.author.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#3a3a3a] rounded-lg text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      <Eye size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        setExpandedPost(expandedPost === post.id ? null : post.id)
                      }
                      className="p-2 hover:bg-[#2a2a2a] rounded-lg text-[#888] hover:text-white transition-colors"
                    >
                      {expandedPost === post.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Excerpt preview */}
                {post.excerpt && (
                  <p className="mt-3 text-[#888] text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Expanded content */}
              {expandedPost === post.id && (
                <div className="p-5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                  <h4 className="text-sm font-medium text-[#888] mb-3">
                    Content Preview
                  </h4>
                  <div className="bg-[#252525] p-4 rounded-lg border border-[#2a2a2a] max-h-64 overflow-y-auto">
                    <div
                      className="prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>

                  {/* Previous approvals */}
                  {post.approvals.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[#888] mb-3">
                        Previous Reviews
                      </h4>
                      <div className="space-y-2">
                        {post.approvals.map((approval) => (
                          <div
                            key={approval.id}
                            className={`p-3 rounded-lg text-sm ${
                              approval.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : approval.status === "REJECTED"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-[#2a2a2a] text-[#888] border border-[#3a3a3a]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {approval.approver.name}
                              </span>
                              <span className="text-xs opacity-75">
                                {formatDate(approval.createdAt)}
                              </span>
                            </div>
                            {approval.notes && (
                              <p className="mt-1 text-xs opacity-80">{approval.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="p-5 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#666]" />
                    <input
                      type="text"
                      placeholder="Add review notes (optional)..."
                      value={reviewNotes[post.id] || ""}
                      onChange={(e) =>
                        setReviewNotes((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(post.id, "reject")}
                    disabled={processing === post.id}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(post.id, "approve")}
                    disabled={processing === post.id}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={18} />
                    Approve & Publish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
