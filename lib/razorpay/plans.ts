// Razorpay Subscription Plan Configuration
// These plans need to be created in Razorpay Dashboard or via API

// Plans with amounts for both INR and USD
// USD prices are higher to cover payment processing fees and provide meaningful support
export const SUBSCRIPTION_PLANS = {
  // Weekly Plans
  seedling_weekly: {
    name: 'Seedling Weekly',
    amounts: { INR: 29, USD: 3 },
    interval: 1,
    period: 'weekly',
    planType: 'seedling' as const,
    description: 'Feed 1 stray animal weekly',
  },
  sprout_weekly: {
    name: 'Sprout Weekly',
    amounts: { INR: 99, USD: 5 },
    interval: 1,
    period: 'weekly',
    planType: 'sprout' as const,
    description: 'Feed 5 stray animals weekly',
  },
  tree_weekly: {
    name: 'Tree Weekly',
    amounts: { INR: 199, USD: 10 },
    interval: 1,
    period: 'weekly',
    planType: 'tree' as const,
    description: 'Feed 10 stray animals weekly',
  },
  // Monthly Plans
  seedling_monthly: {
    name: 'Seedling Monthly',
    amounts: { INR: 79, USD: 5 },
    interval: 1,
    period: 'monthly',
    planType: 'seedling' as const,
    description: 'Feed 1 stray animal monthly',
  },
  sprout_monthly: {
    name: 'Sprout Monthly',
    amounts: { INR: 499, USD: 10 },
    interval: 1,
    period: 'monthly',
    planType: 'sprout' as const,
    description: 'Feed 5 stray animals monthly',
  },
  tree_monthly: {
    name: 'Tree Monthly',
    amounts: { INR: 999, USD: 25 },
    interval: 1,
    period: 'monthly',
    planType: 'tree' as const,
    description: 'Feed 10 stray animals monthly',
  },
} as const;

export type Currency = 'INR' | 'USD';

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;
export type PlanType = 'seedling' | 'sprout' | 'tree';
export type BillingCycle = 'weekly' | 'monthly';

export function getPlanKey(planType: PlanType, billingCycle: BillingCycle): PlanKey {
  return `${planType}_${billingCycle}` as PlanKey;
}

export function getPlanDetails(planType: PlanType, billingCycle: BillingCycle, currency: Currency = 'INR') {
  const key = getPlanKey(planType, billingCycle);
  const plan = SUBSCRIPTION_PLANS[key];
  return {
    ...plan,
    amount: plan.amounts[currency],
    currency,
  };
}
