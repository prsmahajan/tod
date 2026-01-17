// Razorpay Subscription Plan Configuration
// These plans need to be created in Razorpay Dashboard or via API

export const SUBSCRIPTION_PLANS = {
  // Weekly Plans
  seedling_weekly: {
    name: 'Seedling Weekly',
    amount: 29,
    currency: 'INR',
    interval: 1,
    period: 'weekly',
    planType: 'seedling' as const,
    description: 'Feed 1 stray animal weekly',
  },
  sprout_weekly: {
    name: 'Sprout Weekly',
    amount: 99,
    currency: 'INR',
    interval: 1,
    period: 'weekly',
    planType: 'sprout' as const,
    description: 'Feed 5 stray animals weekly',
  },
  tree_weekly: {
    name: 'Tree Weekly',
    amount: 199,
    currency: 'INR',
    interval: 1,
    period: 'weekly',
    planType: 'tree' as const,
    description: 'Feed 10 stray animals weekly',
  },
  // Monthly Plans
  seedling_monthly: {
    name: 'Seedling Monthly',
    amount: 79,
    currency: 'INR',
    interval: 1,
    period: 'monthly',
    planType: 'seedling' as const,
    description: 'Feed 1 stray animal monthly',
  },
  sprout_monthly: {
    name: 'Sprout Monthly',
    amount: 499,
    currency: 'INR',
    interval: 1,
    period: 'monthly',
    planType: 'sprout' as const,
    description: 'Feed 5 stray animals monthly',
  },
  tree_monthly: {
    name: 'Tree Monthly',
    amount: 999,
    currency: 'INR',
    interval: 1,
    period: 'monthly',
    planType: 'tree' as const,
    description: 'Feed 10 stray animals monthly',
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;
export type PlanType = 'seedling' | 'sprout' | 'tree';
export type BillingCycle = 'weekly' | 'monthly';

export function getPlanKey(planType: PlanType, billingCycle: BillingCycle): PlanKey {
  return `${planType}_${billingCycle}` as PlanKey;
}

export function getPlanDetails(planType: PlanType, billingCycle: BillingCycle) {
  const key = getPlanKey(planType, billingCycle);
  return SUBSCRIPTION_PLANS[key];
}
