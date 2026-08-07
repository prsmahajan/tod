import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getPlanDetails } from '@/lib/razorpay/plans';
import { parseGuestSubscriptionRequest } from '@/lib/razorpay/guest-checkout';
import { createServerCheckoutSelection } from '@/lib/analytics/support-funnel';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let request: ReturnType<typeof parseGuestSubscriptionRequest>;
    try {
      request = parseGuestSubscriptionRequest(body);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid subscription plan' },
        { status: 400 }
      );
    }
    const { planType, billingCycle, currency: validCurrency } = request;

    const keyId = process.env.RAZORPAY_LIVE_ID;
    const keySecret = process.env.RAZORPAY_LIVE_KEY;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Get plan details with the specified currency
    const planDetails = getPlanDetails(planType, billingCycle, validCurrency);

    // First, create or get the plan in Razorpay
    let planId: string;
    // Include currency in plan name to differentiate INR vs USD plans
    const planName = `${planDetails.name} (${validCurrency})`;

    try {
      // Try to create the plan (will fail if already exists with same name)
      const plan = await razorpay.plans.create({
        period: planDetails.period,
        interval: planDetails.interval,
        item: {
          name: planName,
          amount: planDetails.amount * 100, // Convert to smallest unit (paise/cents)
          currency: validCurrency,
          description: planDetails.description,
        },
      });
      planId = plan.id;
    } catch (error: any) {
      // If plan creation fails, try to fetch existing plans
      // For now, we'll create a unique plan each time with timestamp
      const plan = await razorpay.plans.create({
        period: planDetails.period,
        interval: planDetails.interval,
        item: {
          name: `${planName}_${Date.now()}`,
          amount: planDetails.amount * 100,
          currency: validCurrency,
          description: planDetails.description,
        },
      });
      planId = plan.id;
    }

    // Create subscription
    const subscriptionOptions: any = {
      plan_id: planId,
      total_count: billingCycle === 'weekly' ? 104 : 24, // 2 years worth
      customer_notify: 1,
      notes: {
        planType,
        billingCycle,
        userId: 'anonymous',
        // Keep persisted amounts server-owned even if a client submits display fields.
        displayAmount: planDetails.amount,
        displayCurrency: validCurrency,
      },
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);

    return NextResponse.json({
      subscriptionId: subscription.id,
      planId: planId,
      amount: planDetails.amount,
      currency: validCurrency,
      planType,
      billingCycle,
      shortUrl: subscription.short_url,
      keyId,
      analytics: createServerCheckoutSelection(planType, planDetails.amount),
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
