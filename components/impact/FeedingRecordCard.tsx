import React from "react";
import { normalizeFeedDate } from "@/lib/public-data/feed-date";

export interface FeaturedPhoto {
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

function toFeaturedPhoto(value: unknown): FeaturedPhoto | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  const feedDate = normalizeFeedDate(candidate.feedDate);
  if (
    !isNonEmptyString(candidate.id)
    || !isNonEmptyString(candidate.imageUrl)
    || !isNonEmptyString(candidate.description)
    || !isNonEmptyString(candidate.userName)
    || feedDate === null
  ) {
    return null;
  }

  const record: FeaturedPhoto = {
    id: candidate.id.trim(),
    imageUrl: candidate.imageUrl.trim(),
    description: candidate.description.trim(),
    userName: candidate.userName.trim(),
    feedDate,
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

export function normalizeFeaturedRecords(payload: unknown): FeaturedPhoto[] {
  if (!payload || typeof payload !== "object") return [];

  const photos = (payload as { photos?: unknown }).photos;
  if (!Array.isArray(photos)) return [];

  return photos
    .map(toFeaturedPhoto)
    .filter((record): record is FeaturedPhoto => record !== null);
}

function formatFeedDate(feedDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(feedDate));
}

export default function FeedingRecordCard({ record }: { record: FeaturedPhoto }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)]">
      {/* Featured uploads may use Appwrite preview URLs outside the static Next image hosts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={record.imageUrl}
        alt={record.description}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
      <div className="p-6 md:p-8">
        <time
          dateTime={record.feedDate}
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
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
  );
}
