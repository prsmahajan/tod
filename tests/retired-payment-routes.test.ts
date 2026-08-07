import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("legacy pay links permanently redirect into the supported donation flow", async () => {
  const config = (await import("../next.config.mjs")).default as {
    redirects?: () => Promise<Array<{ source: string; destination: string; permanent: boolean }>>;
  };
  const redirects = await config.redirects?.();

  assert.deepEqual(redirects?.find((item) => item.source === "/pay"), {
    source: "/pay",
    destination: "/support",
    permanent: true,
  });

  const activePublicSources = [
    read("../app/page.tsx"),
    read("../app/support/page.tsx"),
    read("../components/Header.tsx"),
    read("../components/Footer.tsx"),
  ].join("\n");
  assert.equal(/href=["'{`]\/pay(?:[?"'`}])/.test(activePublicSources), false);
  assert.equal(activePublicSources.includes("setPaymentSuccess(true)"), false);
  assert.equal(activePublicSources.includes('currency: "USD"'), false);
});

test("unauthenticated subscription verification methods are archived before any provider or database work", async () => {
  const route = await import("../app/api/razorpay/verify-subscription/route") as Record<string, unknown>;
  for (const method of ["GET", "POST", "PUT"] as const) {
    assert.equal(typeof route[method], "function", `${method} must have an explicit archive response`);
    if (typeof route[method] !== "function") continue;
    const response = await (route[method] as () => Promise<Response>)();
    assert.equal(response.status, 410);
    assert.deepEqual(await response.json(), {
      error: "Subscription verification is no longer available from this public endpoint.",
    });
  }

  const source = read("../app/api/razorpay/verify-subscription/route.ts");
  for (const forbidden of ["Razorpay", "databases", "updateDocument", "getDocument", "listDocuments"]) {
    assert.equal(source.includes(forbidden), false, `archived route still references ${forbidden}`);
  }
});

test("README documents the deployed Razorpay credential names without values", () => {
  const readme = read("../README.md");

  assert.match(readme, /^RAZORPAY_LIVE_ID=\s+#/m);
  assert.match(readme, /^RAZORPAY_LIVE_KEY=\s+#/m);
  assert.match(readme, /^RAZORPAY_WEBHOOK_SECRET=\s+#/m);
  assert.equal(/^RAZORPAY_KEY_ID=/m.test(readme), false);
  assert.equal(/^RAZORPAY_KEY_SECRET=/m.test(readme), false);
});
