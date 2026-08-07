import React from "react";
import Link from "next/link";
import CommunityStats from "@/components/CommunityStats";
import Footer from "@/components/Footer";
import AnimalFirstHero from "@/components/home/AnimalFirstHero";
import DonationChoices from "@/components/home/DonationChoices";
import FounderStory from "@/components/home/FounderStory";
import LatestFeedingRecords from "@/components/home/LatestFeedingRecords";
import { DONATION_TO_PROOF_STEPS } from "@/lib/homepage/content";

export default function HomePage() {
  return (
    <>
      <div className="container mx-auto px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <AnimalFirstHero />

          <section className="mt-20">
            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)] md:text-3xl">
                  Community-funded impact
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Public amount and meal estimates are paused while historical payment currencies are verified.
                </p>
              </div>
              <CommunityStats variant="compact" className="mt-8" />
              <div className="mt-6 text-center">
                <Link
                  href="/impact"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-text-primary)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-text-primary)]"
                >
                  See all impact details
                </Link>
              </div>
            </div>
          </section>

          <div className="mt-32">
            <LatestFeedingRecords />
          </div>

          <section className="mt-32">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)] md:text-4xl">
                From donation to feeding proof
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
                Contributions and feeding records remain separate facts until the public expense ledger is ready.
              </p>
            </div>
            <ol className="mt-10 grid list-none grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
              {DONATION_TO_PROOF_STEPS.map((step) => (
                <li key={step.title} className="border-t border-[var(--color-border)] pt-6">
                  <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-32">
            <FounderStory />
          </div>

          <div className="mt-32">
            <DonationChoices />
          </div>

          <section className="mt-32 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)] md:text-4xl">
                Transparency is part of the work
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
                TOD publishes approved feeding uploads as genuine evidence. Public contribution totals are paused while historical payment currencies are verified, and expense reconciliation will not be presented as complete before the records are ready.
              </p>
              <Link
                href="/impact#transparency"
                className="mt-6 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[var(--color-text-primary)] px-8 py-3 font-medium text-[var(--color-bg)] hover:opacity-90 active:translate-y-px"
              >
                View transparency status
              </Link>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
