import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/razorpay/cancel-subscription/route";

test("public cancellation rejects an ID-only hostile request", async () => {
  const response = await POST(new NextRequest("http://localhost/api/razorpay/cancel-subscription", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subscriptionId: "sub_victim",
      userId: "victim",
      email: "victim@example.com",
      token: "forged",
      cancelAtCycleEnd: false,
    }),
  }));
  const body = await response.json();

  assert.notEqual(response.status, 200);
  assert.equal(body.success, undefined);
  assert.match(body.error, /account@theopendraft\.com/);
});
