import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("mission and support metadata state only confirmed first-release facts", () => {
  const mission = `${read("../app/mission/page.tsx")}\n${read("../app/mission/layout.tsx")}`.toLowerCase();
  const supportMetadata = read("../app/support/layout.tsx").toLowerCase();

  assert.match(mission, /ten months/);
  assert.match(mission, /personally funded/);
  assert.match(mission, /expense reconciliation is being prepared/);
  for (const forbidden of [
    "every contribution",
    "shelter",
    "veterinary",
    "exact impact",
    "₹10",
    "waitlist",
    "technology",
  ]) {
    assert.equal(mission.includes(forbidden), false, `mission contains unsupported copy: ${forbidden}`);
  }

  assert.equal(supportMetadata.includes("every rupee"), false);
  assert.equal(supportMetadata.includes("directly fund"), false);
});

test("Razorpay recurring plan descriptions make no guaranteed animal outcome", () => {
  const plans = read("../lib/razorpay/plans.ts").toLowerCase();

  assert.equal(/feed \d+/.test(plans), false);
  assert.equal(/animals? (weekly|monthly)/.test(plans), false);
});

test("stale public acquisition and dashboard pages are archived behind homepage redirects", async () => {
  const config = (await import("../next.config.mjs")).default as {
    redirects?: () => Promise<Array<{ source: string; destination: string }>>;
  };
  assert.equal(typeof config.redirects, "function");
  const redirects = await config.redirects?.();

  const archivedPaths = ["/waitlist", "/waitlist-dashboard", "/dashboard", "/community"];
  assert.deepEqual(
    redirects?.filter((item) => archivedPaths.includes(item.source)),
    archivedPaths.map((source) => ({ source, destination: "/", permanent: false })),
  );

  const sitemap = await (await import("../app/sitemap")).default();
  assert.equal(sitemap.some((item) => item.url.endsWith("/community")), false);
  assert.equal(sitemap.some((item) => item.url.endsWith("/dashboard")), false);
});
