import assert from "node:assert/strict";
import test from "node:test";
import {
  mapRazorpayStatus,
  reconcileSubscriptionStatus,
} from "../lib/admin/subscription-status";

test("razorpay statuses map onto the stored subscription enum", () => {
  assert.equal(mapRazorpayStatus("active"), "ACTIVE");
  assert.equal(mapRazorpayStatus("resumed"), "ACTIVE");
  assert.equal(mapRazorpayStatus("authenticated"), "ACTIVE");
  assert.equal(mapRazorpayStatus("cancelled"), "CANCELLED");
  assert.equal(mapRazorpayStatus("paused"), "PAUSED");
  assert.equal(mapRazorpayStatus("halted"), "PAST_DUE");
  assert.equal(mapRazorpayStatus("pending"), "PAST_DUE");
  assert.equal(mapRazorpayStatus("completed"), "EXPIRED");
  assert.equal(mapRazorpayStatus("expired"), "EXPIRED");
});

test("unknown or missing razorpay statuses never overwrite stored state", () => {
  assert.equal(mapRazorpayStatus("created"), null);
  assert.equal(mapRazorpayStatus("something-new"), null);
  assert.equal(mapRazorpayStatus(undefined), null);

  const result = reconcileSubscriptionStatus("ACTIVE", { status: "something-new" });
  assert.deepEqual(result, { status: "ACTIVE", changed: false, autopayDisabled: false });
});

test("a live cancellation wins over the stored status and is flagged as changed", () => {
  const result = reconcileSubscriptionStatus("ACTIVE", { status: "cancelled" });
  assert.deepEqual(result, { status: "CANCELLED", changed: true, autopayDisabled: true });
});

test("an unchanged live status is not reported as a change", () => {
  const result = reconcileSubscriptionStatus("PAUSED", { status: "paused" });
  assert.equal(result.status, "PAUSED");
  assert.equal(result.changed, false);
});

test("autopay problems are detected from pause and scheduled cancellation signals", () => {
  assert.equal(
    reconcileSubscriptionStatus("ACTIVE", { status: "active", pause_initiated: true }).autopayDisabled,
    true,
  );
  assert.equal(
    reconcileSubscriptionStatus("ACTIVE", {
      status: "active",
      has_scheduled_changes: true,
      scheduled_changes: [{ action: "cancel" }],
    }).autopayDisabled,
    true,
  );
  assert.equal(
    reconcileSubscriptionStatus("ACTIVE", {
      status: "active",
      has_scheduled_changes: true,
      scheduled_changes: [{ action: "update" }],
    }).autopayDisabled,
    false,
  );
});

test("a missing razorpay record leaves the stored status untouched", () => {
  assert.deepEqual(reconcileSubscriptionStatus("ACTIVE", null), {
    status: "ACTIVE",
    changed: false,
    autopayDisabled: false,
  });
});
