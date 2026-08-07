import { DonationPlan, getDonationAmount } from '@/lib/donations/public-rules';
import { BillingCycle, Currency, PlanType } from '@/lib/razorpay/plans';

const DONATION_PLANS: DonationPlan[] = ['seedling', 'sprout', 'tree', 'custom'];
const SUBSCRIPTION_PLANS: PlanType[] = ['seedling', 'sprout', 'tree'];
const BILLING_CYCLES: BillingCycle[] = ['weekly', 'monthly'];

interface GuestOrderRequest {
  planType: DonationPlan;
  amount: number;
}

interface GuestSubscriptionRequest {
  planType: PlanType;
  billingCycle: BillingCycle;
  currency: Currency;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid request body');
  }
  return value as Record<string, unknown>;
}

export function parseGuestOrderRequest(value: unknown): GuestOrderRequest {
  const body = asRecord(value);
  if (!DONATION_PLANS.includes(body.planType as DonationPlan)) {
    throw new Error('Invalid donation plan');
  }

  const planType = body.planType as DonationPlan;
  return {
    planType,
    amount: getDonationAmount(planType, body.customAmount as number | undefined),
  };
}

export function parseGuestSubscriptionRequest(value: unknown): GuestSubscriptionRequest {
  const body = asRecord(value);
  if (
    !SUBSCRIPTION_PLANS.includes(body.planType as PlanType)
    || !BILLING_CYCLES.includes(body.billingCycle as BillingCycle)
  ) {
    throw new Error('Invalid subscription plan');
  }

  return {
    planType: body.planType as PlanType,
    billingCycle: body.billingCycle as BillingCycle,
    currency: body.currency === 'USD' ? 'USD' : 'INR',
  };
}
