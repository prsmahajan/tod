import assert from "node:assert/strict";
import test from "node:test";
import {
  isSafeSupportReference,
  resolvePublicSupportStatus,
} from "../lib/razorpay/public-status";

test("status lookup rejects malformed references before storage access", async () => {
  let lookups = 0;
  const result = await resolvePublicSupportStatus({
    mode: "payment",
    reference: "../../private@example.com",
    findPayment: async () => {
      lookups += 1;
      return null;
    },
    findSubscription: async () => null,
  });

  assert.equal(isSafeSupportReference("payment", "pay_123ABC"), true);
  assert.equal(isSafeSupportReference("subscription", "sub_123ABC"), true);
  assert.equal(isSafeSupportReference("payment", "order_123"), false);
  assert.equal(lookups, 0);
  assert.deepEqual(result, { state: "unknown" });
});

test("confirmed status and amount come only from the stored webhook transaction", async () => {
  const result = await resolvePublicSupportStatus({
    mode: "payment",
    reference: "pay_123",
    findPayment: async () => ({
      status: "success",
      amount: 499,
      planType: "sprout",
      userEmail: "private@example.com",
      userName: "Private Person",
    }),
    findSubscription: async () => null,
  });

  assert.deepEqual(result, { state: "confirmed", amountInr: 499, planType: "sprout" });
  assert.equal(JSON.stringify(result).includes("private@example.com"), false);
});

test("unknown, pending, and failed stored states remain truthful", async () => {
  const base = {
    mode: "payment" as const,
    reference: "pay_123",
    findSubscription: async () => null,
  };

  assert.deepEqual(await resolvePublicSupportStatus({
    ...base,
    findPayment: async () => null,
  }), { state: "unknown" });
  assert.deepEqual(await resolvePublicSupportStatus({
    ...base,
    findPayment: async () => ({ status: "pending", amount: 99 }),
  }), { state: "pending" });
  assert.deepEqual(await resolvePublicSupportStatus({
    ...base,
    findPayment: async () => ({ status: "failed", amount: 99 }),
  }), { state: "failed" });
});

test("subscription confirmation uses the stored provider linkage", async () => {
  const result = await resolvePublicSupportStatus({
    mode: "subscription",
    reference: "sub_123",
    findPayment: async () => null,
    findSubscription: async () => ({ status: "active", amount: 79, planType: "seedling" }),
  });

  assert.deepEqual(result, { state: "confirmed", amountInr: 79, planType: "seedling" });
});
