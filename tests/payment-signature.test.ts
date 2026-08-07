import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { verifyPaymentSignature } from "../lib/razorpay/verify-signature";

test("accepts a valid Razorpay signature", () => {
  const secret = "test_secret";
  const expected = crypto.createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", expected, secret), true);
});

test("rejects an invalid Razorpay signature", () => {
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "0".repeat(64), "test_secret"), false);
});
