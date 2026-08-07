export interface GatewayPaymentAttribution {
  userId: 'anonymous';
  userEmail: string;
  userName: '';
}

interface RazorpayWebhookEntity {
  subscription_id?: unknown;
  invoice_id?: unknown;
  currency?: unknown;
  notes?: unknown;
  [key: string]: unknown;
}

export function classifyCapturedPayment(
  payment: RazorpayWebhookEntity,
): 'one-time' | 'subscription' | 'defer' {
  if (typeof payment.subscription_id === 'string' && payment.subscription_id.length > 0) {
    return 'subscription';
  }

  if (typeof payment.invoice_id === 'string' && payment.invoice_id.length > 0) {
    return 'defer';
  }

  return 'one-time';
}

export function isInrWebhookEntity(entity: RazorpayWebhookEntity): boolean {
  if (typeof entity.currency === 'string') return entity.currency === 'INR';

  if (typeof entity.notes === 'object' && entity.notes !== null && !Array.isArray(entity.notes)) {
    const displayCurrency = (entity.notes as Record<string, unknown>).displayCurrency;
    if (typeof displayCurrency === 'string') return displayCurrency === 'INR';
  }

  // Legacy one-time Razorpay orders were server-created as INR and did not
  // persist a currency field on the Appwrite transaction document.
  return true;
}

export function getGatewayPaymentAttribution(
  payment: { email?: unknown; [key: string]: unknown },
): GatewayPaymentAttribution {
  return {
    userId: 'anonymous',
    userEmail: typeof payment.email === 'string' ? payment.email : '',
    userName: '',
  };
}

interface CreateTransactionOnceOptions {
  paymentId: string;
  transactionExists: () => Promise<boolean>;
  createDocument: (documentId: string) => Promise<unknown>;
}

function isDocumentConflict(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const appwriteError = error as { code?: unknown; type?: unknown };
  return appwriteError.code === 409 || appwriteError.type === 'document_already_exists';
}

export async function createTransactionOnce({
  paymentId,
  transactionExists,
  createDocument,
}: CreateTransactionOnceOptions): Promise<'created' | 'existing'> {
  if (await transactionExists()) return 'existing';

  try {
    await createDocument(paymentId);
    return 'created';
  } catch (error) {
    if (isDocumentConflict(error)) return 'existing';
    throw error;
  }
}

interface PersistSubscriptionActivationOptions {
  providerSubscriptionId: string;
  existingDocumentId: string | null;
  createDocument: (documentId: string) => Promise<unknown>;
  updateDocument: (documentId: string) => Promise<unknown>;
}

export async function persistSubscriptionActivation({
  providerSubscriptionId,
  existingDocumentId,
  createDocument,
  updateDocument,
}: PersistSubscriptionActivationOptions): Promise<'created' | 'updated' | 'existing'> {
  if (existingDocumentId) {
    await updateDocument(existingDocumentId);
    return 'updated';
  }

  try {
    await createDocument(providerSubscriptionId);
    return 'created';
  } catch (error) {
    if (isDocumentConflict(error)) return 'existing';
    throw error;
  }
}

interface PersistSubscriptionStatusOptions {
  existingDocumentId: string | null;
  updateDocument: (documentId: string) => Promise<unknown>;
}

export async function persistSubscriptionStatus({
  existingDocumentId,
  updateDocument,
}: PersistSubscriptionStatusOptions): Promise<boolean> {
  if (!existingDocumentId) return false;
  await updateDocument(existingDocumentId);
  return true;
}

interface PersistSubscriptionRecordOptions {
  providerSubscriptionId: string;
  existingDocumentId: string | null;
  existingDocument?: StoredSubscriptionRecord | null;
  document: Record<string, unknown>;
  findExistingDocument?: (documentId: string) => Promise<StoredSubscriptionRecord | null>;
  createDocument: (documentId: string, document: Record<string, unknown>) => Promise<unknown>;
  updateDocument: (documentId: string, document: Record<string, unknown>) => Promise<unknown>;
}

interface StoredSubscriptionRecord extends Record<string, unknown> {
  $id?: unknown;
}

function subscriptionDocumentForUpdate(
  existingDocument: StoredSubscriptionRecord | null,
  document: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(Object.entries(document).filter(([key, value]) => {
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (
      key === 'userId'
      && value === 'anonymous'
      && typeof existingDocument?.userId === 'string'
      && existingDocument.userId.trim().length > 0
      && existingDocument.userId !== 'anonymous'
    ) {
      return false;
    }
    return true;
  }));
}

export async function persistSubscriptionRecord({
  providerSubscriptionId,
  existingDocumentId,
  existingDocument = null,
  document,
  findExistingDocument,
  createDocument,
  updateDocument,
}: PersistSubscriptionRecordOptions): Promise<'created' | 'updated' | 'existing'> {
  if (existingDocumentId) {
    const update = subscriptionDocumentForUpdate(existingDocument, document);
    if (existingDocument && transactionMatches(existingDocument, update)) return 'existing';
    await updateDocument(existingDocumentId, update);
    return 'updated';
  }

  try {
    await createDocument(providerSubscriptionId, document);
    return 'created';
  } catch (error) {
    if (!isDocumentConflict(error)) throw error;
    if (!findExistingDocument) {
      throw new Error('Subscription conflict winner could not be loaded');
    }

    const winner = await findExistingDocument(providerSubscriptionId);
    if (!winner) throw new Error('Subscription conflict winner could not be loaded');

    const update = subscriptionDocumentForUpdate(winner, document);
    if (transactionMatches(winner, update)) return 'existing';

    const documentId = typeof winner.$id === 'string' ? winner.$id : providerSubscriptionId;
    await updateDocument(documentId, update);
    return 'updated';
  }
}

export async function resolveAuthoritativeSubscription<T extends Record<string, unknown>>(
  webhookEntity: Record<string, unknown>,
  fetchSubscription: (subscriptionId: string) => Promise<T>,
): Promise<T> {
  const subscriptionId = webhookEntity.id;
  if (typeof subscriptionId !== 'string' || subscriptionId.length === 0) {
    throw new Error('Missing Razorpay subscription ID');
  }

  const authoritative = await fetchSubscription(subscriptionId);
  if (authoritative.id !== subscriptionId) {
    throw new Error('Razorpay subscription lookup returned a mismatched ID');
  }

  return authoritative;
}

const SUBSCRIPTION_EVENT_STATUS: Record<string, string> = {
  'subscription.activated': 'active',
  'subscription.charged': 'active',
  'subscription.pending': 'pending',
  'subscription.halted': 'halted',
  'subscription.cancelled': 'cancelled',
  'subscription.paused': 'paused',
  'subscription.resumed': 'active',
  'subscription.completed': 'completed',
};

export function subscriptionStatusFromEvent(eventType: string): string | null {
  return SUBSCRIPTION_EVENT_STATUS[eventType] ?? null;
}

interface StoredTransactionRecord extends Record<string, unknown> {
  $id?: unknown;
}

interface ReconcilePaymentTransactionOptions {
  paymentId: string;
  existingTransaction: StoredTransactionRecord | null;
  document: Record<string, unknown>;
  findExistingTransaction?: () => Promise<StoredTransactionRecord | null>;
  createDocument: (documentId: string, document: Record<string, unknown>) => Promise<unknown>;
  updateDocument: (documentId: string, document: Record<string, unknown>) => Promise<unknown>;
}

function transactionMatches(
  existingTransaction: StoredTransactionRecord,
  document: Record<string, unknown>,
): boolean {
  return Object.entries(document).every(([key, value]) => existingTransaction[key] === value);
}

export async function reconcilePaymentTransaction({
  paymentId,
  existingTransaction,
  document,
  findExistingTransaction,
  createDocument,
  updateDocument,
}: ReconcilePaymentTransactionOptions): Promise<'created' | 'updated' | 'existing'> {
  if (document.status === 'failed') {
    if (existingTransaction) return 'existing';

    try {
      await createDocument(paymentId, document);
      return 'created';
    } catch (error) {
      if (isDocumentConflict(error)) return 'existing';
      throw error;
    }
  }

  if (existingTransaction) {
    if (transactionMatches(existingTransaction, document)) return 'existing';

    const documentId = typeof existingTransaction.$id === 'string'
      ? existingTransaction.$id
      : paymentId;
    await updateDocument(documentId, document);
    return 'updated';
  }

  try {
    await createDocument(paymentId, document);
    return 'created';
  } catch (error) {
    if (!isDocumentConflict(error)) throw error;

    const concurrentTransaction = findExistingTransaction
      ? await findExistingTransaction()
      : null;
    if (concurrentTransaction && transactionMatches(concurrentTransaction, document)) {
      return 'existing';
    }

    const documentId = typeof concurrentTransaction?.$id === 'string'
      ? concurrentTransaction.$id
      : paymentId;
    await updateDocument(documentId, document);
    return 'updated';
  }
}
