import crypto from "node:crypto";

const SHA256_HEX_PATTERN = /^[a-f\d]{64}$/i;

export interface PaymentVerificationBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function timingSafeHexEqual(actual: string, expected: string): boolean {
  if (!SHA256_HEX_PATTERN.test(actual) || !SHA256_HEX_PATTERN.test(expected)) {
    return false;
  }

  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export function parsePaymentVerificationBody(value: unknown): PaymentVerificationBody | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

  const body = value as Record<string, unknown>;
  if (
    !isNonEmptyString(body.razorpay_order_id)
    || !isNonEmptyString(body.razorpay_payment_id)
    || typeof body.razorpay_signature !== "string"
    || !SHA256_HEX_PATTERN.test(body.razorpay_signature)
  ) {
    return null;
  }

  return {
    razorpay_order_id: body.razorpay_order_id,
    razorpay_payment_id: body.razorpay_payment_id,
    razorpay_signature: body.razorpay_signature,
  };
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

  return timingSafeHexEqual(signature, expected);
}

export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  return timingSafeHexEqual(signature, expected);
}
