"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/appwrite/auth";
import { MODERATION_STATUS, REJECTION_REASONS } from "@/lib/moderation/constants";

interface AILabels {
  labels: string[];
  animals: string[];
  flags: {
    violence: boolean;
    adult: boolean;
    medical: boolean;
    racy: boolean;
  };
  description: string;
  confidence: number;
  decision: {
    autoApprove: boolean;
    autoReject: boolean;
    requiresHumanReview: boolean;
    reason: string;
    riskLevel: string;
  };
}

interface QueueItem {
  id: string;
  imageUrl: string;
  uploadedById: string;
  aiScore: number | null;
  aiLabels: AILabels | null;
  aiSafe: boolean | null;
  humanReviewed: boolean;
  humanApproved: boolean | null;
  reviewedById: string | null;
  reviewNotes: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
}

interface Stats {
  [key: string]: number;
}

export default function AIPhotosPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("needs_review");
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Auth headers for API calls
  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "x-user-email": user?.email || "",
  }), [user?.email]);

  const fetchQueue = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/moderation/queue?status=${filter}&page=${page}&limit=20`, {
        headers: { "x-user-email": user.email },
      });
      const data = await res.json();

      if (res.ok) {
        setItems(data.items || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error(data.error || "Failed to fetch queue");
      }
    } catch (error) {
      toast.error("Failed to fetch moderation queue");
    } finally {
      setLoading(false);
    }
  }, [filter, page, user?.email]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleProcessBatch = async () => {
    setProcessingBatch(true);
    try {
      const res = await fetch("/api/moderation/process", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ limit: 10 }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Processed ${data.results.processed} photos: ${data.results.autoApproved} approved, ${data.results.autoRejected} rejected, ${data.results.needsReview} need review`
        );
        fetchQueue();
      } else {
        toast.error(data.error || "Failed to process batch");
      }
    } catch (error) {
      toast.error("Failed to process batch");
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleAnalyzeSingle = async (item: QueueItem) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/moderation/analyze", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ imageUrl: item.imageUrl, queueId: item.id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Image analyzed successfully");
        fetchQueue();
        if (selectedItem?.id === item.id) {
          setSelectedItem({ ...item, ...data.record });
        }
      } else {
        toast.error(data.error || "Failed to analyze image");
      }
    } catch (error) {
      toast.error("Failed to analyze image");
    } finally {
      setProcessing(false);
    }
  };

  const handleModerate = async (action: "approve" | "reject" | "feature") => {
    if (!selectedItem) return;

    if (action === "reject" && !rejectionReason.trim()) {
      toast.warning("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/moderation/queue/${selectedItem.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action,
          notes: rejectionReason || undefined,
          previousStatus: selectedItem.status,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Photo ${action === "feature" ? "featured" : action + "d"} successfully`);
        setSelectedItem(null);
        setRejectionReason("");
        fetchQueue();
      } else {
        toast.error(data.error || `Failed to ${action} photo`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} photo`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      analyzing: "bg-blue-500/10 text-blue-500",
      ai_approved: "bg-emerald-500/10 text-emerald-600",
      ai_rejected: "bg-red-500/10 text-red-500",
      human_review: "bg-orange-500/10 text-orange-600",
      approved: "bg-green-500/10 text-green-600",
      rejected: "bg-red-500/10 text-red-500",
      featured: "bg-purple-500/10 text-purple-600",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-500/10 text-gray-500"}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const styles: Record<string, string> = {
      low: "bg-green-500/10 text-green-600",
      medium: "bg-yellow-500/10 text-yellow-600",
      high: "bg-orange-500/10 text-orange-600",
      critical: "bg-red-500/10 text-red-500",
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[riskLevel] || "bg-gray-500/10 text-gray-500"}`}>
        {riskLevel.toUpperCase()} RISK
      </span>
    );
  };

  const filterTabs = [
    { key: "needs_review", label: "Needs Review", count: (stats.human_review || 0) + (stats.ai_approved || 0) + (stats.ai_rejected || 0) },
    { key: "pending", label: "Pending AI", count: stats.pending || 0 },
    { key: "approved", label: "Approved", count: stats.approved || 0 },
    { key: "rejected", label: "Rejected", count: stats.rejected || 0 },
    { key: "all", label: "All", count: Object.values(stats).reduce((a, b) => a + b, 0) },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">AI Photo Moderation</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Review photos with AI-assisted analysis and moderation
          </p>
        </div>
        <button
          onClick={handleProcessBatch}
          disabled={processingBatch}
          className="px-4 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {processingBatch ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Process Pending with AI
            </>
          )}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.key
                ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]"
                : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                filter === tab.key ? "bg-[var(--color-bg)]/20" : "bg-[var(--color-border)]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Queue Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--color-text-primary)]/30 border-t-[var(--color-text-primary)] rounded-full animate-spin" />
            <p className="text-[var(--color-text-secondary)]">Loading queue...</p>
          </div>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden hover:border-[var(--color-text-secondary)] transition-colors"
              >
                {/* Image */}
                <div className="relative cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <img
                    src={item.imageUrl}
                    alt="Pending review"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-image.svg";
                    }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {getStatusBadge(item.status)}
                  </div>
                  {item.aiLabels?.decision?.riskLevel && (
                    <div className="absolute top-2 right-2">
                      {getRiskBadge(item.aiLabels.decision.riskLevel)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  {/* AI Score */}
                  {item.aiScore !== null && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--color-text-secondary)]">AI Safety Score</span>
                        <span className={`font-medium ${
                          item.aiScore >= 0.8 ? "text-green-600" : item.aiScore >= 0.5 ? "text-yellow-600" : "text-red-500"
                        }`}>
                          {Math.round(item.aiScore * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.aiScore >= 0.8 ? "bg-green-500" : item.aiScore >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${item.aiScore * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Detected Animals */}
                  {item.aiLabels?.animals && item.aiLabels.animals.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.aiLabels.animals.slice(0, 3).map((animal, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[var(--color-border)] text-xs rounded text-[var(--color-text-secondary)]">
                          {animal}
                        </span>
                      ))}
                      {item.aiLabels.animals.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                          +{item.aiLabels.animals.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI Decision */}
                  {item.aiLabels?.decision?.reason && (
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                      {item.aiLabels.decision.reason}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    {item.aiScore === null ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyzeSingle(item);
                        }}
                        disabled={processing}
                        className="flex-1 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                      >
                        Analyze with AI
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded text-xs font-medium hover:opacity-90 cursor-pointer"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-sm disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--color-text-secondary)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-sm disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg">
          <svg className="w-12 h-12 mx-auto text-[var(--color-text-secondary)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-[var(--color-text-secondary)]">No photos in this queue</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Review Photo</h2>
                  {getStatusBadge(selectedItem.status)}
                </div>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setRejectionReason("");
                  }}
                  className="p-2 hover:bg-[var(--color-card-bg)] rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div>
                  <img
                    src={selectedItem.imageUrl}
                    alt="Review"
                    className="w-full rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-image.svg";
                    }}
                  />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    Uploaded by: {selectedItem.uploadedById}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Date: {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* AI Analysis */}
                <div className="space-y-4">
                  {/* AI Score Card */}
                  {selectedItem.aiScore !== null ? (
                    <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Analysis
                      </h3>

                      {/* Safety Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--color-text-secondary)]">Safety Score</span>
                          <span className={`text-lg font-bold ${
                            selectedItem.aiScore >= 0.8 ? "text-green-600" : selectedItem.aiScore >= 0.5 ? "text-yellow-600" : "text-red-500"
                          }`}>
                            {Math.round(selectedItem.aiScore * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              selectedItem.aiScore >= 0.8 ? "bg-green-500" : selectedItem.aiScore >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${selectedItem.aiScore * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* AI Decision */}
                      {selectedItem.aiLabels?.decision && (
                        <div className="mb-4 p-3 bg-[var(--color-bg)] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">AI Recommendation:</span>
                            {getRiskBadge(selectedItem.aiLabels.decision.riskLevel)}
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {selectedItem.aiLabels.decision.reason}
                          </p>
                          {selectedItem.aiLabels.decision.autoApprove && (
                            <p className="text-xs text-green-600 mt-1">Auto-approval recommended</p>
                          )}
                          {selectedItem.aiLabels.decision.autoReject && (
                            <p className="text-xs text-red-500 mt-1">Auto-rejection recommended</p>
                          )}
                        </div>
                      )}

                      {/* Detected Content */}
                      {selectedItem.aiLabels && (
                        <>
                          {/* Description */}
                          {selectedItem.aiLabels.description && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Description</p>
                              <p className="text-sm text-[var(--color-text-primary)]">{selectedItem.aiLabels.description}</p>
                            </div>
                          )}

                          {/* Animals */}
                          {selectedItem.aiLabels.animals?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Detected Animals</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedItem.aiLabels.animals.map((animal, i) => (
                                  <span key={i} className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded">
                                    {animal}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Labels */}
                          {selectedItem.aiLabels.labels?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Labels</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedItem.aiLabels.labels.map((label, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-[var(--color-border)] text-[var(--color-text-secondary)] text-xs rounded">
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Content Flags */}
                          {selectedItem.aiLabels.flags && (
                            <div>
                              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Content Flags</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(selectedItem.aiLabels.flags).map(([flag, value]) => (
                                  <span
                                    key={flag}
                                    className={`px-2 py-0.5 text-xs rounded ${
                                      value
                                        ? "bg-red-500/10 text-red-500"
                                        : "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
                                    }`}
                                  >
                                    {flag}: {value ? "Yes" : "No"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4 text-center">
                      <p className="text-[var(--color-text-secondary)] mb-3">AI analysis not yet performed</p>
                      <button
                        onClick={() => handleAnalyzeSingle(selectedItem)}
                        disabled={processing}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                      >
                        {processing ? "Analyzing..." : "Analyze with AI"}
                      </button>
                    </div>
                  )}

                  {/* Human Review Section */}
                  {!selectedItem.humanReviewed ? (
                    <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--color-text-primary)] mb-3">Human Review</h3>

                      {/* Rejection Reason */}
                      <div className="mb-4">
                        <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                          Rejection Reason (required for rejection)
                        </label>
                        <select
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none mb-2"
                        >
                          <option value="">Select a reason...</option>
                          {Object.entries(REJECTION_REASONS).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Or type a custom reason..."
                          rows={2}
                          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleModerate("approve")}
                          disabled={processing}
                          className="py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerate("feature")}
                          disabled={processing}
                          className="py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                        >
                          Feature
                        </button>
                        <button
                          onClick={() => handleModerate("reject")}
                          disabled={processing || !rejectionReason.trim()}
                          className="py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--color-text-primary)] mb-2">Review Complete</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Reviewed by: {selectedItem.reviewedById}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Decision: {selectedItem.humanApproved ? "Approved" : "Rejected"}
                      </p>
                      {selectedItem.reviewNotes && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                          Notes: {selectedItem.reviewNotes}
                        </p>
                      )}
                      {selectedItem.reviewedAt && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                          {new Date(selectedItem.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
