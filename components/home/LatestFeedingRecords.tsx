"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export interface FeaturedFeedingRecord {
  id: string;
  imageUrl: string;
  description: string;
  userName: string;
  location?: string;
  feedDate: string;
  animalCount?: number;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toFeaturedFeedingRecord(value: unknown): FeaturedFeedingRecord | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  if (
    !isNonEmptyString(candidate.id)
    || !isNonEmptyString(candidate.imageUrl)
    || !isNonEmptyString(candidate.description)
    || !isNonEmptyString(candidate.userName)
    || !isNonEmptyString(candidate.feedDate)
    || Number.isNaN(Date.parse(candidate.feedDate))
  ) {
    return null;
  }

  const record: FeaturedFeedingRecord = {
    id: candidate.id.trim(),
    imageUrl: candidate.imageUrl.trim(),
    description: candidate.description.trim(),
    userName: candidate.userName.trim(),
    feedDate: candidate.feedDate.trim(),
  };

  if (isNonEmptyString(candidate.location)) {
    record.location = candidate.location.trim();
  }

  if (
    typeof candidate.animalCount === "number"
    && Number.isInteger(candidate.animalCount)
    && candidate.animalCount > 0
  ) {
    record.animalCount = candidate.animalCount;
  }

  return record;
}

export function normalizeFeaturedRecords(payload: unknown): FeaturedFeedingRecord[] {
  if (!payload || typeof payload !== "object") return [];

  const photos = (payload as { photos?: unknown }).photos;
  if (!Array.isArray(photos)) return [];

  return photos
    .map(toFeaturedFeedingRecord)
    .filter((record): record is FeaturedFeedingRecord => record !== null)
    .slice(0, 3);
}

function formatFeedDate(feedDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(feedDate));
}

function RecordsMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8">
      <p className="text-[var(--color-text-secondary)]">{children}</p>
      <Link
        href="/impact"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-text-primary)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-text-primary)]"
      >
        Visit Feeding Updates
      </Link>
    </div>
  );
}

export default function LatestFeedingRecords() {
  const [records, setRecords] = useState<FeaturedFeedingRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const statusMessage = status === "loading"
    ? "Loading verified feeding records."
    : status === "error"
      ? "Feeding records could not be loaded right now."
      : records.length === 0
        ? "No verified feeding records published yet."
        : `${records.length} verified feeding ${records.length === 1 ? "record" : "records"} loaded.`;

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
    <section aria-busy={status === "loading"}>
      <div className="max-w-2xl">
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[var(--color-text-primary)]">
          Latest Feeding Records
        </h2>
        <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
          Only approved uploads with a feeding date and genuine photograph appear here.
        </p>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </p>

      {status === "loading" && (
        <div aria-hidden="true" className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
              <div className="aspect-[4/3] animate-pulse bg-[var(--color-border)] motion-reduce:animate-none" />
              <div className="space-y-3 p-6">
                <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-border)] motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)] motion-reduce:animate-none" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--color-border)] motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "ready" && records.length === 0 && (
        <div className="mt-10">
          <RecordsMessage>No verified feeding records published yet.</RecordsMessage>
        </div>
      )}

      {status === "error" && (
        <div className="mt-10">
          <RecordsMessage>Feeding records could not be loaded right now.</RecordsMessage>
        </div>
      )}

      {status === "ready" && records.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {records.map((record) => (
            <article key={record.id} className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
              {/* The API can return Appwrite preview URLs not covered by static Next image hosts. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.imageUrl}
                alt={record.description}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <time dateTime={record.feedDate} className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {formatFeedDate(record.feedDate)}
                </time>
                <p className="mt-3 leading-relaxed text-[var(--color-text-primary)]">
                  {record.description}
                </p>
                {(record.location || record.animalCount) && (
                  <dl className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
                    {record.location && (
                      <div>
                        <dt className="sr-only">Location</dt>
                        <dd>{record.location}</dd>
                      </div>
                    )}
                    {record.animalCount && (
                      <div>
                        <dt className="sr-only">Animal count</dt>
                        <dd>{record.animalCount} animals recorded</dd>
                      </div>
                    )}
                  </dl>
                )}
                <p className="mt-4 text-sm font-medium text-[var(--color-text-secondary)]">
                  Shared by {record.userName}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
