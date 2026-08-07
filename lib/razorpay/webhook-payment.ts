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
  payment?: { email?: unknown; [key: string]: unknown },
): GatewayPaymentAttribution {
  return {
    userId: 'anonymous',
    userEmail: typeof payment?.email === 'string' ? payment.email : '',
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

const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['completed', 'cancelled', 'expired']);

function subscriptionDocumentForUpdate(
  existingDocument: StoredSubscriptionRecord | null,
  document: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(Object.entries(document).filter(([key, value]) => {
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (
      key === 'status'
      && TERMINAL_SUBSCRIPTION_STATUSES.has(String(existingDocument?.status))
      && !TERMINAL_SUBSCRIPTION_STATUSES.has(String(value))
    ) {
      return false;
    }
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

export async function reconcileAuthoritativeSubscription<T extends Record<string, unknown>>(
  webhookEntity: Record<string, unknown>,
  fetchSubscription: (subscriptionId: string) => Promise<T>,
  persistSubscription: (subscription: T) => Promise<unknown>,
): Promise<T> {
  const initial = await resolveAuthoritativeSubscription(webhookEntity, fetchSubscription);
  await persistSubscription(initial);

  const final = await resolveAuthoritativeSubscription(webhookEntity, fetchSubscription);
  await persistSubscription(final);
  return final;
}

interface TransactionalSubscriptionStore {
  createTransaction: () => Promise<{ $id: string }>;
  readDocument: (
    transactionId: string,
    documentId: string,
  ) => Promise<StoredSubscriptionRecord | null>;
  readCommitted: (documentId: string) => Promise<StoredSubscriptionRecord>;
  stageCreate: (
    transactionId: string,
    documentId: string,
    document: Record<string, unknown>,
  ) => Promise<unknown>;
  stageUpdate: (
    transactionId: string,
    documentId: string,
    document: Record<string, unknown>,
  ) => Promise<unknown>;
  commitTransaction: (transactionId: string) => Promise<unknown>;
  rollbackTransaction: (transactionId: string) => Promise<unknown>;
  deleteTransaction: (transactionId: string) => Promise<unknown>;
}

interface ReconcileSubscriptionTransactionOptions<T extends Record<string, unknown>> {
  webhookEntity: Record<string, unknown>;
  fetchSubscription: (subscriptionId: string) => Promise<T>;
  buildDocument: (
    subscription: T,
    existing: StoredSubscriptionRecord | null,
  ) => Record<string, unknown>;
  relevantState: (subscription: T) => string;
  shouldPersist?: (subscription: T) => boolean;
  onReconciledDocument?: (document: StoredSubscriptionRecord) => Promise<void>;
  store: TransactionalSubscriptionStore;
}

interface ReconciledSubscriptionTransaction<T extends Record<string, unknown>> {
  subscription: T;
  document: StoredSubscriptionRecord | null;
  existing: StoredSubscriptionRecord | null;
  attempts: number;
  providerFetches: number;
  result: 'created' | 'updated' | 'ignored';
}

type ReconcileSubscriptionWebhookOptions<T extends Record<string, unknown>> = Omit<
  ReconcileSubscriptionTransactionOptions<T>,
  'onReconciledDocument'
> & {
  payment?: { email?: unknown; [key: string]: unknown };
  syncSubscription: (document: StoredSubscriptionRecord) => Promise<void>;
};

const MAX_SUBSCRIPTION_TRANSACTION_ATTEMPTS = 3;

function assertTransactionSupport(store: TransactionalSubscriptionStore): void {
  const candidate = store as unknown as Record<string, unknown>;
  const requiredMethods = [
    'createTransaction',
    'readDocument',
    'readCommitted',
    'stageCreate',
    'stageUpdate',
    'commitTransaction',
    'rollbackTransaction',
    'deleteTransaction',
  ];
  if (requiredMethods.some((method) => typeof candidate[method] !== 'function')) {
    throw new Error('Appwrite document transactions are required for subscription webhooks');
  }
}

async function cleanUpSubscriptionTransaction(
  store: TransactionalSubscriptionStore,
  transactionId: string,
): Promise<void> {
  try {
    await store.rollbackTransaction(transactionId);
  } catch {
    // Preserve the stage, read, or commit error that caused cleanup.
  }
  try {
    await store.deleteTransaction(transactionId);
  } catch {
    // A rolled-back or failed transaction may already be unavailable.
  }
}

export async function reconcileSubscriptionTransaction<T extends Record<string, unknown>>({
  webhookEntity,
  fetchSubscription,
  buildDocument,
  relevantState,
  shouldPersist,
  onReconciledDocument,
  store,
}: ReconcileSubscriptionTransactionOptions<T>): Promise<ReconciledSubscriptionTransaction<T>> {
  assertTransactionSupport(store);

  let providerFetches = 0;
  let lastOutcome: 'conflict' | 'unstable' = 'unstable';
  const fetchAuthoritative = async () => {
    providerFetches += 1;
    return resolveAuthoritativeSubscription(webhookEntity, fetchSubscription);
  };

  for (let attempt = 1; attempt <= MAX_SUBSCRIPTION_TRANSACTION_ATTEMPTS; attempt += 1) {
    const authoritative = await fetchAuthoritative();
    if (shouldPersist && !shouldPersist(authoritative)) {
      return {
        subscription: authoritative,
        document: null,
        existing: null,
        attempts: attempt,
        providerFetches,
        result: 'ignored',
      };
    }
    const authoritativeState = relevantState(authoritative);
    const providerSubscriptionId = authoritative.id as string;
    const transaction = await store.createTransaction();
    if (!transaction || typeof transaction.$id !== 'string' || transaction.$id.length === 0) {
      throw new Error('Appwrite document transaction did not return an ID');
    }
    const transactionId = transaction.$id;

    let existing: StoredSubscriptionRecord | null;
    try {
      existing = await store.readDocument(transactionId, providerSubscriptionId);
    } catch (error) {
      await cleanUpSubscriptionTransaction(store, transactionId);
      throw error;
    }

    let document: Record<string, unknown>;
    try {
      document = buildDocument(authoritative, existing);
    } catch (error) {
      await cleanUpSubscriptionTransaction(store, transactionId);
      throw error;
    }

    const stagedDocument = existing
      ? subscriptionDocumentForUpdate(existing, document)
      : document;
    const result = existing ? 'updated' as const : 'created' as const;
    const documentId = typeof existing?.$id === 'string'
      ? existing.$id
      : providerSubscriptionId;

    try {
      if (existing) {
        await store.stageUpdate(transactionId, documentId, stagedDocument);
      } else {
        await store.stageCreate(transactionId, documentId, stagedDocument);
      }
    } catch (error) {
      await cleanUpSubscriptionTransaction(store, transactionId);
      if (isDocumentConflict(error)) {
        lastOutcome = 'conflict';
        continue;
      }
      throw error;
    }

    try {
      await store.commitTransaction(transactionId);
    } catch (error) {
      await cleanUpSubscriptionTransaction(store, transactionId);
      if (isDocumentConflict(error)) {
        lastOutcome = 'conflict';
        continue;
      }
      throw error;
    }

    const verified = await fetchAuthoritative();
    if (relevantState(verified) === authoritativeState) {
      const committedDocument = await store.readCommitted(documentId);
      if (
        !committedDocument
        || typeof committedDocument.$id !== 'string'
        || committedDocument.$id !== documentId
      ) {
        throw new Error('Committed Appwrite subscription document could not be loaded');
      }
      await onReconciledDocument?.(committedDocument);
      return {
        subscription: verified,
        document: committedDocument,
        existing,
        attempts: attempt,
        providerFetches,
        result,
      };
    }
    lastOutcome = 'unstable';
  }

  if (lastOutcome === 'conflict') {
    throw new Error('Subscription transaction conflicts exhausted');
  }
  throw new Error('Authoritative subscription state did not stabilize');
}

export async function reconcileSubscriptionWebhook<T extends Record<string, unknown>>({
  payment,
  syncSubscription,
  ...options
}: ReconcileSubscriptionWebhookOptions<T>): Promise<ReconciledSubscriptionTransaction<T>> {
  const attribution = getGatewayPaymentAttribution(payment);
  return reconcileSubscriptionTransaction({
    ...options,
    onReconciledDocument: attribution.userEmail ? syncSubscription : undefined,
  });
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
