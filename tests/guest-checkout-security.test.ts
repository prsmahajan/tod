import assert from "node:assert/strict";
import test from "node:test";
import {
  parseGuestOrderRequest,
  parseGuestSubscriptionRequest,
} from "../lib/razorpay/guest-checkout";

test("guest order requests discard caller-supplied attribution", () => {
  const request = parseGuestOrderRequest({
    planType: "seedling",
    notes: {
      userId: "victim-account",
      userEmail: "victim@example.com",
      userName: "Victim",
    },
  });

  assert.deepEqual(request, {
    planType: "seedling",
    amount: 99,
  });
});

test("guest subscription requests discard caller-supplied attribution", () => {
  const request = parseGuestSubscriptionRequest({
    planType: "sprout",
    billingCycle: "monthly",
    currency: "INR",
    userId: "victim-account",
    customerEmail: "victim@example.com",
    customerName: "Victim",
  });

  assert.deepEqual(request, {
    planType: "sprout",
    billingCycle: "monthly",
    currency: "INR",
  });
});

test("Razorpay subscriptions reject non-INR currency at the server boundary", () => {
  assert.throws(() => parseGuestSubscriptionRequest({
    planType: "sprout",
    billingCycle: "monthly",
    currency: "USD",
  }), /INR/);
});

test("custom one-time amounts stay inside the server-owned limits", () => {
  assert.deepEqual(parseGuestOrderRequest({
    planType: "custom",
    customAmount: 250,
    amount: 1,
  }), {
    planType: "custom",
    amount: 250,
  });

  assert.throws(
    () => parseGuestOrderRequest({ planType: "custom", customAmount: 49 }),
    /between/,
  );
  assert.throws(
    () => parseGuestOrderRequest({ planType: "custom", customAmount: 250.5 }),
    /whole/,
  );
});
