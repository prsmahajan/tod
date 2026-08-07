import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';
import { syncSubscriptionToPostgres } from '@/lib/subscription-sync';
import { getPlanDetails, PlanType, BillingCycle } from '@/lib/razorpay/plans';
import { verifyWebhookSignature } from '@/lib/razorpay/verify-signature';
import {
  classifyCapturedPayment,
  getGatewayPaymentAttribution,
  isInrWebhookEntity,
  reconcilePaymentTransaction,
  reconcileSubscriptionWebhook,
  subscriptionStatusFromEvent,
} from '@/lib/razorpay/webhook-payment';

type StoredDocument = Record<string, any> & { $id: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event as string;
    const payload = event.payload;

    if (eventType === 'payment.captured') {
      await handlePaymentCaptured(payload.payment.entity);
    } else if (eventType === 'payment.failed') {
      await handlePaymentFailed(payload.payment.entity);
    } else if (eventType === 'subscription.charged') {
      await handleSubscriptionCharged(payload.subscription.entity, payload.payment?.entity);
    } else if (subscriptionStatusFromEvent(eventType)) {
      await handleSubscriptionLifecycle(payload.subscription.entity);
    } else {
      console.log('Unhandled Razorpay event type:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

async function findTransaction(paymentId: string): Promise<StoredDocument | null> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.TRANSACTIONS,
    [Query.equal('razorpayPaymentId', paymentId), Query.limit(1)],
  );
  return (response.documents[0] as StoredDocument | undefined) ?? null;
}

async function persistTransaction(
  payment: any,
  status: 'success' | 'failed',
  forcedSubscriptionId?: string,
) {
  const existing = await findTransaction(payment.id);
  const classification = classifyCapturedPayment(payment);
  const linkedSubscriptionId = forcedSubscriptionId
    || (typeof payment.subscription_id === 'string' ? payment.subscription_id : undefined)
    || (existing?.type === 'subscription' ? existing.razorpaySubscriptionId : undefined);
  const type = linkedSubscriptionId || existing?.type === 'subscription'
    ? 'subscription'
    : 'one-time';
  const notes = payment.notes || {};
  const attribution = getGatewayPaymentAttribution(payment);
  const document = {
    userId: existing?.userId || attribution.userId,
    userEmail: attribution.userEmail || existing?.userEmail || '',
    userName: existing?.userName || attribution.userName,
    amount: payment.amount / 100,
    type,
    status,
    razorpayPaymentId: payment.id,
    razorpayOrderId: payment.order_id || existing?.razorpayOrderId || '',
    ...(linkedSubscriptionId ? { razorpaySubscriptionId: linkedSubscriptionId } : {}),
    planType: notes.planType || existing?.planType || 'seedling',
    billingCycle: type === 'subscription'
      ? notes.billingCycle || existing?.billingCycle || 'monthly'
      : null,
  };

  return reconcilePaymentTransaction({
    paymentId: payment.id,
    existingTransaction: existing,
    document,
    findExistingTransaction: () => findTransaction(payment.id),
    createDocument: (documentId, data) => databases.createDocument<any>(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      documentId,
      data,
    ),
    updateDocument: (documentId, data) => databases.updateDocument<any>(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      documentId,
      data,
    ),
  });
}

async function handlePaymentCaptured(payment: any) {
  if (!isInrWebhookEntity(payment)) return;

  const classification = classifyCapturedPayment(payment);
  if (classification !== 'one-time') {
    console.log('Deferring captured recurring payment to subscription.charged:', payment.id);
    return;
  }

  const existing = await findTransaction(payment.id);
  if (existing?.type === 'subscription') {
    console.log('Recurring transaction already reconciled:', payment.id);
    return;
  }

  await persistTransaction(payment, 'success');
}

async function handlePaymentFailed(payment: any) {
  if (!isInrWebhookEntity(payment)) return;

  if (classifyCapturedPayment(payment) === 'defer') {
    console.log('Deferring invoice-linked payment failure:', payment.id);
    return;
  }

  await persistTransaction(payment, 'failed');
}

function createRazorpayClient() {
  const keyId = process.env.RAZORPAY_LIVE_ID;
  const keySecret = process.env.RAZORPAY_LIVE_KEY;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay subscription lookup is not configured');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function fetchAuthoritativeSubscription(subscriptionId: string) {
  const subscription = await createRazorpayClient().subscriptions.fetch(subscriptionId);
  return subscription as unknown as Record<string, unknown>;
}

function validPlanType(value: unknown): PlanType {
  return value === 'seedling' || value === 'sprout' || value === 'tree'
    ? value
    : 'seedling';
}

function validBillingCycle(value: unknown): BillingCycle {
  return value === 'weekly' || value === 'monthly' ? value : 'monthly';
}

function periodDate(value: unknown, fallback?: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return new Date(value * 1000).toISOString();
  }
  return typeof fallback === 'string' && fallback.length > 0 ? fallback : undefined;
}

function subscriptionAmount(
  subscription: Record<string, any>,
  existing: StoredDocument | null,
): number {
  const displayAmount = Number(subscription.notes?.displayAmount);
  if (Number.isFinite(displayAmount) && displayAmount > 0) return displayAmount;

  const planType = validPlanType(subscription.notes?.planType || existing?.planType);
  const billingCycle = validBillingCycle(subscription.notes?.billingCycle || existing?.billingCycle);
  return getPlanDetails(planType, billingCycle, 'INR').amount;
}

function assertAppwriteTransactionSupport(): void {
  const databaseApi = databases as unknown as Record<string, unknown>;
  const requiredMethods = [
    'createTransaction',
    'getDocument',
    'listDocuments',
    'createDocument',
    'updateDocument',
    'updateTransaction',
    'deleteTransaction',
  ];

  if (requiredMethods.some((method) => typeof databaseApi[method] !== 'function')) {
    throw new Error('Appwrite document transactions are required for subscription webhooks');
  }
}

function isDocumentNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const appwriteError = error as { code?: unknown; type?: unknown };
  return appwriteError.code === 404 || appwriteError.type === 'document_not_found';
}

async function readSubscriptionInTransaction(
  transactionId: string,
  subscriptionId: string,
): Promise<StoredDocument | null> {
  try {
    const direct = await databases.getDocument<any>({
      databaseId: DATABASE_ID,
      collectionId: COLLECTIONS.SUBSCRIPTIONS,
      documentId: subscriptionId,
      transactionId,
    });
    if (
      typeof direct.razorpaySubscriptionId === 'string'
      && direct.razorpaySubscriptionId !== subscriptionId
    ) {
      throw new Error('Subscription document ID belongs to another Razorpay subscription');
    }
    return direct as StoredDocument;
  } catch (error) {
    if (!isDocumentNotFound(error)) throw error;
  }

  // Older subscriptions used generated document IDs. Keep their lookup inside
  // this transaction so both old and new records receive the same CAS safety.
  const response = await databases.listDocuments<any>({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.SUBSCRIPTIONS,
    queries: [
      Query.equal('razorpaySubscriptionId', subscriptionId),
      Query.limit(2),
    ],
    transactionId,
  });
  if (response.documents.length > 1) {
    throw new Error('Multiple documents found for the same Razorpay subscription');
  }
  return (response.documents[0] as StoredDocument | undefined) ?? null;
}

function subscriptionReconciliationState(subscription: Record<string, unknown>): string {
  const notes = (subscription.notes || {}) as Record<string, unknown>;
  return JSON.stringify({
    status: subscription.status ?? null,
    planId: subscription.plan_id ?? null,
    currentStart: subscription.current_start ?? null,
    currentEnd: subscription.current_end ?? null,
    currency: subscription.currency ?? null,
    displayCurrency: notes.displayCurrency ?? null,
    planType: notes.planType ?? null,
    billingCycle: notes.billingCycle ?? null,
    displayAmount: notes.displayAmount ?? null,
  });
}

function buildSubscriptionDocument(
  subscription: Record<string, unknown>,
  existing: StoredDocument | null,
  payment?: any,
): Record<string, unknown> {
  const subscriptionId = subscription.id as string;
  const notes = (subscription.notes || {}) as Record<string, unknown>;
  const attribution = getGatewayPaymentAttribution(payment);
  const planType = validPlanType(notes.planType || existing?.planType);
  const billingCycle = validBillingCycle(notes.billingCycle || existing?.billingCycle);
  const currentPeriodStart = periodDate(subscription.current_start, existing?.currentPeriodStart);
  const currentPeriodEnd = periodDate(subscription.current_end, existing?.currentPeriodEnd);
  return {
    ...attribution,
    razorpaySubscriptionId: subscriptionId,
    planId: subscription.plan_id || existing?.planId || '',
    planType,
    billingCycle,
    amount: subscriptionAmount(subscription, existing),
    status: typeof subscription.status === 'string' ? subscription.status : 'pending',
    ...(currentPeriodStart ? { currentPeriodStart } : {}),
    ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
  };
}

async function persistAuthoritativeSubscription(webhookEntity: Record<string, unknown>, payment?: any) {
  assertAppwriteTransactionSupport();
  const reconciliation = await reconcileSubscriptionWebhook({
    webhookEntity,
    payment,
    syncSubscription: (document) => syncSubscriptionToPostgres(document as any),
    fetchSubscription: fetchAuthoritativeSubscription,
    shouldPersist: isInrWebhookEntity,
    relevantState: subscriptionReconciliationState,
    buildDocument: (subscription, existing) => buildSubscriptionDocument(
      subscription,
      existing as StoredDocument | null,
      payment,
    ),
    store: {
      createTransaction: async () => {
        const transaction = await databases.createTransaction({ ttl: 30 });
        return { $id: transaction.$id };
      },
      readDocument: readSubscriptionInTransaction,
      readCommitted: (documentId) => databases.getDocument<any>({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.SUBSCRIPTIONS,
        documentId,
      }) as Promise<StoredDocument>,
      stageCreate: (transactionId, documentId, data) => databases.createDocument<any>({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.SUBSCRIPTIONS,
        documentId,
        data,
        transactionId,
      }),
      stageUpdate: (transactionId, documentId, data) => databases.updateDocument<any>({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.SUBSCRIPTIONS,
        documentId,
        data,
        transactionId,
      }),
      commitTransaction: (transactionId) => databases.updateTransaction({
        transactionId,
        commit: true,
      }),
      rollbackTransaction: (transactionId) => databases.updateTransaction({
        transactionId,
        rollback: true,
      }),
      deleteTransaction: (transactionId) => databases.deleteTransaction({ transactionId }),
    },
  });

  console.log(
    `Subscription ${String(reconciliation.subscription.id)} reconciled from Razorpay:`,
    reconciliation.result,
  );
  return reconciliation.subscription;
}

async function handleSubscriptionLifecycle(subscription: Record<string, unknown>) {
  await persistAuthoritativeSubscription(subscription);
}

async function handleSubscriptionCharged(subscription: Record<string, unknown>, payment?: any) {
  const authoritative = await persistAuthoritativeSubscription(subscription, payment);
  if (!payment || !isInrWebhookEntity(payment) || !isInrWebhookEntity(authoritative)) return;
  await persistTransaction(payment, 'success', authoritative.id as string);
}
