import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite/server';

// Verify Razorpay webhook signature
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature if webhook secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    console.log('Received Razorpay webhook:', eventType);

    switch (eventType) {
      // One-time payment events
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;

      // Subscription events
      case 'subscription.activated':
        await handleSubscriptionActivated(payload.subscription.entity);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity, payload.payment?.entity);
        break;

      case 'subscription.pending':
        await handleSubscriptionPending(payload.subscription.entity);
        break;

      case 'subscription.halted':
        await handleSubscriptionHalted(payload.subscription.entity);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(payload.subscription.entity);
        break;

      case 'subscription.resumed':
        await handleSubscriptionResumed(payload.subscription.entity);
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle one-time payment captured
async function handlePaymentCaptured(payment: any) {
  try {
    const notes = payment.notes || {};

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: notes.userId || 'anonymous',
        userEmail: notes.userEmail || payment.email || '',
        userName: notes.userName || '',
        amount: payment.amount / 100, // Convert from paise
        type: 'one-time',
        status: 'success',
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id || '',
        planType: notes.planType || 'seedling',
        billingCycle: notes.billingCycle || 'monthly',
      }
    );
    console.log('Transaction recorded for payment:', payment.id);
  } catch (error) {
    console.error('Error recording payment:', error);
  }
}

// Handle payment failed
async function handlePaymentFailed(payment: any) {
  try {
    const notes = payment.notes || {};

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: notes.userId || 'anonymous',
        userEmail: notes.userEmail || payment.email || '',
        userName: notes.userName || '',
        amount: payment.amount / 100,
        type: 'one-time',
        status: 'failed',
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id || '',
        planType: notes.planType || 'seedling',
        billingCycle: notes.billingCycle || 'monthly',
      }
    );
  } catch (error) {
    console.error('Error recording failed payment:', error);
  }
}

// Handle subscription activated
async function handleSubscriptionActivated(subscription: any) {
  try {
    const notes = subscription.notes || {};

    // Check if subscription already exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('razorpaySubscriptionId', subscription.id)]
    );

    if (existing.documents.length > 0) {
      // Update existing
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        existing.documents[0].$id,
        {
          status: 'active',
          currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
        }
      );
    } else {
      // Create new
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        ID.unique(),
        {
          userId: notes.userId || 'anonymous',
          userEmail: notes.customerEmail || '',
          userName: notes.customerName || '',
          razorpaySubscriptionId: subscription.id,
          planId: subscription.plan_id,
          planType: notes.planType || 'seedling',
          billingCycle: notes.billingCycle || 'monthly',
          amount: subscription.plan_id ? 0 : 0, // Will be updated from plan
          status: 'active',
          currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
        }
      );
    }
    console.log('Subscription activated:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription activation:', error);
  }
}

// Handle subscription charged (recurring payment)
async function handleSubscriptionCharged(subscription: any, payment?: any) {
  try {
    const notes = subscription.notes || {};

    // Record the transaction
    if (payment) {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: notes.userId || 'anonymous',
          userEmail: notes.customerEmail || payment.email || '',
          userName: notes.customerName || '',
          amount: payment.amount / 100,
          type: 'subscription',
          status: 'success',
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id || '',
          razorpaySubscriptionId: subscription.id,
          planType: notes.planType || 'seedling',
          billingCycle: notes.billingCycle || 'monthly',
        }
      );
    }

    // Update subscription period
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('razorpaySubscriptionId', subscription.id)]
    );

    if (existing.documents.length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        existing.documents[0].$id,
        {
          currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
          status: 'active',
        }
      );
    }
    console.log('Subscription charged:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription charge:', error);
  }
}

// Handle subscription pending
async function handleSubscriptionPending(subscription: any) {
  await updateSubscriptionStatus(subscription.id, 'pending');
}

// Handle subscription halted (payment failed multiple times)
async function handleSubscriptionHalted(subscription: any) {
  await updateSubscriptionStatus(subscription.id, 'halted');
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(subscription: any) {
  await updateSubscriptionStatus(subscription.id, 'cancelled');
}

// Handle subscription paused
async function handleSubscriptionPaused(subscription: any) {
  await updateSubscriptionStatus(subscription.id, 'paused');
}

// Handle subscription resumed
async function handleSubscriptionResumed(subscription: any) {
  await updateSubscriptionStatus(subscription.id, 'active');
}

// Helper to update subscription status
async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('razorpaySubscriptionId', subscriptionId)]
    );

    if (existing.documents.length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        existing.documents[0].$id,
        { status }
      );
    }
    console.log(`Subscription ${subscriptionId} status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating subscription status:', error);
  }
}
