import assert from "node:assert/strict";
import test from "node:test";
import {
  buildOneTimePaymentPage,
  normalizeOneTimePayment,
  ONE_TIME_PAGE_SIZE,
  type TransactionDocument,
} from "../lib/admin/one-time-payments";

const tx = (overrides: Partial<TransactionDocument> = {}): TransactionDocument => ({
  $id: "tx-1",
  $createdAt: "2026-08-08T10:00:00.000Z",
  type: "one-time",
  userName: "Asha Rao",
  userEmail: "asha@example.com",
  amount: 500,
  status: "success",
  razorpayPaymentId: "pay_123",
  razorpayOrderId: "order_private",
  signature: "never-return-this",
  ...overrides,
});

test("normalization returns only table-safe one-time fields", () => {
  assert.deepEqual(normalizeOneTimePayment(tx()), {
    id: "tx-1",
    donorName: "Asha Rao",
    donorEmail: "asha@example.com",
    amount: 500,
    status: "success",
    paymentReference: "pay_123",
    paidAt: "2026-08-08T10:00:00.000Z",
  });
  assert.equal(normalizeOneTimePayment(tx({ type: "subscription" })), null);
});

test("search matches donor name or email case-insensitively", () => {
  const documents = [
    tx(),
    tx({ $id: "tx-2", userName: "Kabir Singh", userEmail: "kabir@example.com" }),
  ];
  assert.deepEqual(buildOneTimePaymentPage(documents, { search: "ASHA", page: 1 }).payments.map(p => p.id), ["tx-1"]);
  assert.deepEqual(buildOneTimePaymentPage(documents, { search: "KABIR@EXAMPLE", page: 1 }).payments.map(p => p.id), ["tx-2"]);
});

test("sorting is newest first with id as deterministic tie breaker", () => {
  const documents = [
    tx({ $id: "b", $createdAt: "2026-08-09T10:00:00.000Z" }),
    tx({ $id: "c", $createdAt: "2026-08-09T10:00:00.000Z" }),
    tx({ $id: "a", $createdAt: "2026-08-08T10:00:00.000Z" }),
  ];
  assert.deepEqual(buildOneTimePaymentPage(documents, { search: "", page: 1 }).payments.map(p => p.id), ["c", "b", "a"]);
});

test("pagination is fixed at 20 and reports the scan ceiling", () => {
  const documents = Array.from({ length: 21 }, (_, index) => tx({ $id: `tx-${index}` }));
  const result = buildOneTimePaymentPage(documents, { search: "", page: 2, truncated: true });
  assert.equal(ONE_TIME_PAGE_SIZE, 20);
  assert.equal(result.payments.length, 1);
  assert.deepEqual(result.pagination, { page: 2, limit: 20, total: 21, totalPages: 2, truncated: true });
});
