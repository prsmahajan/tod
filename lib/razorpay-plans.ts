/**
 * Razorpay Plan Management
 * Caches plan IDs to avoid creating duplicates
 */

import Razorpay from 'razorpay';

// In-memory cache for plan IDs (resets on server restart, which is fine)
const planCache = new Map<string, string>();

export interface PlanDetails {
  name: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  description: string;
}

/**
 * Get or create a Razorpay plan
 * Uses caching to avoid duplicate plan creation
 */
export async function getOrCreatePlan(
  razorpay: Razorpay,
  planDetails: PlanDetails
): Promise<string> {
  // Create cache key from plan details
  const cacheKey = `${planDetails.name}_${planDetails.amount}_${planDetails.period}_${planDetails.interval}`;

  // Check cache first
  const cachedPlanId = planCache.get(cacheKey);
  if (cachedPlanId) {
    console.log('Using cached plan:', cachedPlanId);
    return cachedPlanId;
  }

  try {
    // Try to create the plan
    const plan = await razorpay.plans.create({
      period: planDetails.period,
      interval: planDetails.interval,
      item: {
        name: planDetails.name,
        amount: planDetails.amount * 100, // Convert to paise
        currency: planDetails.currency,
        description: planDetails.description,
      },
    });

    // Cache the plan ID
    planCache.set(cacheKey, plan.id);
    console.log('Created and cached new plan:', plan.id);

    return plan.id;
  } catch (error: any) {
    // If plan already exists, try to fetch it
    if (error.error && error.error.code === 'BAD_REQUEST_ERROR') {
      try {
        // Fetch all plans and find matching one
        const plans = await razorpay.plans.all();
        const matchingPlan = plans.items.find((p: any) =>
          p.item.name === planDetails.name &&
          p.item.amount === planDetails.amount * 100 &&
          p.period === planDetails.period &&
          p.interval === planDetails.interval
        );

        if (matchingPlan) {
          // Cache the found plan
          planCache.set(cacheKey, matchingPlan.id);
          console.log('Found and cached existing plan:', matchingPlan.id);
          return matchingPlan.id;
        }
      } catch (fetchError) {
        console.error('Error fetching existing plans:', fetchError);
      }
    }

    // If all else fails, create with timestamp (fallback)
    console.warn('Creating plan with timestamp fallback');
    const fallbackPlan = await razorpay.plans.create({
      period: planDetails.period,
      interval: planDetails.interval,
      item: {
        name: `${planDetails.name}_${Date.now()}`,
        amount: planDetails.amount * 100,
        currency: planDetails.currency,
        description: planDetails.description,
      },
    });

    return fallbackPlan.id;
  }
}

/**
 * Clear plan cache (useful for testing or manual refresh)
 */
export function clearPlanCache() {
  planCache.clear();
  console.log('Plan cache cleared');
}

/**
 * Get cache statistics
 */
export function getPlanCacheStats() {
  return {
    size: planCache.size,
    keys: Array.from(planCache.keys()),
  };
}
