"use client";

import React, { useEffect, useState } from "react";
import CommunityStats from "@/components/CommunityStats";
import Footer from "@/components/Footer";
import {
  normalizeFeaturedRecords,
  type FeaturedPhoto,
} from "@/components/impact/FeedingRecordCard";
import FeedingRecordsDisplay, {
  type RecordsStatus,
} from "@/components/impact/FeedingRecordsDisplay";
import TransparencyStatus from "@/components/impact/TransparencyStatus";

export default function ImpactPage() {
  const [records, setRecords] = useState<FeaturedPhoto[]>([]);
  const [status, setStatus] = useState<RecordsStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecords() {
      try {
        const response = await fetch("/api/photos/featured", { signal: controller.signal });
        if (!response.ok) throw new Error("Featured records request failed");

        const payload: unknown = await response.json();
        setRecords(normalizeFeaturedRecords(payload));
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching featured feeding records:", error);
        setStatus("error");
      }
    }

    loadRecords();
    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="max-w-4xl">
            <h1 className="font-heading text-4xl font-extrabold leading-10 tracking-[-0.02em] text-[var(--color-text-primary)] md:text-6xl md:leading-[60px]">
              Feeding Records and Support
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
              See confirmed community support and approved feeding updates in one clear place.
            </p>
          </header>

          <section className="mt-20">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)] md:text-4xl">
                Confirmed community support
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
                Contribution totals are confirmed. Meal capacity remains clearly labelled as an estimate.
              </p>
            </div>
            <CommunityStats className="mt-10" />
          </section>

          <section className="mt-32">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)] md:text-4xl">
                Verified feeding records
              </h2>
              <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
                Only approved uploads with a feeding date and genuine photograph appear here.
              </p>
            </div>
            <div className="mt-10">
              <FeedingRecordsDisplay status={status} records={records} />
            </div>
          </section>

          <div className="mt-32">
            <TransparencyStatus />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
