/**
 * Reconciles the subscription status stored in PostgreSQL against the live
 * Razorpay record. Razorpay is authoritative for lifecycle state; the stored
 * value is only kept when Razorpay reports nothing usable.
 */

export type StoredSubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE" | "PAUSED" | "EXPIRED";

export type RazorpaySubscriptionSnapshot = {
  status?: unknown;
  pause_initiated?: unknown;
  has_scheduled_changes?: unknown;
  scheduled_changes?: unknown;
};

const RAZORPAY_STATUS_MAP: Record<string, StoredSubscriptionStatus> = {
  active: "ACTIVE",
  resumed: "ACTIVE",
  authenticated: "ACTIVE",
  cancelled: "CANCELLED",
  paused: "PAUSED",
  halted: "PAST_DUE",
  pending: "PAST_DUE",
  completed: "EXPIRED",
  expired: "EXPIRED",
};

export function mapRazorpayStatus(status: unknown): StoredSubscriptionStatus | null {
  if (typeof status !== "string") return null;
  return RAZORPAY_STATUS_MAP[status.toLowerCase()] ?? null;
}

function hasScheduledCancellation(snapshot: RazorpaySubscriptionSnapshot): boolean {
  if (snapshot.has_scheduled_changes !== true) return false;
  if (!Array.isArray(snapshot.scheduled_changes)) return false;
  return snapshot.scheduled_changes.some(
    (change) => typeof change === "object" && change !== null && (change as { action?: unknown }).action === "cancel",
  );
}

export function reconcileSubscriptionStatus(
  storedStatus: string | null,
  snapshot: RazorpaySubscriptionSnapshot | null,
): { status: string | null; changed: boolean; autopayDisabled: boolean } {
  if (!snapshot) {
    return { status: storedStatus, changed: false, autopayDisabled: false };
  }

  const liveStatus = mapRazorpayStatus(snapshot.status);
  const status = liveStatus ?? storedStatus;
  const cancelledOrDone = liveStatus === "CANCELLED" || liveStatus === "EXPIRED";
  const autopayDisabled =
    cancelledOrDone || snapshot.pause_initiated === true || hasScheduledCancellation(snapshot);

  return {
    status,
    changed: liveStatus !== null && liveStatus !== storedStatus,
    autopayDisabled,
  };
}
