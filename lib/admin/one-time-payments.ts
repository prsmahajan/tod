export const ONE_TIME_PAGE_SIZE = 20;
export const ONE_TIME_SCAN_PAGE_SIZE = 100;
export const ONE_TIME_SCAN_LIMIT = 5000;

export type TransactionDocument = {
  $id: string;
  $createdAt: string;
  type?: unknown;
  userName?: unknown;
  userEmail?: unknown;
  amount?: unknown;
  status?: unknown;
  razorpayPaymentId?: unknown;
  [key: string]: unknown;
};

export type OneTimePayment = {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  status: string;
  paymentReference: string;
  paidAt: string;
};

export type OneTimePaymentPage = {
  payments: OneTimePayment[];
  pagination: { page: number; limit: 20; total: number; totalPages: number; truncated: boolean };
};

const stringValue = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export function normalizeOneTimePayment(document: TransactionDocument): OneTimePayment | null {
  if (document.type !== "one-time") return null;
  return {
    id: document.$id,
    donorName: stringValue(document.userName, "Unnamed supporter"),
    donorEmail: stringValue(document.userEmail, "Email unavailable"),
    amount: typeof document.amount === "number" && Number.isFinite(document.amount) ? document.amount : 0,
    status: stringValue(document.status, "unknown").toLowerCase(),
    paymentReference: stringValue(document.razorpayPaymentId, "Unavailable"),
    paidAt: document.$createdAt,
  };
}

export function buildOneTimePaymentPage(
  documents: TransactionDocument[],
  options: { search: string; page: number; truncated?: boolean },
): OneTimePaymentPage {
  const search = options.search.trim().toLocaleLowerCase("en");
  const page = Number.isInteger(options.page) && options.page > 0 ? options.page : 1;
  const matches = documents
    .map(normalizeOneTimePayment)
    .filter((payment): payment is OneTimePayment => payment !== null)
    .filter(payment => !search || payment.donorName.toLocaleLowerCase("en").includes(search) || payment.donorEmail.toLocaleLowerCase("en").includes(search))
    .sort((left, right) => right.paidAt.localeCompare(left.paidAt) || right.id.localeCompare(left.id));
  const totalPages = Math.max(1, Math.ceil(matches.length / ONE_TIME_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ONE_TIME_PAGE_SIZE;
  return {
    payments: matches.slice(start, start + ONE_TIME_PAGE_SIZE),
    pagination: {
      page: safePage,
      limit: ONE_TIME_PAGE_SIZE,
      total: matches.length,
      totalPages,
      truncated: options.truncated === true,
    },
  };
}
