import assert from "node:assert/strict";
import test from "node:test";

import * as webhookPayment from "../lib/razorpay/webhook-payment";

type ProviderSubscription = Record<string, unknown> & {
  id: string;
  status: string;
  current_start?: number;
  current_end?: number;
};

type StoredSubscription = Record<string, unknown> & { $id: string };

interface TransactionStore {
  createTransaction: () => Promise<{ $id: string }>;
  readDocument: (transactionId: string, documentId: string) => Promise<StoredSubscription | null>;
  readCommitted: (documentId: string) => Promise<StoredSubscription>;
  stageCreate: (
    transactionId: string,
    documentId: string,
    document: Record<string, unknown>,
  ) => Promise<unknown>;
  stageUpdate: (
    transactionId: string,
    documentId: string,
    document: Record<string, unknown>,
  ) => Promise<unknown>;
  commitTransaction: (transactionId: string) => Promise<unknown>;
  rollbackTransaction: (transactionId: string) => Promise<unknown>;
  deleteTransaction: (transactionId: string) => Promise<unknown>;
}

interface ReconcileOptions {
  webhookEntity: Record<string, unknown>;
  fetchSubscription: (subscriptionId: string) => Promise<ProviderSubscription>;
  buildDocument: (
    subscription: ProviderSubscription,
    existing: StoredSubscription | null,
  ) => Record<string, unknown>;
  relevantState: (subscription: ProviderSubscription) => string;
  onReconciledDocument?: (document: StoredSubscription) => Promise<void>;
  store: TransactionStore;
}

interface ReconcileResult {
  subscription: ProviderSubscription;
  document: StoredSubscription;
  existing: StoredSubscription | null;
  attempts: number;
  providerFetches: number;
}

type ReconcileSubscriptionTransaction = (options: ReconcileOptions) => Promise<ReconcileResult>;

type ReconcileSubscriptionWebhook = (options: ReconcileOptions & {
  payment?: { email?: unknown };
  syncSubscription: (document: StoredSubscription) => Promise<void>;
}) => Promise<ReconcileResult>;

interface PendingTransaction {
  readVersion: number | null;
  operation: "create" | "update" | null;
  documentId: string | null;
  document: Record<string, unknown> | null;
}

function conflictError() {
  return { code: 409, type: "transaction_conflict" };
}

function createTransactionalMock(initial: StoredSubscription | null = null) {
  let stored = initial ? { ...initial } : null;
  let version = initial ? 1 : 0;
  let transactionSequence = 0;
  let beforeCommit: (transactionId: string) => Promise<void> = async () => {};
  let alwaysConflict = false;
  const transactions = new Map<string, PendingTransaction>();
  const counts = {
    create: 0,
    read: 0,
    readCommitted: 0,
    stageCreate: 0,
    stageUpdate: 0,
    commit: 0,
    rollback: 0,
    delete: 0,
  };

  const store: TransactionStore = {
    createTransaction: async () => {
      counts.create += 1;
      const id = `tx_${++transactionSequence}`;
      transactions.set(id, {
        readVersion: null,
        operation: null,
        documentId: null,
        document: null,
      });
      return { $id: id };
    },
    readDocument: async (transactionId) => {
      counts.read += 1;
      const transaction = transactions.get(transactionId);
      if (!transaction) throw new Error("unknown transaction");
      transaction.readVersion = version;
      return stored ? { ...stored } : null;
    },
    readCommitted: async () => {
      counts.readCommitted += 1;
      if (!stored) throw new Error("committed subscription is missing");
      return { ...stored };
    },
    stageCreate: async (transactionId, documentId, document) => {
      counts.stageCreate += 1;
      const transaction = transactions.get(transactionId);
      if (!transaction) throw new Error("unknown transaction");
      transaction.operation = "create";
      transaction.documentId = documentId;
      transaction.document = { ...document };
    },
    stageUpdate: async (transactionId, documentId, document) => {
      counts.stageUpdate += 1;
      const transaction = transactions.get(transactionId);
      if (!transaction) throw new Error("unknown transaction");
      transaction.operation = "update";
      transaction.documentId = documentId;
      transaction.document = { ...document };
    },
    commitTransaction: async (transactionId) => {
      counts.commit += 1;
      await beforeCommit(transactionId);
      const transaction = transactions.get(transactionId);
      if (!transaction) throw new Error("unknown transaction");
      if (alwaysConflict || transaction.readVersion !== version) throw conflictError();
      if (transaction.operation === "create" && stored) throw conflictError();
      if (transaction.operation === "update" && !stored) throw conflictError();
      if (!transaction.documentId || !transaction.document) {
        throw new Error("transaction has no staged document operation");
      }

      stored = transaction.operation === "create"
        ? {
            $id: transaction.documentId,
            $createdAt: "2026-08-07T12:00:00.000Z",
            $updatedAt: "2026-08-07T12:00:00.000Z",
            $permissions: [],
            $databaseId: "opendraft",
            $collectionId: "subscriptions",
            ...transaction.document,
          }
        : {
            ...stored!,
            ...transaction.document,
            $updatedAt: "2026-08-07T12:05:00.000Z",
          };
      version += 1;
      transactions.delete(transactionId);
    },
    rollbackTransaction: async (transactionId) => {
      counts.rollback += 1;
      transactions.delete(transactionId);
    },
    deleteTransaction: async (transactionId) => {
      counts.delete += 1;
      transactions.delete(transactionId);
    },
  };

  return {
    store,
    counts,
    getStored: () => stored ? { ...stored } : null,
    setBeforeCommit: (callback: (transactionId: string) => Promise<void>) => {
      beforeCommit = callback;
    },
    setAlwaysConflict: (value: boolean) => {
      alwaysConflict = value;
    },
  };
}

function subscriptionDocument(
  subscription: ProviderSubscription,
  email: string,
): Record<string, unknown> {
  return {
    userId: "anonymous",
    userEmail: email,
    userName: "",
    razorpaySubscriptionId: subscription.id,
    planId: "plan_123",
    planType: "seedling",
    billingCycle: "monthly",
    amount: 99,
    status: subscription.status,
    currentPeriodStart: subscription.current_start ?? 100,
    currentPeriodEnd: subscription.current_end ?? 200,
  };
}

function relevantState(subscription: ProviderSubscription): string {
  return JSON.stringify({
    status: subscription.status,
    currentStart: subscription.current_start ?? null,
    currentEnd: subscription.current_end ?? null,
  });
}

function options(
  store: TransactionStore,
  fetchSubscription: (subscriptionId: string) => Promise<ProviderSubscription>,
  email = "",
): ReconcileOptions {
  return {
    webhookEntity: { id: "sub_race" },
    fetchSubscription,
    buildDocument: (subscription) => subscriptionDocument(subscription, email),
    relevantState,
    store,
  };
}

async function forceReverseRace(
  reconcile: ReconcileSubscriptionTransaction,
  finalStatus: string,
) {
  const transactional = createTransactionalMock();
  let providerStatus = "active";
  let olderFetches = 0;
  let newerFetches = 0;
  let markOlderCommitStarted!: () => void;
  const olderCommitStarted = new Promise<void>((resolve) => {
    markOlderCommitStarted = resolve;
  });
  let releaseOlderCommit!: () => void;
  const newerCommitted = new Promise<void>((resolve) => {
    releaseOlderCommit = resolve;
  });

  transactional.setBeforeCommit(async (transactionId) => {
    if (transactionId !== "tx_1") return;
    markOlderCommitStarted();
    await newerCommitted;
  });

  const older = reconcile(options(
    transactional.store,
    async (id) => {
      olderFetches += 1;
      return { id, status: providerStatus, current_start: 100, current_end: 200 };
    },
  ));

  await olderCommitStarted;
  providerStatus = finalStatus;
  const newer = await reconcile(options(
    transactional.store,
    async (id) => {
      newerFetches += 1;
      return { id, status: providerStatus, current_start: 100, current_end: 200 };
    },
    "charged@example.com",
  ));
  releaseOlderCommit();
  const olderResult = await older;

  return {
    transactional,
    newer,
    older: olderResult,
    olderFetches,
    newerFetches,
  };
}

test("an older active transaction conflicts, retries, and leaves the completed winner", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const race = await forceReverseRace(reconcile, "completed");

  assert.equal(race.transactional.getStored()?.status, "completed");
  assert.equal(race.transactional.getStored()?.userEmail, "charged@example.com");
  assert.equal(race.older.subscription.status, "completed");
  assert.equal(race.newer.subscription.status, "completed");
  assert.equal(race.older.attempts, 2);
  assert.equal(race.newer.attempts, 1);
  assert.equal(race.olderFetches, 3);
  assert.equal(race.newerFetches, 2);
  assert.equal(race.transactional.counts.create, 3);
  assert.equal(race.transactional.counts.commit, 3);
});

test("paused and halted winners survive the same race with the best charged email", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  for (const finalStatus of ["paused", "halted"]) {
    const race = await forceReverseRace(reconcile, finalStatus);
    assert.equal(race.transactional.getStored()?.status, finalStatus);
    assert.equal(race.transactional.getStored()?.userEmail, "charged@example.com");
    assert.equal(race.older.subscription.status, finalStatus);
    assert.equal(race.olderFetches, 3);
    assert.equal(race.newerFetches, 2);
  }
});

test("a provider transition after commit triggers one bounded transactional reconciliation", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const transactional = createTransactionalMock();
  const statuses = ["active", "paused", "paused", "paused"];
  let providerFetches = 0;
  const result = await reconcile(options(transactional.store, async (id) => ({
    id,
    status: statuses[providerFetches++]!,
    current_start: 100,
    current_end: 200,
  })));

  assert.equal(result.subscription.status, "paused");
  assert.equal(transactional.getStored()?.status, "paused");
  assert.equal(result.attempts, 2);
  assert.equal(result.providerFetches, 4);
  assert.equal(providerFetches, 4);
  assert.equal(transactional.counts.create, 2);
  assert.equal(transactional.counts.commit, 2);
});

test("charged-before-activation sync receives the actual committed Appwrite document", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionWebhook?: ReconcileSubscriptionWebhook;
  }).reconcileSubscriptionWebhook;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const transactional = createTransactionalMock();
  const syncedDocuments: StoredSubscription[] = [];
  const result = await reconcile({
    ...options(
      transactional.store,
      async (id) => ({ id, status: "active", current_start: 100, current_end: 200 }),
      "first-charge@example.com",
    ),
    payment: { email: "first-charge@example.com" },
    syncSubscription: async (document) => {
      syncedDocuments.push({ ...document });
    },
  });
  const expectedCommittedDocument = {
    $id: "sub_race",
    $createdAt: "2026-08-07T12:00:00.000Z",
    $updatedAt: "2026-08-07T12:00:00.000Z",
    $permissions: [],
    $databaseId: "opendraft",
    $collectionId: "subscriptions",
    userId: "anonymous",
    userEmail: "first-charge@example.com",
    userName: "",
    razorpaySubscriptionId: "sub_race",
    planId: "plan_123",
    planType: "seedling",
    billingCycle: "monthly",
    amount: 99,
    status: "active",
    currentPeriodStart: 100,
    currentPeriodEnd: 200,
  };

  assert.equal(result.existing, null);
  assert.deepEqual(result.document, expectedCommittedDocument);
  assert.deepEqual(syncedDocuments, [expectedCommittedDocument]);
  assert.equal(transactional.counts.readCommitted, 1);
});

test("a committed-read failure escapes and redelivery syncs the already committed row", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const transactional = createTransactionalMock();
  const readCommitted = transactional.store.readCommitted;
  const committedReadError = new Error("committed read unavailable");
  let committedReadAttempts = 0;
  transactional.store.readCommitted = async (documentId) => {
    committedReadAttempts += 1;
    if (committedReadAttempts === 1) throw committedReadError;
    return readCommitted(documentId);
  };
  const syncedDocuments: StoredSubscription[] = [];
  const deliver = () => reconcile({
    ...options(
      transactional.store,
      async (id) => ({ id, status: "active", current_start: 100, current_end: 200 }),
      "retry@example.com",
    ),
    onReconciledDocument: async (document) => {
      syncedDocuments.push({ ...document });
    },
  });

  await assert.rejects(deliver(), committedReadError);
  assert.equal(transactional.getStored()?.userEmail, "retry@example.com");
  assert.equal(syncedDocuments.length, 0);
  const retried = await deliver();

  assert.equal(committedReadAttempts, 2);
  assert.equal(transactional.counts.commit, 2);
  assert.equal(retried.document.$createdAt, "2026-08-07T12:00:00.000Z");
  assert.equal(syncedDocuments.length, 1);
  assert.equal(syncedDocuments[0]?.$createdAt, "2026-08-07T12:00:00.000Z");
});

test("a downstream sync failure escapes and redelivery safely repeats the sync", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const transactional = createTransactionalMock();
  const syncError = new Error("PostgreSQL sync unavailable");
  const syncedDocuments: StoredSubscription[] = [];
  let syncAttempts = 0;
  const deliver = () => reconcile({
    ...options(
      transactional.store,
      async (id) => ({ id, status: "active", current_start: 100, current_end: 200 }),
      "retry@example.com",
    ),
    onReconciledDocument: async (document) => {
      syncAttempts += 1;
      syncedDocuments.push({ ...document });
      if (syncAttempts === 1) throw syncError;
    },
  });

  await assert.rejects(deliver(), syncError);
  assert.equal(transactional.getStored()?.userEmail, "retry@example.com");
  const retried = await deliver();

  assert.equal(syncAttempts, 2);
  assert.equal(transactional.counts.commit, 2);
  assert.equal(transactional.counts.readCommitted, 2);
  assert.equal(retried.document.$createdAt, "2026-08-07T12:00:00.000Z");
  assert.equal(syncedDocuments[0]?.$createdAt, "2026-08-07T12:00:00.000Z");
  assert.equal(syncedDocuments[1]?.$createdAt, "2026-08-07T12:00:00.000Z");
});

test("provider churn and transaction conflicts exhaust their fixed bounds as failures", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const stageConflictStore = createTransactionalMock();
  const stageCreate = stageConflictStore.store.stageCreate;
  let stageCalls = 0;
  stageConflictStore.store.stageCreate = async (...args) => {
    stageCalls += 1;
    if (stageCalls === 1) throw conflictError();
    return stageCreate(...args);
  };
  const recovered = await reconcile(options(stageConflictStore.store, async (id) => ({
    id,
    status: "active",
  })));
  assert.equal(recovered.attempts, 2);
  assert.equal(recovered.providerFetches, 3);
  assert.equal(stageConflictStore.counts.create, 2);
  assert.equal(stageConflictStore.counts.commit, 1);
  assert.equal(stageConflictStore.counts.rollback, 1);
  assert.equal(stageConflictStore.counts.delete, 1);

  const conflictStore = createTransactionalMock();
  conflictStore.setAlwaysConflict(true);
  let conflictFetches = 0;
  await assert.rejects(reconcile(options(conflictStore.store, async (id) => {
    conflictFetches += 1;
    return { id, status: "active" };
  })), /transaction conflicts exhausted/i);
  assert.equal(conflictFetches, 3);
  assert.equal(conflictStore.counts.create, 3);
  assert.equal(conflictStore.counts.commit, 3);
  assert.equal(conflictStore.counts.rollback, 3);
  assert.equal(conflictStore.counts.delete, 3);

  const churnStore = createTransactionalMock();
  let churnFetches = 0;
  await assert.rejects(reconcile(options(churnStore.store, async (id) => {
    churnFetches += 1;
    return {
      id,
      status: churnFetches % 2 === 1 ? "active" : "paused",
      current_start: churnFetches,
    };
  })), /did not stabilize/i);
  assert.equal(churnFetches, 6);
  assert.equal(churnStore.counts.create, 3);
  assert.equal(churnStore.counts.commit, 3);
});

test("missing transaction support fails closed before provider or document work", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  let providerFetches = 0;
  await assert.rejects(reconcile({
    ...options({} as TransactionStore, async (id) => {
      providerFetches += 1;
      return { id, status: "active" };
    }),
    store: {} as TransactionStore,
  }), /Appwrite document transactions are required/i);
  assert.equal(providerFetches, 0);
});

test("provider and transaction errors propagate while cleanup cannot hide the original", async () => {
  const reconcile = (webhookPayment as typeof webhookPayment & {
    reconcileSubscriptionTransaction?: ReconcileSubscriptionTransaction;
  }).reconcileSubscriptionTransaction;

  assert.equal(typeof reconcile, "function");
  if (!reconcile) return;

  const initialProviderError = new Error("provider unavailable");
  await assert.rejects(reconcile(options(
    createTransactionalMock().store,
    async () => { throw initialProviderError; },
  )), initialProviderError);

  for (const phase of ["create", "read", "stage", "commit"] as const) {
    const transactional = createTransactionalMock();
    const original = new Error(`${phase} unavailable`);
    if (phase === "create") transactional.store.createTransaction = async () => { throw original; };
    if (phase === "read") transactional.store.readDocument = async () => { throw original; };
    if (phase === "stage") transactional.store.stageCreate = async () => { throw original; };
    if (phase === "commit") transactional.store.commitTransaction = async () => { throw original; };
    transactional.store.rollbackTransaction = async () => { throw new Error("cleanup rollback failed"); };
    transactional.store.deleteTransaction = async () => { throw new Error("cleanup delete failed"); };

    await assert.rejects(reconcile(options(
      transactional.store,
      async (id) => ({ id, status: "active" }),
    )), original);
  }

  const finalProviderError = new Error("provider verification unavailable");
  const committedStore = createTransactionalMock();
  let providerCalls = 0;
  await assert.rejects(reconcile(options(committedStore.store, async (id) => {
    providerCalls += 1;
    if (providerCalls === 2) throw finalProviderError;
    return { id, status: "active" };
  })), finalProviderError);
  assert.equal(committedStore.counts.commit, 1);
  assert.equal(committedStore.counts.rollback, 0);
  assert.equal(committedStore.counts.delete, 0);
});
