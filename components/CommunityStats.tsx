"use client";

import React, { useEffect, useState } from "react";
import {
  toPublicImpactMetrics,
} from "@/lib/impact/public-metrics";
import {
  toHomepageImpactSummary,
  type HomepageStatsInput,
} from "@/lib/homepage/impact-summary";

interface CommunityStatsProps {
  variant?: "full" | "compact";
  className?: string;
}

interface CommunityStatsDisplayProps {
  variant: "full" | "compact";
  className: string;
  loading: boolean;
  stats: HomepageStatsInput | null;
}

function StatsSkeleton({ className, variant }: { className: string; variant: "full" | "compact" }) {
  const itemCount = variant === "compact" ? 2 : 4;

  return (
    <div aria-label="Loading community impact" className={`animate-pulse ${className}`}>
      <div className={variant === "compact" ? "grid grid-cols-1 gap-8 sm:grid-cols-2" : "grid grid-cols-2 gap-4 md:grid-cols-4"}>
        {Array.from({ length: itemCount }, (_, index) => index + 1).map((item) => (
          <div key={item} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
            <div className="mb-3 h-4 w-20 rounded bg-[var(--color-border)]" />
            <div className="h-8 w-16 rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunityStatsDisplay({
  variant,
  className,
  loading,
  stats,
}: CommunityStatsDisplayProps) {
  if (loading) return <StatsSkeleton className={className} variant={variant} />;

  if (!stats) {
    return (
      <div className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 ${className}`}>
        <p className="text-sm text-[var(--color-text-secondary)]">Impact totals are unavailable right now.</p>
      </div>
    );
  }

  const metrics = toPublicImpactMetrics(stats);
  const homepageSummary = toHomepageImpactSummary(stats);

  if (variant === "compact") {
    return (
      <div className={`grid grid-cols-1 gap-8 sm:grid-cols-2 ${className}`}>
        {homepageSummary.map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">{metric.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">{metric.label}</p>
          </div>
        ))}
      </div>
    );
  }

  const metricCards = [
    { label: "Confirmed Raised", value: homepageSummary[0].value },
    { label: "Recorded Supporters", value: metrics.supporters },
    { label: "Active Supporters", value: metrics.activeSupporters },
    { label: "Estimated Meals Funded", value: metrics.estimatedMealsFunded },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 transition-colors hover:border-[var(--color-text-secondary)]"
          >
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">{metric.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--color-text-secondary)]">
        Meal capacity is an estimate derived from confirmed contributions. It is not a completed feeding count.
      </p>
    </div>
  );
}

export default function CommunityStats({ variant = "full", className = "" }: CommunityStatsProps) {
  const [stats, setStats] = useState<HomepageStatsInput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        const response = await fetch("/api/public/stats", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json() as HomepageStatsInput;
        setStats(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching public stats:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchStats();
    return () => controller.abort();
  }, []);

  return (
    <CommunityStatsDisplay
      variant={variant}
      className={className}
      loading={loading}
      stats={stats}
    />
  );
}
