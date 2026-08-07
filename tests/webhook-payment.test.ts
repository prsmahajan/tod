import assert from "node:assert/strict";
import test from "node:test";
import {
  createTransactionOnce,
  getGatewayPaymentAttribution,
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
