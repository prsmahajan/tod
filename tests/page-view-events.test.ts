import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import { createPageViewTracker } from "../lib/analytics/page-views";

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
    value: { gtag },
    writable: true,
  });
}

test("sends pathname-only page views once per navigation", () => {
  const calls: unknown[][] = [];
  installWindow((...args) => calls.push(args));
  const trackPageView = createPageViewTracker();

  trackPageView("/support");
  trackPageView("/support");
  trackPageView("/impact");

  assert.deepEqual(calls, [
    ["event", "page_view", { page_path: "/support" }],
    ["event", "page_view", { page_path: "/impact" }],
  ]);
});

test("rejects query strings, hashes, URLs, and payment references", () => {
  const calls: unknown[][] = [];
  installWindow((...args) => calls.push(args));
  const trackPageView = createPageViewTracker();

  trackPageView("/support/success?payment_id=pay_private");
  trackPageView("/support/success#order_id=order_private");
  trackPageView("/support%3Fname=private");
  trackPageView("/impact%23private-fragment");
  trackPageView("https://example.com/support");
  trackPageView("/support/pay_private");
  trackPageView("/support/subscription_id/private");

  assert.deepEqual(calls, []);
});

test("does not crash or consume a navigation when gtag is absent or throws", () => {
  const calls: unknown[][] = [];
  const trackPageView = createPageViewTracker();

  installWindow();
  assert.doesNotThrow(() => trackPageView("/support"));

  installWindow(() => {
    throw new Error("analytics unavailable");
  });
  assert.doesNotThrow(() => trackPageView("/support"));

  installWindow((...args) => calls.push(args));
  trackPageView("/support");
  assert.deepEqual(calls, [["event", "page_view", { page_path: "/support" }]]);
});
