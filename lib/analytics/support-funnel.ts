import type { FunnelPlanType } from "./events";

export interface CheckoutSelection {
  planType: FunnelPlanType;
  amount: number;
}

interface SupportCardSelectionInput {
  currentAmount: number;
  displayedAmount: number;
  planType: FunnelPlanType;
}

const planTypes = new Set<string>(["seedling", "sprout", "tree", "custom"]);

function isPlanType(value: unknown): value is FunnelPlanType {
  return typeof value === "string" && planTypes.has(value);
}

function isAmount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0 && (value as number) <= 100_000;
}

export function getSupportCardSelection({
  currentAmount,
  planType,
}: SupportCardSelectionInput): CheckoutSelection {
  return { planType, amount: currentAmount };
}

export function createServerCheckoutSelection(
  planType: unknown,
  amount: unknown,
): CheckoutSelection | null {
  if (!isPlanType(planType) || !isAmount(amount)) return null;
  if (planType === "custom" && (amount as number) < 50) return null;
  return { planType, amount };
}

export function parseServerCheckoutSelection(value: unknown): CheckoutSelection | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const analytics = (value as Record<string, unknown>).analytics;
  if (typeof analytics !== "object" || analytics === null || Array.isArray(analytics)) return null;

  const fields = analytics as Record<string, unknown>;
  return createServerCheckoutSelection(fields.planType, fields.amount);
}
