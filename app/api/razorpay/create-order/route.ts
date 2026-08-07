import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { DonationPlan, getDonationAmount } from '@/lib/donations/public-rules';

interface CreateOrderBody {
  planType: DonationPlan;
  customAmount?: number;
  notes?: Record<string, string>;
}

const DONATION_PLANS: DonationPlan[] = ['seedling', 'sprout', 'tree', 'custom'];

export async function POST(req: NextRequest) {
  try {
    let body: CreateOrderBody;
    try {
      body = await req.json() as CreateOrderBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { planType, customAmount, notes } = body;

    if (!DONATION_PLANS.includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid donation plan' },
        { status: 400 }
      );
    }

    if (
      notes !== undefined
      && (
        typeof notes !== 'object'
        || notes === null
        || Array.isArray(notes)
        || Object.values(notes).some((value) => typeof value !== 'string')
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid order notes' },
        { status: 400 }
      );
    }

    let amount: number;
    try {
      amount = getDonationAmount(planType, customAmount);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid donation amount' },
        { status: 400 }
      );
    }

    // Check if Razorpay credentials are configured
    const keyId = process.env.RAZORPAY_LIVE_ID;
    const keySecret = process.env.RAZORPAY_LIVE_KEY;

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create order options
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        ...(notes || {}),
        planType,
      },
    };

    // Create order
    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Send key_id to frontend for checkout
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
