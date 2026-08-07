import React from 'react';
import Link from 'next/link';

interface SupportSuccessPageProps {
  searchParams: Promise<{
    mode?: string | string[];
    payment_id?: string | string[];
    order_id?: string | string[];
    subscription_id?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || 'Not provided';
  return value || 'Not provided';
}

export default async function SupportSuccessPage({ searchParams }: SupportSuccessPageProps) {
  const params = await searchParams;
  const isSubscription = firstValue(params.mode) === 'subscription';
  const paymentId = firstValue(params.payment_id);
  const orderId = firstValue(params.order_id);
  const subscriptionId = firstValue(params.subscription_id);
  const hasConfirmationReferences = isSubscription
    ? subscriptionId !== 'Not provided'
    : paymentId !== 'Not provided' && orderId !== 'Not provided';

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-32 sm:px-6">
      <section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 text-center sm:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Checkout return received
        </p>
        <h1 className="mt-4 font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
          Thank you for your support.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
          Razorpay is sending final confirmation separately. This page does not serve as a payment receipt or proof of a completed transaction.
        </p>

        <dl className="mx-auto mt-8 max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-left">
          {isSubscription ? (
            <div>
              <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Subscription reference</dt>
              <dd className="mt-1 break-all font-mono text-sm text-[var(--color-text-primary)]">{subscriptionId}</dd>
            </div>
          ) : (
            <>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Payment reference</dt>
                <dd className="mt-1 break-all font-mono text-sm text-[var(--color-text-primary)]">{paymentId}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Order reference</dt>
                <dd className="mt-1 break-all font-mono text-sm text-[var(--color-text-primary)]">{orderId}</dd>
              </div>
            </>
          )}
        </dl>

        {!hasConfirmationReferences && (
          <p
            role="status"
            className="mx-auto mt-6 max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-text-secondary)]"
          >
            Confirmation details are missing from this return. Please contact{' '}
            <a href="mailto:account@theopendraft.com" className="font-medium text-[var(--color-text-primary)] hover:underline">
              account@theopendraft.com
            </a>{' '}
            so we can help check your contribution.
          </p>
        )}

        {isSubscription && (
          <p className="mx-auto mt-6 max-w-xl text-sm text-[var(--color-text-secondary)]">
            To cancel without a TOD account, email{' '}
            <a href="mailto:account@theopendraft.com" className="font-medium text-[var(--color-text-primary)] hover:underline">
              account@theopendraft.com
            </a>{' '}
            from the email used at Razorpay checkout and include the subscription reference above.
          </p>
        )}

        <Link
          href="/impact"
          className="mt-8 inline-flex rounded-lg bg-[var(--color-text-primary)] px-6 py-3 font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
        >
          See our impact
        </Link>
      </section>
    </main>
  );
}
