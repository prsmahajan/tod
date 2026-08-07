import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyCapturedPayment,
  createTransactionOnce,
  getGatewayPaymentAttribution,
  isInrWebhookEntity,
  persistSubscriptionActivation,
  persistSubscriptionStatus,
} from "../lib/razorpay/webhook-payment";
import * as webhookPayment from "../lib/razorpay/webhook-payment";

test("authoritative payment attribution ignores forged notes", () => {
  assert.deepEqual(getGatewayPaymentAttribution({
    email: "payer@example.com",
    notes: {
      userId: "victim-account",
      userEmail: "victim@example.com",
      userName: "Victim",
    },
  }), {
    userId: "anonymous",
    userEmail: "payer@example.com",
    userName: "",
  });
});

test("transaction recording uses the payment ID as its document ID", async () => {
  let documentId = "";
  const result = await createTransactionOnce({
    paymentId: "pay_123",
    transactionExists: async () => false,
    createDocument: async (id) => {
      documentId = id;
    },
  });

  assert.equal(result, "created");
  assert.equal(documentId, "pay_123");
});

test("transaction recording treats an existing legacy transaction as success", async () => {
  let createCalled = false;
  const result = await createTransactionOnce({
    paymentId: "pay_123",
    transactionExists: async () => true,
    createDocument: async () => {
      createCalled = true;
    },
  });

  assert.equal(result, "existing");
  assert.equal(createCalled, false);
});

test("transaction recording treats a concurrent document conflict as success", async () => {
  const result = await createTransactionOnce({
    paymentId: "pay_123",
    transactionExists: async () => false,
    createDocument: async () => {
      throw { code: 409, type: "document_already_exists" };
    },
  });

  assert.equal(result, "existing");
});

test("transaction recording rethrows real persistence failures", async () => {
  const persistenceError = new Error("database unavailable");

  await assert.rejects(
    createTransactionOnce({
      paymentId: "pay_123",
      transactionExists: async () => false,
      createDocument: async () => {
        throw persistenceError;
      },
    }),
    persistenceError,
  );
});

test("ordinary order payments remain one-time even when subscriber-like hints match", () => {
  assert.equal(classifyCapturedPayment({
    id: "pay_order",
    amount: 7900,
    email: "subscriber@example.com",
    notes: { billingCycle: "monthly" },
  }), "one-time");
});

test("only Razorpay's authoritative subscription linkage classifies a captured payment as recurring", () => {
  assert.equal(classifyCapturedPayment({
    id: "pay_subscription",
    subscription_id: "sub_123",
    amount: 9900,
  }), "subscription");
});

test("invoice-linked captures are deferred instead of being permanently recorded as one-time", () => {
  assert.equal(classifyCapturedPayment({
    id: "pay_invoice",
    invoice_id: "inv_123",
    amount: 9900,
  }), "defer");

  assert.equal(classifyCapturedPayment({
    id: "pay_order",
    order_id: "order_123",
    amount: 9900,
  }), "one-time");
});

test("webhook currency guard excludes explicit non-INR payments and subscriptions", () => {
  assert.equal(isInrWebhookEntity({ currency: "INR" }), true);
  assert.equal(isInrWebhookEntity({ currency: "USD" }), false);
  assert.equal(isInrWebhookEntity({ notes: { displayCurrency: "USD" } }), false);
  assert.equal(isInrWebhookEntity({ notes: { displayCurrency: "INR" } }), true);
});

test("recurring charge recording is deterministic under duplicate and concurrent delivery", async () => {
  let creates = 0;
  const first = await createTransactionOnce({
    paymentId: "pay_recurring",
    transactionExists: async () => false,
    createDocument: async (id) => {
      creates += 1;
      assert.equal(id, "pay_recurring");
    },
  });
  const duplicate = await createTransactionOnce({
    paymentId: "pay_recurring",
    transactionExists: async () => true,
    createDocument: async () => {
      creates += 1;
    },
  });
  const concurrent = await createTransactionOnce({
    paymentId: "pay_recurring",
    transactionExists: async () => false,
    createDocument: async () => {
      throw { code: 409, type: "document_already_exists" };
    },
  });

  assert.equal(first, "created");
  assert.equal(duplicate, "existing");
  assert.equal(concurrent, "existing");
  assert.equal(creates, 1);
});

test("recurring charge recording propagates non-conflict persistence errors", async () => {
  const unavailable = new Error("recurring store unavailable");

  await assert.rejects(createTransactionOnce({
    paymentId: "pay_recurring",
    transactionExists: async () => false,
    createDocument: async () => {
      throw unavailable;
    },
  }), unavailable);
});

test("subscription activation persistence uses the provider ID and propagates storage errors", async () => {
  let documentId = "";
  await persistSubscriptionActivation({
    providerSubscriptionId: "sub_123",
    existingDocumentId: null,
    createDocument: async (id) => {
      documentId = id;
    },
    updateDocument: async () => {},
  });
  assert.equal(documentId, "sub_123");

  const unavailable = new Error("activation store unavailable");
  await assert.rejects(persistSubscriptionActivation({
    providerSubscriptionId: "sub_123",
    existingDocumentId: null,
    createDocument: async () => {
      throw unavailable;
    },
    updateDocument: async () => {},
  }), unavailable);
});

test("duplicate subscription activation conflicts are acknowledged as already persisted", async () => {
  const result = await persistSubscriptionActivation({
    providerSubscriptionId: "sub_duplicate",
    existingDocumentId: null,
    createDocument: async () => {
      throw { code: 409, type: "document_already_exists" };
    },
    updateDocument: async () => {},
  });

  assert.equal(result, "existing");
});

test("subscription status persistence propagates storage errors", async () => {
  const unavailable = new Error("status store unavailable");
  await assert.rejects(persistSubscriptionStatus({
    existingDocumentId: "subscription-document",
    updateDocument: async () => {
      throw unavailable;
    },
  }), unavailable);
});

test("missing subscription records are created deterministically for status-before-activation and charged-before-activation", async () => {
  const persistSubscriptionRecord = (webhookPayment as typeof webhookPayment & {
    persistSubscriptionRecord?: (options: {
      providerSubscriptionId: string;
      existingDocumentId: string | null;
      document: Record<string, unknown>;
      createDocument: (id: string, document: Record<string, unknown>) => Promise<unknown>;
      updateDocument: (id: string, document: Record<string, unknown>) => Promise<unknown>;
    }) => Promise<string>;
  }).persistSubscriptionRecord;

  assert.equal(typeof persistSubscriptionRecord, "function");
  if (!persistSubscriptionRecord) return;

  const created: Array<{ id: string; status: unknown }> = [];
  for (const status of ["cancelled", "active"]) {
    const result = await persistSubscriptionRecord({
      providerSubscriptionId: `sub_${status}`,
      existingDocumentId: null,
      document: { status },
      createDocument: async (id, document) => {
        created.push({ id, status: document.status });
      },
      updateDocument: async () => {
        assert.fail("a missing subscription must be created, not silently skipped");
      },
    });
    assert.equal(result, "created");
  }

  assert.deepEqual(created, [
    { id: "sub_cancelled", status: "cancelled" },
    { id: "sub_active", status: "active" },
  ]);
});

test("authoritative subscription fetch prevents delayed lifecycle events from regressing current state", async () => {
  const resolveAuthoritativeSubscription = (webhookPayment as typeof webhookPayment & {
    resolveAuthoritativeSubscription?: (
      webhookEntity: Record<string, unknown>,
      fetchSubscription: (id: string) => Promise<Record<string, unknown>>,
    ) => Promise<Record<string, unknown>>;
  }).resolveAuthoritativeSubscription;

  assert.equal(typeof resolveAuthoritativeSubscription, "function");
  if (!resolveAuthoritativeSubscription) return;

  const resolved = await resolveAuthoritativeSubscription(
    { id: "sub_123", status: "active" },
    async (id) => ({ id, status: "completed", plan_id: "plan_123" }),
  );

  assert.equal(resolved.status, "completed");
});

test("completed lifecycle events are recognized for authoritative persistence", () => {
  const subscriptionStatusFromEvent = (webhookPayment as typeof webhookPayment & {
    subscriptionStatusFromEvent?: (eventType: string) => string | null;
  }).subscriptionStatusFromEvent;

  assert.equal(typeof subscriptionStatusFromEvent, "function");
  if (!subscriptionStatusFromEvent) return;

  assert.equal(subscriptionStatusFromEvent("subscription.completed"), "completed");
  assert.equal(subscriptionStatusFromEvent("payment.captured"), null);
});

test("recurring transactions reconcile legacy one-time and failed rows in either event order", async () => {
  type Stored = Record<string, unknown> & { $id: string };
  const reconcilePaymentTransaction = (webhookPayment as typeof webhookPayment & {
    reconcilePaymentTransaction?: (options: {
      paymentId: string;
      existingTransaction: Stored | null;
      document: Record<string, unknown>;
      createDocument: (id: string, document: Record<string, unknown>) => Promise<unknown>;
      updateDocument: (id: string, document: Record<string, unknown>) => Promise<unknown>;
    }) => Promise<string>;
  }).reconcilePaymentTransaction;

  assert.equal(typeof reconcilePaymentTransaction, "function");
  if (!reconcilePaymentTransaction) return;

  const updates: Array<Record<string, unknown>> = [];
  const chargedAfterCapture = await reconcilePaymentTransaction({
    paymentId: "pay_capture_first",
    existingTransaction: {
      $id: "pay_capture_first",
      type: "one-time",
      status: "success",
      amount: 99,
    },
    document: {
      type: "subscription",
      status: "success",
      amount: 99,
      razorpaySubscriptionId: "sub_123",
    },
    createDocument: async () => assert.fail("existing wrong rows must be reconciled"),
    updateDocument: async (_id, document) => {
      updates.push(document);
    },
  });

  const chargedAfterFailure = await reconcilePaymentTransaction({
    paymentId: "pay_failure_first",
    existingTransaction: {
      $id: "pay_failure_first",
      type: "subscription",
      status: "failed",
      amount: 99,
      razorpaySubscriptionId: "sub_123",
    },
    document: {
      type: "subscription",
      status: "success",
      amount: 99,
      razorpaySubscriptionId: "sub_123",
    },
    createDocument: async () => assert.fail("existing failed rows must be reconciled"),
    updateDocument: async (_id, document) => {
      updates.push(document);
    },
  });

  assert.equal(chargedAfterCapture, "updated");
  assert.equal(chargedAfterFailure, "updated");
  assert.deepEqual(updates.map((document) => [document.type, document.status]), [
    ["subscription", "success"],
    ["subscription", "success"],
  ]);
});

test("delayed failed recurring events cannot regress a successful transaction", async () => {
  const reconcilePaymentTransaction = (webhookPayment as typeof webhookPayment & {
    reconcilePaymentTransaction?: (options: any) => Promise<string>;
  }).reconcilePaymentTransaction;

  assert.equal(typeof reconcilePaymentTransaction, "function");
  if (!reconcilePaymentTransaction) return;

  let updateCalled = false;
  const result = await reconcilePaymentTransaction({
    paymentId: "pay_success",
    existingTransaction: {
      $id: "pay_success",
      type: "subscription",
      status: "success",
      amount: 99,
      razorpaySubscriptionId: "sub_123",
    },
    document: {
      type: "subscription",
      status: "failed",
      amount: 99,
      razorpaySubscriptionId: "sub_123",
    },
    createDocument: async () => assert.fail("existing transaction must not be recreated"),
    updateDocument: async () => {
      updateCalled = true;
    },
  });

  assert.equal(result, "existing");
  assert.equal(updateCalled, false);
});

test("transaction reconciliation treats document conflicts as recoverable and propagates real errors", async () => {
  const reconcilePaymentTransaction = (webhookPayment as typeof webhookPayment & {
    reconcilePaymentTransaction?: (options: any) => Promise<string>;
  }).reconcilePaymentTransaction;

  assert.equal(typeof reconcilePaymentTransaction, "function");
  if (!reconcilePaymentTransaction) return;

  let conflictUpdate = false;
  const conflictResult = await reconcilePaymentTransaction({
    paymentId: "pay_conflict",
    existingTransaction: null,
    document: { type: "subscription", status: "success" },
    createDocument: async () => {
      throw { code: 409, type: "document_already_exists" };
    },
    updateDocument: async (id: string) => {
      conflictUpdate = id === "pay_conflict";
    },
  });
  assert.equal(conflictResult, "updated");
  assert.equal(conflictUpdate, true);

  const unavailable = new Error("transaction update unavailable");
  await assert.rejects(reconcilePaymentTransaction({
    paymentId: "pay_update_error",
    existingTransaction: {
      $id: "pay_update_error",
      type: "one-time",
      status: "failed",
    },
    document: { type: "subscription", status: "success" },
    createDocument: async () => {},
    updateDocument: async () => {
      throw unavailable;
    },
  }), unavailable);
});

test("a failed-event create conflict re-reads the winning success before updating", async () => {
  const reconcilePaymentTransaction = (webhookPayment as typeof webhookPayment & {
    reconcilePaymentTransaction?: (options: any) => Promise<string>;
  }).reconcilePaymentTransaction;

  assert.equal(typeof reconcilePaymentTransaction, "function");
  if (!reconcilePaymentTransaction) return;

  let persistedStatus: unknown;
  const result = await reconcilePaymentTransaction({
    paymentId: "pay_concurrent_failure",
    existingTransaction: null,
    document: {
      type: "subscription",
      status: "failed",
      razorpaySubscriptionId: "sub_123",
    },
    createDocument: async () => {
      throw { code: 409, type: "document_already_exists" };
    },
    findExistingTransaction: async () => ({
      $id: "pay_concurrent_failure",
      type: "subscription",
      status: "success",
      razorpaySubscriptionId: "sub_123",
    }),
    updateDocument: async (_id: string, document: Record<string, unknown>) => {
      persistedStatus = document.status;
    },
  });

  assert.equal(result, "existing");
  assert.equal(persistedStatus, undefined);
});
