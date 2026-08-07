import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import SupportSuccessPage from "../app/support/success/page";
import { SupportStatusDisplay } from "../app/support/success/SupportStatus";
import * as SupportStatusModule from "../app/support/success/SupportStatus";

test("direct success-page visits stay neutral and give a clear recovery path", async () => {
  const page = await SupportSuccessPage({ searchParams: Promise.resolve({}) });
  const html = renderToStaticMarkup(page);

  assert.match(html, /We could not confirm this contribution yet/);
  assert.match(html, /account@theopendraft\.com/);
  assert.equal(html.includes("Contribution confirmed"), false);
  assert.equal(html.includes("Thank you for your support"), false);
  assert.equal(html.includes("Payment verified"), false);
  assert.equal(html.includes("<main"), false);
});

test("a checkout return reference triggers checking but is not proof of success", async () => {
  const page = await SupportSuccessPage({
    searchParams: Promise.resolve({ payment_id: "pay_123", order_id: "order_123" }),
  });
  const html = renderToStaticMarkup(page);

  assert.match(html, /Checking final confirmation/);
  assert.equal(html.includes("Contribution confirmed"), false);
  assert.equal(html.includes("Thank you for supporting"), false);
  assert.equal(html.includes("pay_123"), false);
  assert.equal(html.includes("order_123"), false);
  assert.equal(html.includes("Payment verified"), false);
});

test("confirmed display uses only server status and amount and offers an optional account", () => {
  const html = renderToStaticMarkup(SupportStatusDisplay({
    mode: "payment",
    status: { state: "confirmed", amountInr: 499 },
  }));

  assert.match(html, /Contribution confirmed/);
  assert.match(html, /₹499/);
  assert.match(html, /Creating an account is optional/);
  assert.match(html, /href="\/signup"/);
  assert.equal(html.includes("specific feeding outcome has been completed"), false);
});

test("failed display never thanks or claims a contribution", () => {
  const html = renderToStaticMarkup(SupportStatusDisplay({
    mode: "payment",
    status: { state: "failed" },
  }));

  assert.match(html, /payment was not completed/i);
  assert.equal(html.includes("Thank you"), false);
  assert.equal(html.includes("Contribution confirmed"), false);
});

test("pending display stays distinct from an unavailable lookup while polling continues", () => {
  const html = renderToStaticMarkup(SupportStatusDisplay({
    mode: "subscription",
    status: { state: "pending" },
  }));

  assert.match(html, /Confirmation pending/);
  assert.match(html, /has not finished confirming/i);
  assert.equal(html.includes("Confirmation unavailable"), false);
  assert.equal(html.includes("could not confirm"), false);
  assert.equal(html.includes("Thank you"), false);
});

test("checkout success analytics can be built only from a server-confirmed plan and amount", () => {
  const serverConfirmedAnalyticsSelection = (SupportStatusModule as typeof SupportStatusModule & {
    serverConfirmedAnalyticsSelection?: (status: Record<string, unknown>) => {
      planType: string;
      amount: number;
    } | null;
  }).serverConfirmedAnalyticsSelection;

  assert.equal(typeof serverConfirmedAnalyticsSelection, "function");
  if (!serverConfirmedAnalyticsSelection) return;

  assert.deepEqual(serverConfirmedAnalyticsSelection({
    state: "confirmed",
    amountInr: 499,
    planType: "sprout",
  }), { planType: "sprout", amount: 499 });
  assert.equal(serverConfirmedAnalyticsSelection({
    state: "confirmed",
    amountInr: 499,
    planType: "forged-plan",
  }), null);
  assert.equal(serverConfirmedAnalyticsSelection({ state: "pending" }), null);
});
