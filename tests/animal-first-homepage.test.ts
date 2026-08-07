import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "../app/page";

test("homepage leads with animal feeding and the approved donation journey", () => {
  const html = renderToStaticMarkup(React.createElement(HomePage));

  const expectedOrder = [
    "Help Feed Stray Animals",
    "Community-funded impact",
    "Latest Feeding Records",
    "From donation to feeding proof",
    "Ten months of personally funded feeding",
    "Choose a one-time contribution",
    "Transparency is part of the work",
  ];

  let previousIndex = -1;
  for (const heading of expectedOrder) {
    const index = html.indexOf(heading);
    assert.notEqual(index, -1, `missing homepage section: ${heading}`);
    assert.ok(index > previousIndex, `${heading} is out of order`);
    previousIndex = index;
  }

  assert.match(html, /href="\/support"[^>]*>Donate ₹99</);
  assert.match(html, /href="\/impact"[^>]*>See Feeding Updates</);
  assert.match(html, /href="\/support\?plan=seedling"/);
  assert.match(html, /href="\/support\?plan=sprout"/);
  assert.match(html, /href="\/support\?plan=tree"/);
  assert.match(html, /href="\/impact#transparency"/);
});

test("homepage has no technology funnel, waitlist, invented allocation, or decorative stock story", () => {
  const html = renderToStaticMarkup(React.createElement(HomePage)).toLowerCase();

  for (const forbidden of [
    "learn tech",
    "technology education",
    "read articles",
    "join the waitlist",
    "85%",
    "10%",
    "5%",
    "unsplash",
  ]) {
    assert.equal(html.includes(forbidden), false, `found forbidden homepage content: ${forbidden}`);
  }
});

test("homepage impact summary omits subscription-derived supporter counts", async () => {
  let module: typeof import("../lib/homepage/impact-summary");
  try {
    module = await import("../lib/homepage/impact-summary");
  } catch {
    assert.fail("the truthful homepage impact summary builder must exist");
  }

  assert.deepEqual(module.toHomepageImpactSummary({
    totalRevenue: 1500,
    totalSupporters: 99,
    activeSubscriptions: 12,
    animalsHelped: 30,
    display: { totalRevenue: "₹1.5K" },
  }), [
    { label: "Confirmed Raised", value: "₹1.5K" },
    { label: "Estimated Meals Funded", value: 30 },
  ]);
});

test("founder story states only the confirmed ten-month funding fact", () => {
  const html = renderToStaticMarkup(React.createElement(HomePage));

  assert.match(html, /The founder personally funded stray animal feeding for ten months\./);
  assert.equal(html.includes("before asking the public to help"), false);
});

test("donation card prices use the body typography role", async () => {
  const module = await import("../components/home/DonationChoices");
  const html = renderToStaticMarkup(React.createElement(module.default));

  assert.match(html, /class="[^"]*font-body[^"]*"[^>]*>₹99</);
  assert.match(html, /class="[^"]*font-body[^"]*"[^>]*>₹499</);
  assert.match(html, /class="[^"]*font-body[^"]*"[^>]*>₹999</);
});

test("root metadata describes animal feeding without technology marketing", async () => {
  let module: typeof import("../lib/homepage/metadata");
  try {
    module = await import("../lib/homepage/metadata");
  } catch {
    assert.fail("the animal-first root metadata builder must exist");
  }

  const serializedMetadata = JSON.stringify(module.buildRootMetadata()).toLowerCase();

  assert.match(serializedMetadata, /feed stray animals/);
  assert.match(serializedMetadata, /verified feeding updates/);
  assert.equal(serializedMetadata.includes("learn tech"), false);
  assert.equal(serializedMetadata.includes("technology education"), false);
  assert.equal(serializedMetadata.includes("learn to code"), false);
});

test("featured record normalization keeps only genuine dated feeding records and caps the homepage at three", async () => {
  let module: typeof import("../components/home/LatestFeedingRecords");
  try {
    module = await import("../components/home/LatestFeedingRecords");
  } catch {
    assert.fail("LatestFeedingRecords and its public record normalizer must exist");
  }

  const records = module.normalizeFeaturedRecords({
    photos: [
      {
        id: "feeding-1",
        imageUrl: "https://example.com/feeding-1.jpg",
        description: "Food served during the evening round.",
        userName: "A volunteer",
        location: "Sector 1",
        feedDate: "2026-08-01",
        animalCount: 4,
      },
      {
        id: "undated-admin-photo",
        imageUrl: "https://example.com/admin.jpg",
        description: "An uploaded animal photo.",
        userName: "Admin",
      },
      {
        id: "feeding-2",
        imageUrl: "https://example.com/feeding-2.jpg",
        description: "Morning feeding round.",
        userName: "Another volunteer",
        feedDate: "2026-08-02",
      },
      {
        id: "feeding-3",
        imageUrl: "https://example.com/feeding-3.jpg",
        description: "Water and food placed together.",
        userName: "Community member",
        feedDate: "2026-08-03",
      },
      {
        id: "feeding-4",
        imageUrl: "https://example.com/feeding-4.jpg",
        description: "A fourth valid record.",
        userName: "Community member",
        feedDate: "2026-08-04",
      },
    ],
  });

  assert.deepEqual(records.map((record) => record.id), [
    "feeding-1",
    "feeding-2",
    "feeding-3",
  ]);
  assert.deepEqual(records[0], {
    id: "feeding-1",
    imageUrl: "https://example.com/feeding-1.jpg",
    description: "Food served during the evening round.",
    userName: "A volunteer",
    location: "Sector 1",
    feedDate: "2026-08-01",
    animalCount: 4,
  });
});

test("featured record normalization rejects malformed API data", async () => {
  let module: typeof import("../components/home/LatestFeedingRecords");
  try {
    module = await import("../components/home/LatestFeedingRecords");
  } catch {
    assert.fail("LatestFeedingRecords and its public record normalizer must exist");
  }

  assert.deepEqual(module.normalizeFeaturedRecords(null), []);
  assert.deepEqual(module.normalizeFeaturedRecords({ photos: "not-an-array" }), []);
  assert.deepEqual(module.normalizeFeaturedRecords({
    photos: [
      null,
      { id: "", imageUrl: "x", description: "x", userName: "x", feedDate: "2026-08-01" },
      { id: "x", imageUrl: "", description: "x", userName: "x", feedDate: "2026-08-01" },
      { id: "x", imageUrl: "x", description: "", userName: "x", feedDate: "2026-08-01" },
      { id: "x", imageUrl: "x", description: "x", userName: "", feedDate: "2026-08-01" },
      { id: "x", imageUrl: "x", description: "x", userName: "x", feedDate: "2026-02-30" },
    ],
  }), []);
});

test("featured-record loading state is announced and respects reduced motion", async () => {
  const module = await import("../components/home/LatestFeedingRecords");
  const html = renderToStaticMarkup(React.createElement(module.default));

  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Loading verified feeding records\./);
  assert.match(html, /motion-reduce:animate-none/);
});
