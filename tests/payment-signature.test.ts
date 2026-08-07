import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {
  parsePaymentVerificationBody,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../lib/razorpay/verify-signature";

test("accepts a valid Razorpay signature", () => {
  const secret = "test_secret";
  const expected = crypto.createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", expected, secret), true);
});

test("rejects an invalid Razorpay signature", () => {
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "0".repeat(64), "test_secret"), false);
});

test("rejects malformed signatures without throwing", () => {
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "not-hex", "test_secret"), false);
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "0".repeat(63), "test_secret"), false);
});

test("rejects malformed payment verification request fields", () => {
  assert.equal(parsePaymentVerificationBody(null), null);
  assert.equal(parsePaymentVerificationBody({
    razorpay_order_id: { forged: true },
    razorpay_payment_id: "pay_1",
    razorpay_signature: "0".repeat(64),
  }), null);
  assert.equal(parsePaymentVerificationBody({
    razorpay_order_id: "order_1",
    razorpay_payment_id: "pay_1",
    razorpay_signature: "not-hex",
  }), null);
});

test("accepts only well-shaped payment verification request fields", () => {
  const body = {
    razorpay_order_id: "order_1",
    razorpay_payment_id: "pay_1",
    razorpay_signature: "a".repeat(64),
  };
  assert.deepEqual(parsePaymentVerificationBody(body), body);
});

test("verifies webhook signatures with the timing-safe verifier", () => {
  const secret = "webhook_secret";
  const body = '{"event":"payment.captured"}';
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyWebhookSignature(body, signature, secret), true);
  assert.equal(verifyWebhookSignature(body, "0".repeat(64), secret), false);
  assert.equal(verifyWebhookSignature(body, "malformed", secret), false);
});
