import React from "react";
import Link from "next/link";

export default function FounderStory() {
  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-start">
      <div>
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)]">
          Ten months of personally funded feeding
        </h2>
      </div>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8">
        <p className="leading-relaxed text-[var(--color-text-secondary)]">
          The founder personally funded stray animal feeding for ten months.
        </p>
        <Link
          href="/mission"
          className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-text-primary)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-text-primary)]"
        >
          Read the full story
        </Link>
      </div>
    </section>
  );
}
