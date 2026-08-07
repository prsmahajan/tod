import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';
import { syncSubscriptionToPostgres } from '@/lib/subscription-sync';
import { getPlanDetails, PlanType, BillingCycle } from '@/lib/razorpay/plans';
import { verifyWebhookSignature } from '@/lib/razorpay/verify-signature';
import {
  classifyCapturedPayment,
  createTransactionOnce,
  getGatewayPaymentAttribution,
  isInrWebhookEntity,
  persistSubscriptionActivation,
  persistSubscriptionStatus,
} from '@/lib/razorpay/webhook-payment';

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
  if (!isInrWebhookEntity(payment)) {
    console.log('Ignoring non-INR payment.captured event:', payment.id);
    return;
  }

  if (classifyCapturedPayment(payment) === 'subscription') {
    console.log('Skipping payment.captured with authoritative subscription linkage:', payment.id);
    return;
  }

  const notes = payment.notes || {};
  const attribution = getGatewayPaymentAttribution(payment);
  const paymentAmount = payment.amount / 100;

  const result = await createTransactionOnce({
    paymentId: payment.id,
    transactionExists: async () => {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.equal('razorpayPaymentId', payment.id)]
      );
      return existing.documents.length > 0;
    },
    createDocument: (documentId) => databases.createDocument<any>(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      documentId,
      {
        ...attribution,
        amount: paymentAmount,
        type: 'one-time',
        status: 'success',
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id || '',
        planType: notes.planType || 'seedling',
        billingCycle: null,
      }
    ),
  });
  console.log(
    result === 'created' ? 'Transaction recorded as one-time for payment:' : 'Transaction already recorded for payment:',
    payment.id,
    'Amount:',
    paymentAmount,
  );
}

// Handle payment failed
async function handlePaymentFailed(payment: any) {
  if (!isInrWebhookEntity(payment)) {
    console.log('Ignoring non-INR payment.failed event:', payment.id);
    return;
  }

  const notes = payment.notes || {};
  const attribution = getGatewayPaymentAttribution(payment);
  await createTransactionOnce({
    paymentId: payment.id,
    transactionExists: async () => {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.equal('razorpayPaymentId', payment.id)],
      );
      return existing.documents.length > 0;
    },
    createDocument: (documentId) => databases.createDocument<any>(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      documentId,
      {
        ...attribution,
        amount: payment.amount / 100,
        type: classifyCapturedPayment(payment),
        status: 'failed',
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id || '',
        ...(payment.subscription_id ? { razorpaySubscriptionId: payment.subscription_id } : {}),
        planType: notes.planType || 'seedling',
        billingCycle: notes.billingCycle || null,
      },
    ),
  });
}

// Handle subscription activated
async function handleSubscriptionActivated(subscription: any) {
  if (!isInrWebhookEntity(subscription)) {
    console.log('Ignoring non-INR subscription activation:', subscription.id);
    return;
  }

  const notes = subscription.notes || {};

  // Prefer the server-owned display amount in the provider notes, then derive
  // the INR amount from the local plan configuration.
  let computedAmount: number | null = null;

  if (notes.displayAmount !== undefined && notes.displayAmount !== null) {
    const parsed = Number(notes.displayAmount);
    if (!isNaN(parsed) && parsed > 0) {
      computedAmount = parsed;
    }
  }

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

  if (!computedAmount) {
    const planType = notes.planType || 'seedling';
    const billingCycle = notes.billingCycle || 'monthly';
    const isWeekly = billingCycle === 'weekly';
    if (planType === 'seedling') computedAmount = isWeekly ? 29 : 79;
    else if (planType === 'sprout') computedAmount = isWeekly ? 99 : 499;
    else if (planType === 'tree') computedAmount = isWeekly ? 199 : 999;
  }

  console.log('Computed subscription amount:', computedAmount, 'from notes:', notes);

  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.SUBSCRIPTIONS,
    [Query.equal('razorpaySubscriptionId', subscription.id)]
  );

  const current = existing.documents[0] as any | undefined;
  await persistSubscriptionActivation({
    providerSubscriptionId: subscription.id,
    existingDocumentId: current?.$id ?? null,
    updateDocument: (documentId) => databases.updateDocument<any>(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      documentId,
      {
        status: 'active',
        currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
        amount: computedAmount ?? current?.amount ?? 0,
      },
    ),
    createDocument: (documentId) => databases.createDocument<any>(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      documentId,
      {
        userId: 'anonymous',
        userEmail: '',
        userName: '',
        razorpaySubscriptionId: subscription.id,
        planId: subscription.plan_id,
        planType: notes.planType || 'seedling',
        billingCycle: notes.billingCycle || 'monthly',
        amount: computedAmount ?? 0,
        status: 'active',
        currentPeriodStart: new Date(subscription.current_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_end * 1000).toISOString(),
      },
    ),
  });
  console.log('Subscription activated:', subscription.id);
}

// Handle subscription charged (recurring payment)
async function handleSubscriptionCharged(subscription: any, payment?: any) {
  if (!isInrWebhookEntity(subscription) || (payment && !isInrWebhookEntity(payment))) {
    console.log('Ignoring non-INR subscription charge:', subscription.id);
    return;
  }

  const notes = subscription.notes || {};

  if (payment) {
    const attribution = getGatewayPaymentAttribution(payment);
    const result = await createTransactionOnce({
      paymentId: payment.id,
      transactionExists: async () => {
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          [Query.equal('razorpayPaymentId', payment.id)],
        );
        return existing.documents.length > 0;
      },
      createDocument: (documentId) => databases.createDocument<any>(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        documentId,
        {
          ...attribution,
          amount: payment.amount / 100,
          type: 'subscription',
          status: 'success',
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id || '',
          razorpaySubscriptionId: subscription.id,
          planType: notes.planType || 'seedling',
          billingCycle: notes.billingCycle || 'monthly',
        }
      ),
    });
    console.log(
      result === 'created' ? 'Subscription transaction recorded for payment:' : 'Subscription transaction already recorded:',
      payment.id,
    );
  }

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
        ...(payment?.email ? { userEmail: payment.email } : {}),
      }
    );
  }
  console.log('Subscription charged:', subscription.id);
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
  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.SUBSCRIPTIONS,
    [Query.equal('razorpaySubscriptionId', subscriptionId)]
  );

  const existingDocument = existing.documents[0];
  const persisted = await persistSubscriptionStatus({
    existingDocumentId: existingDocument?.$id ?? null,
    updateDocument: (documentId) => databases.updateDocument<any>(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      documentId,
      { status },
    ),
  });

  if (persisted && existingDocument) {
    // Appwrite is authoritative for the public status. The legacy PostgreSQL
    // mirror remains best-effort after that persistence succeeds.
    try {
      const appwriteSub = existing.documents[0] as any;
      await syncSubscriptionToPostgres(appwriteSub);
    } catch (syncError) {
      console.error('Error syncing status update to PostgreSQL:', syncError);
    }
  }
  console.log(`Subscription ${subscriptionId} status updated to: ${status}`);
}
