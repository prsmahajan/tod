"use client";

import React, { useEffect, useState } from "react";
import {
  toPublicImpactMetrics,
  type RawPublicStats,
} from "@/lib/impact/public-metrics";

interface StatsResponse extends RawPublicStats {
  display?: {
    totalRevenue?: string;
  };
}

interface CommunityStatsProps {
  variant?: "full" | "compact";
  className?: string;
}

function formatRaisedAmount(amount: number, providedDisplay?: string): string {
  if (providedDisplay) return providedDisplay;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatsSkeleton({ className }: { className: string }) {
  return (
    <div aria-label="Loading community impact" className={`animate-pulse ${className}`}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
            <div className="mb-3 h-4 w-20 rounded bg-[var(--color-border)]" />
            <div className="h-8 w-16 rounded bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommunityStats({ variant = "full", className = "" }: CommunityStatsProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        const response = await fetch("/api/public/stats", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json() as StatsResponse;
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

  if (loading) return <StatsSkeleton className={className} />;

  if (!stats) {
    return (
      <div className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 ${className}`}>
        <p className="text-sm text-[var(--color-text-secondary)]">Impact totals are unavailable right now.</p>
      </div>
    );
  }

  const metrics = toPublicImpactMetrics(stats);
  const raised = formatRaisedAmount(metrics.raisedInr, stats.display?.totalRevenue);

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 ${className}`}>
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">{metrics.supporters}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Recorded Supporters</p>
        </div>
        <div aria-hidden="true" className="hidden h-10 w-px bg-[var(--color-border)] md:block" />
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">{raised}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Confirmed Raised</p>
        </div>
        <div aria-hidden="true" className="hidden h-10 w-px bg-[var(--color-border)] md:block" />
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">{metrics.estimatedMealsFunded}</p>
          <p className="mt-1 max-w-32 text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Estimated Meals Funded</p>
        </div>
      </div>
    );
  }

  const metricCards = [
    { label: "Confirmed Raised", value: raised },
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
