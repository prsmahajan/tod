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
