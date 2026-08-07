import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/razorpay/verify-payment/route";

test("verification route returns 400 for malformed JSON", async () => {
  const previousSecret = process.env.RAZORPAY_LIVE_KEY;
  process.env.RAZORPAY_LIVE_KEY = "test_secret";

  try {
    const response = await POST(new NextRequest("http://localhost/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }));

    assert.equal(response.status, 400);
  } finally {
    if (previousSecret === undefined) delete process.env.RAZORPAY_LIVE_KEY;
    else process.env.RAZORPAY_LIVE_KEY = previousSecret;
  }
});

test("verification route returns 400 for wrong field types", async () => {
  const previousSecret = process.env.RAZORPAY_LIVE_KEY;
  process.env.RAZORPAY_LIVE_KEY = "test_secret";

  try {
    const response = await POST(new NextRequest("http://localhost/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: { forged: true },
        razorpay_payment_id: "pay_1",
        razorpay_signature: "0".repeat(64),
      }),
    }));

    assert.equal(response.status, 400);
  } finally {
    if (previousSecret === undefined) delete process.env.RAZORPAY_LIVE_KEY;
    else process.env.RAZORPAY_LIVE_KEY = previousSecret;
  }
});
