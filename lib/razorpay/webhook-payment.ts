export interface GatewayPaymentAttribution {
  userId: 'anonymous';
  userEmail: string;
  userName: '';
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
