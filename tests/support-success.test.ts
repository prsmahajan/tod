import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import SupportSuccessPage from "../app/support/success/page";

test("checkout return with missing references gives a clear recovery path", async () => {
  const page = await SupportSuccessPage({ searchParams: Promise.resolve({}) });
  const html = renderToStaticMarkup(page);

  assert.match(html, /Confirmation details are missing/);
  assert.match(html, /account@theopendraft\.com/);
  assert.match(html, /href="mailto:account@theopendraft\.com"/);
  assert.equal(html.includes("Payment verified"), false);
});
