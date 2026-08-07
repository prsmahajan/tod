export interface GatewayPaymentAttribution {
  userId: 'anonymous';
  userEmail: string;
  userName: '';
}

interface RazorpayWebhookEntity {
  subscription_id?: unknown;
  currency?: unknown;
  notes?: unknown;
  [key: string]: unknown;
}

export function classifyCapturedPayment(
  payment: RazorpayWebhookEntity,
): 'one-time' | 'subscription' {
  return typeof payment.subscription_id === 'string' && payment.subscription_id.length > 0
    ? 'subscription'
    : 'one-time';
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
}: PersistSubscriptionActivationOptions): Promise<'created' | 'updated'> {
  if (existingDocumentId) {
    await updateDocument(existingDocumentId);
    return 'updated';
  }

  await createDocument(providerSubscriptionId);
  return 'created';
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
