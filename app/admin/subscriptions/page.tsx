"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createAuthenticatedHeaders } from "@/lib/appwrite/auth";
import { OneTimePaymentsTable } from "@/components/admin/OneTimePaymentsTable";
import type { OneTimePayment } from "@/lib/admin/one-time-payments";

interface Subscription {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  razorpaySubscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionStartedAt: string | null;
  subscriptionEndsAt: string | null;
  nextBillingDate: string | null;
  latestBillingAmount: number | null;
  billingCycle: string | null;
  animalsFed: number;
  createdAt: string;
  autopayDisabled?: boolean;
  razorpayStatus?: string | null;
}

interface Stats {
  totalSubscribers: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  pausedSubscriptions: number;
  totalRevenue: number;
  totalAnimalsFed: number;
  mrr: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-500",
  paused: "bg-yellow-500/10 text-yellow-600",
  pending: "bg-blue-500/10 text-blue-500",
  expired: "bg-gray-500/10 text-gray-500",
  // New statuses for mandate/payment issues
  payment_pending: "bg-orange-500/10 text-orange-600",
  halted: "bg-red-500/10 text-red-600",
  authenticated: "bg-blue-500/10 text-blue-500",
};

// Statuses that indicate the subscription is at risk
const AT_RISK_STATUSES = ["payment_pending", "past_due", "halted", "cancelled", "expired"];

// PostgreSQL stores the enum in upper case ("ACTIVE"), while the status colors
// and comparisons below are keyed in lower case.
const statusKey = (status: string | null | undefined) => (status || "pending").toLowerCase();

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [supportType, setSupportType] = useState<"recurring" | "one-time">("recurring");
  const [oneTimePayments, setOneTimePayments] = useState<OneTimePayment[]>([]);
  const [resultsTruncated, setResultsTruncated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "cancelled" | "paused">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await createAuthenticatedHeaders();
      const res = await fetch(
        `/api/admin/subscriptions?supportType=${supportType}&filter=${filter}&search=${encodeURIComponent(searchQuery)}&page=${page}`,
        { headers },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch support records");
      }
      const data = await res.json();
      if (supportType === "one-time") {
        setOneTimePayments(data.payments || []);
        setResultsTruncated(data.pagination?.truncated === true);
      } else {
        setSubscriptions(data.subscriptions || []);
        setStats(data.stats || null);
      }
      setTotalPages(data.pagination?.totalPages || 1);
      if (data.pagination?.page && data.pagination.page !== page) setPage(data.pagination.page);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [supportType, filter, searchQuery, page]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription? The user will lose access at the end of their billing period.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: await createAuthenticatedHeaders(),
      });

      if (res.ok) {
        toast.success("Subscription cancelled successfully");
        fetchSubscriptions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const handleExtendSubscription = async (subscriptionId: string, days: number) => {
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}/extend`, {
        method: "POST",
        headers: { ...(await createAuthenticatedHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });

      if (res.ok) {
        toast.success(`Subscription extended by ${days} days`);
        fetchSubscriptions();
        setSelectedSubscription(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to extend subscription");
      }
    } catch (error) {
      toast.error("Failed to extend subscription");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilRenewal = (nextBillingDate: string | null) => {
    if (!nextBillingDate) return null;
    const days = Math.ceil(
      (new Date(nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return "Unnamed";
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || fullName;
  };

  const getMaskedEmail = (email: string | null | undefined) => {
    if (!email) return "••••••••";
    const [local, domain] = email.split("@");
    if (!domain) return "••••••••";
    const visiblePrefix = local.slice(0, 2);
    return `${visiblePrefix}••••@${domain}`;
  };

  const copyEmailToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Failed to copy email");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Subscription Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage paid subscriptions and view revenue analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open("https://dashboard.razorpay.com/app/subscriptions", "_blank")}
            className="px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--color-border)] cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Razorpay Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {supportType === "recurring" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Subscribers</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalSubscribers}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Cancelled</p>
            <p className="text-2xl font-bold text-red-500">{stats.cancelledSubscriptions}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">MRR</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.mrr)}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Total Revenue</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Animals Fed</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAnimalsFed}</p>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Support type</span>
          <select
            value={supportType}
            onChange={(event) => {
              setSupportType(event.target.value as "recurring" | "one-time");
              setPage(1);
              setSelectedSubscription(null);
            }}
            className="px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="recurring">Recurring subscriptions</option>
            <option value="one-time">One-time payments</option>
          </select>
        </label>
        {supportType === "recurring" && (
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "cancelled", label: "Cancelled" },
              { key: "paused", label: "Paused" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key as any);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  filter === tab.key
                    ? "bg-[var(--color-text-primary)] text-[var(--color-bg)]"
                    : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            className="w-full md:max-w-sm px-4 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
          />
        </div>
      </div>

      {/* Support Records Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[var(--color-text-primary)]/30 border-t-[var(--color-text-primary)] rounded-full animate-spin" />
        </div>
      ) : supportType === "one-time" ? (
        <OneTimePaymentsTable
          payments={oneTimePayments}
          page={page}
          totalPages={totalPages}
          truncated={resultsTruncated}
          onPageChange={setPage}
        />
      ) : subscriptions.length > 0 ? (
        <>
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Subscriber
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Next Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Contribution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Impact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {subscriptions.map((sub) => {
                    const daysUntilRenewal = getDaysUntilRenewal(sub.nextBillingDate);
                    return (
                      <tr key={sub.id} className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className={`font-medium ${sub.autopayDisabled ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
                              {getFirstName(sub.name)}
                            </p>
                            <div 
                              className="flex items-center gap-2 group"
                              onMouseEnter={() => setHoveredEmail(sub.id)}
                              onMouseLeave={() => setHoveredEmail(null)}
                            >
                              <p 
                                className="text-sm text-[var(--color-text-secondary)] cursor-pointer"
                                onClick={() => copyEmailToClipboard(sub.email)}
                                title="Click to copy email"
                              >
                                {hoveredEmail === sub.id ? sub.email : getMaskedEmail(sub.email)}
                              </p>
                              <button
                                type="button"
                                onClick={() => copyEmailToClipboard(sub.email)}
                                className="p-1 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                                title="Click to copy email"
                              >
                                {hoveredEmail === sub.id ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                STATUS_COLORS[statusKey(sub.subscriptionStatus)] || STATUS_COLORS.pending
                              }`}
                            >
                              {sub.subscriptionStatus || "No Subscription"}
                            </span>
                            {/* Autopay disabled indicator */}
                            {sub.autopayDisabled && (
                              <span 
                                title={`Autopay disabled - Razorpay status: ${sub.razorpayStatus || 'unknown'}`}
                                className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                Autopay Off
                              </span>
                            )}
                            {/* At-risk indicator */}
                            {!sub.autopayDisabled && AT_RISK_STATUSES.includes(statusKey(sub.subscriptionStatus)) && (
                              <span title="Subscription at risk - mandate may be revoked">
                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {formatDate(sub.subscriptionStartedAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {statusKey(sub.subscriptionStatus) === "cancelled" || sub.autopayDisabled ? (
                            <span className="text-sm text-red-500 font-medium">
                              {sub.autopayDisabled ? 'Autopay disabled' : 'Cancelled'}
                            </span>
                          ) : sub.nextBillingDate ? (
                            <div>
                              <p className="text-sm text-[var(--color-text-primary)]">
                                {formatDate(sub.nextBillingDate)}
                              </p>
                              {daysUntilRenewal !== null && (
                                <p
                                  className={`text-xs ${
                                    daysUntilRenewal <= 3
                                      ? "text-red-500"
                                      : daysUntilRenewal <= 7
                                      ? "text-yellow-600"
                                      : "text-[var(--color-text-secondary)]"
                                  }`}
                                >
                                  {daysUntilRenewal > 0 ? `${daysUntilRenewal} days` : "Today"}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--color-text-secondary)]">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[var(--color-text-primary)]">
                            {sub.latestBillingAmount != null
                              ? formatCurrency(sub.latestBillingAmount)
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {sub.animalsFed}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedSubscription(sub)}
                              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] rounded-lg transition-colors cursor-pointer"
                              title="View details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {statusKey(sub.subscriptionStatus) === "active" && !sub.autopayDisabled && (
                              <button
                                onClick={() => handleCancelSubscription(sub.id)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Cancel subscription"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-[var(--color-text-secondary)]">No subscriptions found</p>
        </div>
      )}

      {/* Subscription Detail Modal */}
      {supportType === "recurring" && selectedSubscription && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Subscription Details</h2>
                <button
                  onClick={() => setSelectedSubscription(null)}
                  className="p-2 hover:bg-[var(--color-card-bg)] rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-[var(--color-border)] flex items-center justify-center text-lg font-bold text-black">
                  {selectedSubscription.avatar ? (
                    <img
                      src={selectedSubscription.avatar}
                      alt={selectedSubscription.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedSubscription.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{selectedSubscription.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{selectedSubscription.email}</p>
                </div>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    STATUS_COLORS[statusKey(selectedSubscription.subscriptionStatus)] || STATUS_COLORS.pending
                  }`}
                >
                  {selectedSubscription.subscriptionStatus || "No Subscription"}
                </span>
              </div>

              {/* Subscription Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Subscription ID</p>
                    <p className="text-[var(--color-text-primary)] font-mono text-sm">
                      {selectedSubscription.razorpaySubscriptionId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Member Since</p>
                    <p className="text-[var(--color-text-primary)]">
                      {formatDate(selectedSubscription.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Started</p>
                    <p className="text-[var(--color-text-primary)]">
                      {formatDate(selectedSubscription.subscriptionStartedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Next Billing</p>
                    <p className="text-[var(--color-text-primary)]">
                      {formatDate(selectedSubscription.nextBillingDate)}
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">Total Impact</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedSubscription.animalsFed}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">animals fed</p>
                    </div>
                    <svg className="w-12 h-12 text-purple-500/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {statusKey(selectedSubscription.subscriptionStatus) === "active" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Extend Subscription</p>
                  <div className="flex gap-2">
                    {[7, 30, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => handleExtendSubscription(selectedSubscription.id, days)}
                        className="flex-1 py-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-sm hover:bg-[var(--color-border)] cursor-pointer"
                      >
                        +{days} days
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleCancelSubscription(selectedSubscription.id);
                      setSelectedSubscription(null);
                    }}
                    className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}

              {statusKey(selectedSubscription.subscriptionStatus) === "cancelled" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-600">
                    This subscription has been cancelled. Access will end on{" "}
                    {formatDate(selectedSubscription.subscriptionEndsAt)}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
