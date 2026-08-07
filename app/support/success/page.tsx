import Link from 'next/link';

interface SupportSuccessPageProps {
  searchParams: Promise<{
    payment_id?: string | string[];
    order_id?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || 'Not provided';
  return value || 'Not provided';
}

export default async function SupportSuccessPage({ searchParams }: SupportSuccessPageProps) {
  const params = await searchParams;
  const paymentId = firstValue(params.payment_id);
  const orderId = firstValue(params.order_id);

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-32 sm:px-6">
      <section className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 text-center sm:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Payment verified
        </p>
        <h1 className="mt-4 font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
          Thank you for your support.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
          Your payment details were verified. Our records are updated separately after confirmation from Razorpay.
        </p>

        <dl className="mx-auto mt-8 max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-left">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Payment ID</dt>
            <dd className="mt-1 break-all font-mono text-sm text-[var(--color-text-primary)]">{paymentId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Order ID</dt>
            <dd className="mt-1 break-all font-mono text-sm text-[var(--color-text-primary)]">{orderId}</dd>
          </div>
        </dl>

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
