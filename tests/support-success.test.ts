import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import SupportSuccessPage from "../app/support/success/page";

test("direct success-page visits stay neutral and give a clear recovery path", async () => {
  const page = await SupportSuccessPage({ searchParams: Promise.resolve({}) });
  const html = renderToStaticMarkup(page);

  assert.match(html, /If you completed checkout/);
  assert.match(html, /Confirmation details are missing from this page/);
  assert.equal(html.includes("missing from this return"), false);
  assert.match(html, /account@theopendraft\.com/);
  assert.match(html, /href="mailto:account@theopendraft\.com"/);
  assert.equal(html.includes("Checkout return received"), false);
  assert.equal(html.includes("Thank you for your support"), false);
  assert.equal(html.includes("Payment verified"), false);
});

test("a checkout return with complete references retains neutral confirmation language", async () => {
  const page = await SupportSuccessPage({
    searchParams: Promise.resolve({ payment_id: "pay_123", order_id: "order_123" }),
  });
  const html = renderToStaticMarkup(page);

  assert.match(html, /Checkout return received/);
  assert.match(html, /Thank you for your support/);
  assert.match(html, /pay_123/);
  assert.match(html, /order_123/);
  assert.equal(html.includes("Confirmation details are missing"), false);
  assert.equal(html.includes("Payment verified"), false);
});
