"use client";

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";

export default function MissionPage() {
  return (
    <>
      <div className="container mx-auto px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-extrabold leading-10 tracking-[-0.02em] text-[var(--color-text-primary)] md:text-6xl md:leading-[60px]">
            Ten months of personally funded feeding
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
            The founder personally funded stray animal feeding for ten months. TOD now gives other people a simple way to contribute and see genuine feeding updates as they are published.
          </p>
        </header>

        <div className="mx-auto mt-20 max-w-4xl space-y-20">
          <AnimatedSection>
            <section>
              <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                Why TOD exists
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                This initiative began with direct, personal feeding work. The first public release stays focused on that work: accepting contributions for feeding and publishing approved, dated records when genuine evidence is ready.
              </p>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 sm:p-8">
              <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                What is available today
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Public reporting status</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    Public amount and meal estimates are paused while historical payment currencies are verified. No zero or mixed-currency total is shown in their place.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">Approved feeding updates</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    Genuine dated photographs and the available factual details are published after approval. Missing records stay honestly empty.
                  </p>
                </div>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section>
              <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                Current limitation
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Verified expense reconciliation is being prepared. Until those records are ready, TOD does not claim a complete public expense ledger or connect a specific contribution to a specific feeding outcome.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/impact"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-8 py-3 font-medium text-[var(--color-bg)] hover:opacity-90"
                >
                  See Feeding Updates
                </Link>
                <Link
                  href="/support"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-8 py-3 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
                >
                  Donate
                </Link>
              </div>
            </section>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
}
