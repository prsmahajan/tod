import { NextRequest, NextResponse } from 'next/server';
import { parsePaymentVerificationBody, verifyPaymentSignature } from '@/lib/razorpay/verify-signature';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid payment verification parameters' },
        { status: 400 }
      );
    }

    const verification = parsePaymentVerificationBody(body);
    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid payment verification parameters' },
        { status: 400 }
      );
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification;

    const keySecret = process.env.RAZORPAY_LIVE_KEY;

    if (!keySecret) {
      console.error('Razorpay key secret not configured');
      return NextResponse.json(
        { error: 'Payment verification failed. Please contact support.' },
        { status: 500 }
      );
    }

    const isAuthentic = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret,
    );

    if (isAuthentic) {
      // Transaction recording remains authoritative in the Razorpay webhook.
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      // Signature verification failed
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
