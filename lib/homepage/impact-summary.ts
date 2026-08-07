import {
  toPublicImpactMetrics,
  type RawPublicStats,
} from "@/lib/impact/public-metrics";

export interface HomepageStatsInput extends RawPublicStats {
  display?: {
    totalRevenue?: string;
  };
}

export interface HomepageImpactSummaryItem {
  label: "Confirmed Raised" | "Estimated Meals Funded";
  value: string | number;
}

function formatRaisedAmount(amount: number, providedDisplay?: string): string {
  if (providedDisplay) return providedDisplay;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function toHomepageImpactSummary(stats: HomepageStatsInput): HomepageImpactSummaryItem[] {
  const metrics = toPublicImpactMetrics(stats);

  return [
    {
      label: "Confirmed Raised",
      value: formatRaisedAmount(metrics.raisedInr, stats.display?.totalRevenue),
    },
    {
      label: "Estimated Meals Funded",
      value: metrics.estimatedMealsFunded,
    },
  ];
}
