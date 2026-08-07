export interface RawPublicStats {
  totalRevenue: number;
  totalSupporters: number;
  activeSubscriptions: number;
  animalsHelped: number;
}

export interface PublicImpactMetrics {
  raisedInr: number;
  supporters: number;
  activeSupporters: number;
  estimatedMealsFunded: number;
}

export function toPublicImpactMetrics(stats: RawPublicStats): PublicImpactMetrics {
  return {
    raisedInr: stats.totalRevenue,
    supporters: stats.totalSupporters,
    activeSupporters: stats.activeSubscriptions,
    estimatedMealsFunded: stats.animalsHelped,
  };
}
