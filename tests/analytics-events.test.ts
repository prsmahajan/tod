import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import {
  PUBLIC_FUNNEL_EVENTS,
  trackPublicEvent,
} from "../lib/analytics/events";

type TestWindow = typeof globalThis & {
  gtag?: (...args: unknown[]) => void;
};

const originalWindow = globalThis.window;

afterEach(() => {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  }
});

function installWindow(gtag?: (...args: unknown[]) => void) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { gtag } as TestWindow,
    writable: true,
  });
}

test("defines the animal-first donation funnel", () => {
  assert.deepEqual(PUBLIC_FUNNEL_EVENTS, [
    "evidence_viewed",
    "donate_clicked",
    "amount_selected",
    "checkout_started",
    "checkout_dismissed",
    "checkout_failed",
    "checkout_succeeded",
  ]);
});

test("sends only the permitted properties for a valid funnel event", () => {
  const calls: unknown[][] = [];
  installWindow((...args) => calls.push(args));

  trackPublicEvent("donate_clicked", {
    placement: "hero",
    email: "private@example.com",
    arbitrary: "do not collect",
  } as never);
  trackPublicEvent("checkout_succeeded", {
    planType: "sprout",
    amount: 499,
    paymentId: "pay_private",
    orderId: "order_private",
    subscriptionId: "sub_private",
    name: "Private Person",
    phone: "+91-0000000000",
  } as never);

  assert.deepEqual(calls, [
    ["event", "donate_clicked", { placement: "hero" }],
    ["event", "checkout_succeeded", { planType: "sprout", amount: 499 }],
  ]);
});

test("rejects unknown events and invalid allowlisted properties at runtime", () => {
  const calls: unknown[][] = [];
  installWindow((...args) => calls.push(args));
  const unsafeTrack = trackPublicEvent as (name: string, properties?: unknown) => void;

  unsafeTrack("person_identified", { email: "private@example.com" });
  trackPublicEvent("amount_selected", { planType: "seedling", amount: -99 });
  trackPublicEvent("checkout_failed", {
    planType: "sprout",
    amount: 499,
    errorCode: "a raw gateway error with private context",
  } as never);

  assert.deepEqual(calls, []);
});

test("uses only controlled checkout failure codes", () => {
  const calls: unknown[][] = [];
  installWindow((...args) => calls.push(args));

  trackPublicEvent("checkout_failed", {
    planType: "tree",
    amount: 999,
    errorCode: "verification_failed",
  });

  assert.deepEqual(calls, [[
    "event",
    "checkout_failed",
    { planType: "tree", amount: 999, errorCode: "verification_failed" },
  ]]);
});

test("does nothing when analytics is unavailable or throws", () => {
  installWindow();
  assert.doesNotThrow(() => trackPublicEvent("evidence_viewed"));

  installWindow(() => {
    throw new Error("analytics unavailable");
  });
  assert.doesNotThrow(() => trackPublicEvent("evidence_viewed"));
});
