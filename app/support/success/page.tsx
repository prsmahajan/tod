import React from "react";
import Link from "next/link";
import SupportStatus from "./SupportStatus";
import {
  isSafeSupportReference,
  type PublicSupportMode,
} from "@/lib/razorpay/public-status";

interface SupportSuccessPageProps {
  searchParams: Promise<{
    mode?: string | string[];
    payment_id?: string | string[];
    subscription_id?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0] || undefined;
  return value || undefined;
}

export default async function SupportSuccessPage({ searchParams }: SupportSuccessPageProps) {
  const params = await searchParams;
  const mode: PublicSupportMode = firstValue(params.mode) === "subscription"
    ? "subscription"
    : "payment";
  const candidate = mode === "subscription"
    ? firstValue(params.subscription_id)
    : firstValue(params.payment_id);
  const reference = candidate && isSafeSupportReference(mode, candidate)
    ? candidate
    : undefined;

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-32 sm:px-6">
      <section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 text-center sm:p-12">
        <SupportStatus mode={mode} reference={reference} />

        {mode === "subscription" && (
          <p className="mx-auto mt-8 max-w-xl text-sm text-[var(--color-text-secondary)]">
            To cancel without a TOD account, email{" "}
            <a href="mailto:account@theopendraft.com" className="font-medium text-[var(--color-text-primary)] hover:underline">
              account@theopendraft.com
            </a>{" "}
            from the email used at Razorpay checkout and include the subscription reference.
          </p>
        )}

        <Link
          href="/impact"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-6 py-3 font-medium text-[var(--color-bg)] hover:opacity-90"
        >
          See Feeding Updates
        </Link>
      </section>
    </div>
  );
}
