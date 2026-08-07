import React from "react";
import FeedingRecordCard, { type FeaturedPhoto } from "@/components/impact/FeedingRecordCard";

export type RecordsStatus = "loading" | "ready" | "error";

function RecordsMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 md:p-8">
      <p className="leading-relaxed text-[var(--color-text-secondary)]">{children}</p>
    </div>
  );
}

export default function FeedingRecordsDisplay({
  status,
  records,
}: {
  status: RecordsStatus;
  records: FeaturedPhoto[];
}) {
  const statusMessage = status === "loading"
    ? "Loading verified feeding records."
    : status === "error"
      ? "Feeding records could not be loaded right now."
      : records.length === 0
        ? "No verified feeding records published yet."
        : `${records.length} verified feeding ${records.length === 1 ? "record" : "records"} loaded.`;

  return (
    <div aria-busy={status === "loading"}>
      <p role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </p>

      {status === "loading" && (
        <div aria-hidden="true" className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]"
            >
              <div className="aspect-[4/3] animate-pulse bg-[var(--color-border)] motion-reduce:animate-none" />
              <div className="space-y-3 p-6 md:p-8">
                <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--color-border)] motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)] motion-reduce:animate-none" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-border)] motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "ready" && records.length === 0 && (
        <RecordsMessage>No verified feeding records published yet.</RecordsMessage>
      )}

      {status === "error" && (
        <RecordsMessage>Feeding records could not be loaded right now.</RecordsMessage>
      )}

      {status === "ready" && records.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {records.map((record) => (
            <FeedingRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
