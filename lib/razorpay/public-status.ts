export type PublicSupportMode = "payment" | "subscription";
export type PublicSupportState = "confirmed" | "pending" | "failed" | "unknown";

export type PublicSupportStatus =
  | { state: "confirmed"; amountInr: number }
  | { state: "pending" | "failed" | "unknown" };

interface StoredPaymentStatus {
  status?: unknown;
  amount?: unknown;
  [key: string]: unknown;
}

interface StoredSubscriptionStatus {
  status?: unknown;
  amount?: unknown;
  [key: string]: unknown;
}

interface ResolvePublicSupportStatusOptions {
  mode: PublicSupportMode;
  reference: string;
  findPayment: (paymentId: string) => Promise<StoredPaymentStatus | null>;
  findSubscription: (subscriptionId: string) => Promise<StoredSubscriptionStatus | null>;
}

const PAYMENT_REFERENCE = /^pay_[A-Za-z0-9]{3,60}$/;
const SUBSCRIPTION_REFERENCE = /^sub_[A-Za-z0-9]{3,60}$/;

export function isSafeSupportReference(mode: PublicSupportMode, reference: string): boolean {
  if (mode === "payment") return PAYMENT_REFERENCE.test(reference);
  return SUBSCRIPTION_REFERENCE.test(reference);
}

function storedAmount(value: unknown): number | null {
  return Number.isSafeInteger(value) && (value as number) > 0
    ? value as number
    : null;
}

export async function resolvePublicSupportStatus({
  mode,
  reference,
  findPayment,
  findSubscription,
}: ResolvePublicSupportStatusOptions): Promise<PublicSupportStatus> {
  if (!isSafeSupportReference(mode, reference)) return { state: "unknown" };

  if (mode === "payment") {
    const payment = await findPayment(reference);
    if (!payment) return { state: "unknown" };
    if (payment.status === "failed") return { state: "failed" };
    if (payment.status !== "success") return { state: "pending" };

    const amountInr = storedAmount(payment.amount);
    return amountInr === null
      ? { state: "pending" }
      : { state: "confirmed", amountInr };
  }

  const subscription = await findSubscription(reference);
  if (!subscription) return { state: "unknown" };
  if (["halted", "cancelled", "expired"].includes(String(subscription.status))) {
    return { state: "failed" };
  }
  if (subscription.status !== "active") return { state: "pending" };

  const amountInr = storedAmount(subscription.amount);
  return amountInr === null
    ? { state: "pending" }
    : { state: "confirmed", amountInr };
}
