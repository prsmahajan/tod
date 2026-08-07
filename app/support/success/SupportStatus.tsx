"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  PublicSupportMode,
  PublicSupportStatus,
} from "@/lib/razorpay/public-status";

const MAX_STATUS_CHECKS = 8;
const STATUS_CHECK_DELAY_MS = 2_000;

interface SupportStatusProps {
  mode: PublicSupportMode;
  reference?: string;
}

interface SupportStatusDisplayProps {
  mode: PublicSupportMode;
  status: PublicSupportStatus | { state: "checking" };
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SupportStatusDisplay({ mode, status }: SupportStatusDisplayProps) {
  if (status.state === "checking") {
    return (
      <div role="status" aria-live="polite">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">Checking final confirmation</p>
        <h1 className="mt-4 font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
          Your contribution is being checked.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
          Razorpay confirmation can take a few moments. Keep this page open while we check the stored payment record.
        </p>
      </div>
    );
  }

  if (status.state === "confirmed") {
    return (
      <div role="status" aria-live="polite">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          {mode === "subscription" ? "Recurring support confirmed" : "Contribution confirmed"}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
          Thank you for supporting the feeding work.
        </h1>
        <p className="mt-5 font-body text-3xl font-bold text-[var(--color-text-primary)]">
          {formatInr(status.amountInr)}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
          This amount and status come from the stored Razorpay webhook record. It does not claim a specific feeding outcome.
        </p>
        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
          <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Want to keep your records together?</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Creating an account is optional. Your contribution did not require one.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
          >
            Create an optional account
          </Link>
        </div>
      </div>
    );
  }

  if (status.state === "failed") {
    return (
      <div role="status" aria-live="polite">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">Not confirmed</p>
        <h1 className="mt-4 font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
          {mode === "subscription" ? "Recurring support is not active." : "This payment was not completed."}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
          No confirmed contribution is being claimed for this reference. You can return to the donation page and try again.
        </p>
        <Link
          href="/support"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-6 py-3 font-medium text-[var(--color-bg)] hover:opacity-90"
        >
          Return to Donate
        </Link>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Confirmation unavailable</p>
      <h1 className="mt-4 font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
        We could not confirm this contribution yet.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
        If you completed checkout, email account@theopendraft.com from the address used with Razorpay and include the payment or subscription reference.
      </p>
    </div>
  );
}

export default function SupportStatus({ mode, reference }: SupportStatusProps) {
  const [status, setStatus] = useState<PublicSupportStatus | { state: "checking" }>(
    reference ? { state: "checking" } : { state: "unknown" },
  );

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function checkStatus() {
      attempts += 1;
      try {
        const query = new URLSearchParams({ mode, reference: reference! });
        const response = await fetch(`/api/public/support-status?${query.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("status unavailable");
        const next = await response.json() as PublicSupportStatus;
        if (cancelled) return;
        setStatus(next);
        if ((next.state === "unknown" || next.state === "pending") && attempts < MAX_STATUS_CHECKS) {
          timer = setTimeout(checkStatus, STATUS_CHECK_DELAY_MS);
        }
      } catch {
        if (cancelled) return;
        if (attempts < MAX_STATUS_CHECKS) {
          timer = setTimeout(checkStatus, STATUS_CHECK_DELAY_MS);
        } else {
          setStatus({ state: "unknown" });
        }
      }
    }

    void checkStatus();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [mode, reference]);

  return <SupportStatusDisplay mode={mode} status={status} />;
}
