import React from "react";
import Link from "next/link";

export default function AnimalFirstHero() {
  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-12 md:items-center">
      <header className="md:col-span-3 max-w-3xl">
        <h1 className="font-heading text-4xl leading-10 md:text-6xl md:leading-[1] font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)]">
          Help Feed Stray Animals
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-[1.625] md:text-xl text-[var(--color-text-secondary)]">
          For ten months, this work has been funded personally. TOD now makes every contribution and verified feeding update visible so more animals can receive consistent meals.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/support"
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[var(--color-text-primary)] px-8 py-3 font-medium text-[var(--color-bg)] hover:opacity-90 active:translate-y-px"
          >
            Donate ₹99
          </Link>
          <Link
            href="/impact"
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-border)] px-8 py-3 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)] active:translate-y-px"
          >
            See Feeding Updates
          </Link>
        </div>
      </header>

      <aside className="md:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8">
        <p className="font-heading text-xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
          Genuine updates only
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Verified feeding photographs and factual records are shown below when they are available. Missing evidence is never replaced with stock imagery.
        </p>
      </aside>
    </section>
  );
}
