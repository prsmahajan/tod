import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import SubscriptionCancellationContact from "../components/account/SubscriptionCancellationContact";

test("signed-in cancellation uses verified email instructions and never claims an in-page cancellation", () => {
  const html = renderToStaticMarkup(React.createElement(SubscriptionCancellationContact, {
    subscriptionId: "sub_account_123",
  }));

  assert.match(html, /mailto:account@theopendraft\.com/);
  assert.match(html, /email used at Razorpay checkout/i);
  assert.match(html, /sub_account_123/);
  assert.equal(html.includes("cancel from this page"), false);
  assert.equal(html.includes("Confirm Cancel"), false);
});
