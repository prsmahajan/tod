import React from "react";

export default function SubscriptionCancellationContact({ subscriptionId }: { subscriptionId: string }) {
  const subject = encodeURIComponent(`Cancellation request for ${subscriptionId}`);
  const body = encodeURIComponent(
    `Please cancel my recurring support subscription.\n\nSubscription ID: ${subscriptionId}`,
  );

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">Need to stop recurring support?</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        Send the request from the email used at Razorpay checkout so ownership can be verified. Include this subscription ID:
      </p>
      <code className="mt-2 block break-all font-mono text-sm text-[var(--color-text-primary)]">
        {subscriptionId}
      </code>
      <a
        href={`mailto:account@theopendraft.com?subject=${subject}&body=${body}`}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-card-bg)]"
      >
        Email cancellation request
      </a>
    </div>
  );
}
