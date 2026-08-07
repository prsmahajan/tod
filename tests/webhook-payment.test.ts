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

test("subscription status persistence propagates storage errors", async () => {
  const unavailable = new Error("status store unavailable");
  await assert.rejects(persistSubscriptionStatus({
    existingDocumentId: "subscription-document",
    updateDocument: async () => {
      throw unavailable;
    },
  }), unavailable);
});
