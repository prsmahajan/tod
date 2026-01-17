import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, userId, cancelAtCycleEnd = true } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_TEST_ID;
    const keySecret = process.env.RAZORPAY_TEST_KEY;

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

    // Cancel the subscription in Razorpay
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);

    // Update subscription status in Appwrite
    try {
      const existingSubscriptions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        [Query.equal('razorpaySubscriptionId', subscriptionId)]
      );

      if (existingSubscriptions.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          existingSubscriptions.documents[0].$id,
          {
            status: 'cancelled',
          }
        );
      }
    } catch (dbError) {
      console.error('Error updating subscription in database:', dbError);
      // Don't fail the request if DB update fails
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelledAt: cancelAtCycleEnd ? 'end_of_cycle' : 'immediately',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
