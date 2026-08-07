import assert from "node:assert/strict";
import test from "node:test";
import {
  sumConfirmedInrTransactions,
  toPublicImpactMetrics,
} from "../lib/impact/public-metrics";

test("labels derived meals as estimates", () => {
  const metrics = toPublicImpactMetrics({
    totalRevenue: 1500,
    animalsHelped: 29,
  });

  assert.deepEqual(metrics, {
    raisedInr: 1500,
    estimatedMealsFunded: 29,
  });
});

test("public raised totals never add an explicitly non-INR transaction", () => {
  assert.equal(sumConfirmedInrTransactions([
    { status: "success", amount: 99, currency: "INR" },
    { status: "success", amount: 25, currency: "USD" },
    { status: "failed", amount: 499, currency: "INR" },
    { status: "success", amount: 79 },
  ]), 178);
});
