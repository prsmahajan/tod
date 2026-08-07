import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import SupportSuccessPage from "../app/support/success/page";
import { SupportStatusDisplay } from "../app/support/success/SupportStatus";

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
