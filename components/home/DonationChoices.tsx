import React from "react";
import Link from "next/link";
import { DONATION_CHOICES } from "@/lib/homepage/content";

export default function DonationChoices() {
  return (
    <section>
      <div className="max-w-2xl">
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)]">
          Choose a one-time contribution
        </h2>
        <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
          Start with the amount that feels comfortable. A TOD account is not required to make a contribution.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {DONATION_CHOICES.map((choice) => (
          <article
            key={choice.name}
            className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
              {choice.name}
            </p>
            <p className="mt-2 font-body text-4xl font-bold text-[var(--color-text-primary)]">
              ₹{choice.amount}
            </p>
            <p className="mt-4 flex-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              {choice.description}
            </p>
            <Link
              href={choice.href}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)] active:translate-y-px"
            >
              Donate ₹{choice.amount}
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-6 text-sm text-[var(--color-text-secondary)]">
        Prefer regular support?{" "}
        <Link href="/support" className="font-medium text-[var(--color-text-primary)] underline underline-offset-4">
          See monthly options
        </Link>
      </p>
    </section>
  );
}
