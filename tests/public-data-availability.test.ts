import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("an available source may truthfully return an empty public collection", async () => {
  let module: typeof import("../lib/public-data/availability");
  try {
    module = await import("../lib/public-data/availability");
  } catch {
    assert.fail("the shared public-data availability contract must exist");
  }

  const result = await module.collectAvailableSourceItems([
    { name: "primary", load: async () => [] },
  ]);

  assert.deepEqual(result, { items: [], failedSources: [] });
});

test("one successful source keeps public records available when another source fails", async () => {
  const module = await import("../lib/public-data/availability");

  const result = await module.collectAvailableSourceItems([
    { name: "unavailable", load: async () => { throw new Error("offline"); } },
    { name: "available", load: async () => [{ id: "feeding-1" }] },
  ]);

  assert.deepEqual(result, {
    items: [{ id: "feeding-1" }],
    failedSources: ["unavailable"],
  });
});

test("total source failure is unavailable instead of a genuine empty collection", async () => {
  const module = await import("../lib/public-data/availability");

  await assert.rejects(
    module.collectAvailableSourceItems([
      { name: "appwrite", load: async () => { throw new Error("offline"); } },
      { name: "prisma", load: async () => { throw new Error("missing database"); } },
    ]),
    (error: unknown) => {
      assert.ok(error instanceof module.PublicDataUnavailableError);
      assert.deepEqual(error.failedSources, ["appwrite", "prisma"]);
      return true;
    },
  );
});

test("public API failures return a non-cacheable 503 without misleading totals", async () => {
  const module = await import("../lib/public-data/availability");

  const response = await module.respondWithPublicData(
    async () => { throw new Error("backend unavailable"); },
    "Impact totals are unavailable right now.",
  );
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(payload, { error: "Impact totals are unavailable right now." });
  assert.equal(JSON.stringify(payload).includes("totalRevenue"), false);
  assert.equal(JSON.stringify(payload).includes("₹0"), false);
});

test("an available empty public response remains a successful 200", async () => {
  const module = await import("../lib/public-data/availability");

  const response = await module.respondWithPublicData(
    async () => ({ photos: [] }),
    "Featured feeding records are unavailable right now.",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { photos: [] });
});

test("community stats renders the currency-verification pause without zero values", async () => {
  let module: typeof import("../components/CommunityStats");
  try {
    module = await import("../components/CommunityStats");
  } catch {
    assert.fail("CommunityStats must expose its truthful display state for testing");
  }

  assert.equal(typeof module.CommunityStatsDisplay, "function");
  const html = renderToStaticMarkup(React.createElement(module.CommunityStatsDisplay, {
    className: "",
  }));

  assert.match(html, /Contribution totals are under verification/);
  assert.equal(html.includes("Confirmed Raised"), false);
  assert.equal(html.includes("Estimated Meals"), false);
  assert.equal(html.includes("₹0"), false);
});
