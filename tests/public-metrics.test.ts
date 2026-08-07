import assert from "node:assert/strict";
import test from "node:test";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { GET as getPublicStats } from "../app/api/public/stats/route";
import { CommunityStatsDisplay } from "../components/CommunityStats";

test("public stats expose no money or meal estimate until historical currencies are verified", async () => {
  const response = await getPublicStats();
  const payload = await response.json();
  const serialized = JSON.stringify(payload);

  assert.equal(response.status, 200);
  assert.equal(payload.availability, "currency-verification-pending");
  assert.match(payload.message, /historical payment currencies are verified/i);
  assert.equal(serialized.includes("totalRevenue"), false);
  assert.equal(serialized.includes("animalsHelped"), false);
  assert.equal(serialized.includes("estimatedMeals"), false);
  assert.equal(serialized.includes("₹0"), false);
});

test("community stats show the verification pause without any money-derived number", () => {
  const Display = CommunityStatsDisplay as unknown as (
    props: { className: string },
  ) => React.ReactElement;
  const html = renderToStaticMarkup(Display({ className: "" }));

  assert.match(html, /Contribution totals are under verification/);
  assert.match(html, /historical payment currencies/i);
  assert.equal(html.includes("Confirmed Raised"), false);
  assert.equal(html.includes("Estimated Meals"), false);
  assert.equal(/₹[\d,.]/.test(html), false);
});
