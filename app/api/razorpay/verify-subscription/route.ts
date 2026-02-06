import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';

/**
 * Verify a subscription's real status from Razorpay
 * 
 * This is important because:
 * 1. Users can revoke UPI mandates directly in GPay/PhonePe
 * 2. Razorpay doesn't get notified immediately when this happens
 * 3. We only find out when the next charge fails
 * 
 * Razorpay subscription statuses:
 * - created: Subscription created but not yet authenticated
 * - authenticated: Mandate set up, waiting for first charge
 * - active: Subscription is active and charging
 * - pending: Payment due, awaiting retry
 * - halted: Multiple payment failures, subscription paused
 * - cancelled: Subscription cancelled
 * - completed: All charges completed
 * - expired: Subscription period ended
 */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_ID || '',
  key_secret: process.env.RAZORPAY_LIVE_KEY || '',
});

// Map Razorpay status to our internal status
function mapRazorpayStatus(razorpayStatus: string): string {
  switch (razorpayStatus) {
    case 'active':
      return 'active';
    case 'authenticated':
      return 'authenticated'; // Mandate set up but not charged yet
    case 'pending':
      return 'payment_pending'; // Payment failed, awaiting retry
    case 'halted':
      return 'halted'; // Multiple failures - mandate likely revoked
    case 'cancelled':
      return 'cancelled';
    case 'paused':
      return 'paused';
    case 'completed':
    case 'expired':
      return 'expired';
    default:
      return razorpayStatus;
  }
}

// POST /api/razorpay/verify-subscription
// Verify a single subscription
export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, razorpaySubscriptionId } = await req.json();

    if (!razorpaySubscriptionId && !subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId or razorpaySubscriptionId is required' },
        { status: 400 }
      );
    }

    // If we only have our internal ID, fetch the Razorpay ID from Appwrite
    let razorpaySubId = razorpaySubscriptionId;
    let appwriteDocId = subscriptionId;

    if (!razorpaySubId && subscriptionId) {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        subscriptionId
      );
      razorpaySubId = (doc as any).razorpaySubscriptionId;
      appwriteDocId = doc.$id;
    }

    if (!razorpaySubId) {
      return NextResponse.json(
        { error: 'Could not find Razorpay subscription ID' },
        { status: 404 }
      );
    }

    // Fetch real status from Razorpay
    const razorpaySubscription = await razorpay.subscriptions.fetch(razorpaySubId);
    
    const razorpayStatus = razorpaySubscription.status;
    const mappedStatus = mapRazorpayStatus(razorpayStatus);
    
    // Get current status from our database
    let currentAppwriteStatus = 'unknown';
    if (appwriteDocId) {
      try {
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          [Query.equal('razorpaySubscriptionId', razorpaySubId)]
        );
        if (existing.documents.length > 0) {
          currentAppwriteStatus = (existing.documents[0] as any).status;
          appwriteDocId = existing.documents[0].$id;
        }
      } catch (e) {
        // Ignore
      }
    }

    const statusChanged = currentAppwriteStatus !== mappedStatus;
    const isAtRisk = ['payment_pending', 'halted', 'cancelled', 'expired'].includes(mappedStatus);

    // Build response with detailed info
    const response = {
      razorpaySubscriptionId: razorpaySubId,
      razorpayStatus,
      mappedStatus,
      currentAppwriteStatus,
      statusChanged,
      isAtRisk,
      razorpayDetails: {
        planId: razorpaySubscription.plan_id,
        totalCount: razorpaySubscription.total_count,
        paidCount: razorpaySubscription.paid_count,
        remainingCount: razorpaySubscription.remaining_count,
        currentStart: razorpaySubscription.current_start 
          ? new Date(razorpaySubscription.current_start * 1000).toISOString() 
          : null,
        currentEnd: razorpaySubscription.current_end 
          ? new Date(razorpaySubscription.current_end * 1000).toISOString() 
          : null,
        endedAt: razorpaySubscription.ended_at 
          ? new Date(razorpaySubscription.ended_at * 1000).toISOString() 
          : null,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    
    // Handle Razorpay API errors
    if (error.statusCode === 400 || error.error?.code === 'BAD_REQUEST_ERROR') {
      return NextResponse.json(
        { error: 'Invalid subscription ID or subscription not found in Razorpay' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/razorpay/verify-subscription
// Verify and sync a subscription (updates our database)
export async function PUT(req: NextRequest) {
  try {
    const { razorpaySubscriptionId } = await req.json();

    if (!razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'razorpaySubscriptionId is required' },
        { status: 400 }
      );
    }

    // Fetch real status from Razorpay
    const razorpaySubscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId);
    const razorpayStatus = razorpaySubscription.status;
    const mappedStatus = mapRazorpayStatus(razorpayStatus);

    // Find and update in Appwrite
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('razorpaySubscriptionId', razorpaySubscriptionId)]
    );

    if (existing.documents.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found in database' },
        { status: 404 }
      );
    }

    const doc = existing.documents[0];
    const previousStatus = (doc as any).status;

    // Update the status in Appwrite
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      doc.$id,
      {
        status: mappedStatus,
        // Update period dates if available
        ...(razorpaySubscription.current_start && {
          currentPeriodStart: new Date(razorpaySubscription.current_start * 1000).toISOString(),
        }),
        ...(razorpaySubscription.current_end && {
          currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000).toISOString(),
        }),
      }
    );

    return NextResponse.json({
      success: true,
      razorpaySubscriptionId,
      previousStatus,
      newStatus: mappedStatus,
      statusChanged: previousStatus !== mappedStatus,
      razorpayStatus,
    });
  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
