export interface RawPublicStats {
  totalRevenue: number;
  animalsHelped: number;
}

export interface PublicImpactMetrics {
  raisedInr: number;
  estimatedMealsFunded: number;
}

export function toPublicImpactMetrics(stats: RawPublicStats): PublicImpactMetrics {
  return {
    raisedInr: stats.totalRevenue,
    estimatedMealsFunded: stats.animalsHelped,
  };
}

interface PublicTransactionInput {
  status?: unknown;
  amount?: unknown;
  currency?: unknown;
}

export function sumConfirmedInrTransactions(
  transactions: PublicTransactionInput[],
): number {
  return transactions.reduce((total, transaction) => {
    if (transaction.status !== "success") return total;
    if (typeof transaction.currency === "string" && transaction.currency !== "INR") return total;
    if (!Number.isFinite(transaction.amount) || (transaction.amount as number) < 0) return total;
    return total + (transaction.amount as number);
  }, 0);
}
