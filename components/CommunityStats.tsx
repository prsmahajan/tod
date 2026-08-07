import React from "react";

interface CommunityStatsProps {
  variant?: "full" | "compact";
  className?: string;
}

export function CommunityStatsDisplay({ className = "" }: Pick<CommunityStatsProps, "className">) {
  return (
    <div className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 ${className}`}>
      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
        Contribution totals are under verification
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        Public amount and meal estimates are temporarily hidden while historical payment currencies are verified.
      </p>
    </div>
  );
}

export default function CommunityStats({ className = "" }: CommunityStatsProps) {
  return <CommunityStatsDisplay className={className} />;
}
