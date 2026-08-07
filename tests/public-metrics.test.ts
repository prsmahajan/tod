import assert from "node:assert/strict";
import test from "node:test";
import { toPublicImpactMetrics } from "../lib/impact/public-metrics";

test("labels derived meals as estimates", () => {
  const metrics = toPublicImpactMetrics({
    totalRevenue: 1500,
    totalSupporters: 5,
    activeSubscriptions: 1,
    animalsHelped: 29,
  });

  assert.deepEqual(metrics, {
    raisedInr: 1500,
    supporters: 5,
    activeSupporters: 1,
    estimatedMealsFunded: 29,
  });
});
