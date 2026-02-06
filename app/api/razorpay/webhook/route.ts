import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite/server';
import { syncSubscriptionToPostgres, getSubscriptionByEmail } from '@/lib/subscription-sync';
import { getPlanDetails, PlanType, BillingCycle } from '@/lib/razorpay-plans';

// Verify Razorpay 
// signature
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

    // Webhook signature verification is REQUIRED for security
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
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
    const userEmail = notes.userEmail || payment.email || '';

    // Check multiple signals to detect if this is a subscription payment:
    // 1. payment.subscription_id is set by Razorpay for subscription payments
    // 2. notes.billingCycle was passed during checkout
    // 3. Check if there's an active/pending subscription in our DB for this user
    let isSubscriptionPayment = !!payment.subscription_id || !!notes.billingCycle;

    // If not detected yet, check our database for a subscription with this email
    // This catches cases where Razorpay doesn't populate subscription_id on the first payment
    if (!isSubscriptionPayment && userEmail) {
      try {
        const recentSubscriptions = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          [
            Query.equal('userEmail', userEmail),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
          ]
        );

        if (recentSubscriptions.documents.length > 0) {
          const sub = recentSubscriptions.documents[0] as any;
          // If user has a subscription created recently (within 10 minutes) and status is active/pending
          const subCreatedAt = new Date(sub.$createdAt).getTime();
          const now = Date.now();
          const tenMinutes = 10 * 60 * 1000;

          if (now - subCreatedAt < tenMinutes && ['active', 'pending', 'authenticated'].includes(sub.status)) {
            console.log('Detected subscription payment via DB lookup for:', payment.id);
            isSubscriptionPayment = true;
          }

          // Also check if payment amount matches the subscription amount
          const paymentAmount = payment.amount / 100;
          if (sub.amount && sub.amount === paymentAmount) {
            console.log('Detected subscription payment via amount match for:', payment.id);
            isSubscriptionPayment = true;
          }
        }
      } catch (dbError) {
        console.error('Error checking for existing subscription:', dbError);
      }
    }

    // Also check if this payment amount matches known subscription prices (not one-time prices)
    // Subscription prices: 29, 79, 99, 199, 499, 999 (weekly/monthly combos)
    // One-time prices: 99, 499, 999
    // The overlapping prices (99, 499, 999) are ambiguous, but 29, 79, 199 are subscription-only
    const subscriptionOnlyPrices = [29, 79, 199];
    const paymentAmount = payment.amount / 100;
    if (subscriptionOnlyPrices.includes(paymentAmount)) {
      console.log('Detected subscription payment via subscription-only price:', paymentAmount);
      isSubscriptionPayment = true;
    }

    if (isSubscriptionPayment) {
      console.log('Skipping payment.captured for subscription payment:', payment.id, 'Amount:', paymentAmount);
      return;
    }

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: notes.userId || 'anonymous',
        userEmail: userEmail,
        userName: notes.userName || '',
        amount: paymentAmount,
        type: 'one-time',
        status: 'success',
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id || '',
        planType: notes.planType || 'seedling',
        billingCycle: notes.billingCycle || null,
      }
    );
    console.log('Transaction recorded as one-time for payment:', payment.id, 'Amount:', paymentAmount);
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

    // Work out the subscription amount in INR:
    // 1) prefer the displayAmount we set in notes when creating the subscription
    //    (Razorpay may return it as a string, so handle both)
    // 2) otherwise, derive it from our local plan config using planType + billingCycle
    // 3) final fallback: hardcoded plan prices
    let computedAmount: number | null = null;
    
    // Check displayAmount (could be number or string from Razorpay)
    if (notes.displayAmount !== undefined && notes.displayAmount !== null) {
      const parsed = Number(notes.displayAmount);
      if (!isNaN(parsed) && parsed > 0) {
        computedAmount = parsed;
      }
    }
    
    // Fallback to getPlanDetails
    if (!computedAmount) {
      try {
        const planType = (notes.planType || 'seedling') as PlanType;
        const billingCycle = (notes.billingCycle || 'monthly') as BillingCycle;
        const planDetails = getPlanDetails(planType, billingCycle, 'INR');
        computedAmount = planDetails.amount;
      } catch (e) {
        console.warn('Could not derive plan amount from config for subscription', subscription.id, e);
      }
    }
    
    // Final fallback: hardcoded prices
    if (!computedAmount) {
      const planType = notes.planType || 'seedling';
      const billingCycle = notes.billingCycle || 'monthly';
      const isWeekly = billingCycle === 'weekly';
      if (planType === 'seedling') computedAmount = isWeekly ? 29 : 79;
      else if (planType === 'sprout') computedAmount = isWeekly ? 99 : 499;
      else if (planType === 'tree') computedAmount = isWeekly ? 199 : 999;
    }
    
    console.log('Computed subscription amount:', computedAmount, 'from notes:', notes);

    // Check if subscription already exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.equal('razorpaySubscriptionId', subscription.id)]
    );

    if (existing.documents.length > 0) {
      // Update existing, but don't overwrite a non-zero amount with 0
      const current = existing.documents[0] as any;
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        current.$id,
        {
          status: 'active',
          currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
          amount: computedAmount ?? current.amount ?? 0,
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
          // Store the actual plan amount (in INR)
          amount: computedAmount ?? 0,
          status: 'active',
          currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
        }
      );
    }
    console.log('Subscription activated:', subscription.id);

    // Sync to PostgreSQL
    try {
      const appwriteSubscription = await getSubscriptionByEmail(notes.customerEmail || '');
      if (appwriteSubscription) {
        await syncSubscriptionToPostgres(appwriteSubscription);
      }
    } catch (syncError) {
      console.error('Error syncing to PostgreSQL:', syncError);
      // Don't fail the webhook if sync fails
    }
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
      // Check if this payment was already recorded (prevent duplicates)
      const existingTransaction = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.equal('razorpayPaymentId', payment.id)]
      );

      if (existingTransaction.documents.length > 0) {
        // Transaction already exists - check if it was incorrectly recorded as one-time
        const existing = existingTransaction.documents[0] as any;
        if (existing.type === 'one-time') {
          // Fix the incorrectly recorded transaction
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TRANSACTIONS,
            existing.$id,
            {
              type: 'subscription',
              razorpaySubscriptionId: subscription.id,
              planType: notes.planType || existing.planType || 'seedling',
              billingCycle: notes.billingCycle || existing.billingCycle || 'monthly',
            }
          );
          console.log('Fixed transaction type from one-time to subscription:', payment.id);
        } else {
          console.log('Transaction already exists for payment:', payment.id);
        }
      } else {
        // Create new transaction
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
        console.log('Subscription transaction recorded for payment:', payment.id);
      }
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

      // Sync to PostgreSQL
      try {
        const appwriteSub = existing.documents[0] as any;
        await syncSubscriptionToPostgres(appwriteSub);
      } catch (syncError) {
        console.error('Error syncing status update to PostgreSQL:', syncError);
      }
    }
    console.log(`Subscription ${subscriptionId} status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating subscription status:', error);
  }
}
