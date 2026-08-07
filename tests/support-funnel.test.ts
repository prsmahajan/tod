import assert from "node:assert/strict";
import test from "node:test";

import {
  createServerCheckoutSelection,
  getSupportCardSelection,
  parseServerCheckoutSelection,
} from "../lib/analytics/support-funnel";

test("an immediate billing-cycle click uses the current amount instead of the animated display amount", () => {
  assert.deepEqual(getSupportCardSelection({
    currentAmount: 29,
    displayedAmount: 79,
    planType: "seedling",
  }), {
    amount: 29,
    planType: "seedling",
  });
});

test("an immediate plan switch uses the current plan and amount", () => {
  assert.deepEqual(getSupportCardSelection({
    currentAmount: 199,
    displayedAmount: 29,
    planType: "tree",
  }), {
    amount: 199,
    planType: "tree",
  });
});

test("server checkout metadata round-trips only its authoritative plan and amount", () => {
  const analytics = createServerCheckoutSelection("sprout", 499);

  assert.deepEqual(parseServerCheckoutSelection({
    analytics,
    paymentId: "pay_private",
    arbitrary: "ignored",
  }), {
    amount: 499,
    planType: "sprout",
  });
});

test("invalid server checkout metadata is rejected", () => {
  assert.equal(parseServerCheckoutSelection({
    analytics: { planType: "forged", amount: 499 },
  }), null);
  assert.equal(parseServerCheckoutSelection({
    analytics: { planType: "seedling", amount: -99 },
  }), null);
});
