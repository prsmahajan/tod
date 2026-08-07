import React from "react";

export default function TransparencyStatus() {
  return (
    <section
      id="transparency"
      className="scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8"
    >
      <div className="max-w-2xl">
        <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)] md:text-4xl">
          Transparency status
        </h2>
        <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
          TOD publishes featured feeding records and reports honestly on what financial data is ready for public use.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
            Available now
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Approved feeding uploads can be reviewed on this page. Public contribution totals remain hidden while historical payment currencies are verified.
          </p>
        </div>
        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
            In preparation
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Verified expense reconciliation is being prepared. Financial totals will not be shown until the currency history is verified, or presented as proof of a specific feeding expense until those records are ready.
          </p>
        </div>
      </div>
    </section>
  );
}
