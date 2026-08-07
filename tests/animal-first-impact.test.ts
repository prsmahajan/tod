import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("impact page contains only the animal evidence journey", async () => {
  const module = await import("../app/impact/page");
  const html = renderToStaticMarkup(React.createElement(module.default));
  const normalized = html.toLowerCase();

  assert.match(html, /Feeding Records and Support/);
  assert.match(html, /Loading verified feeding records\./);
  assert.equal(html.includes("<main"), false, "the root layout already provides the main landmark");
  assert.equal((html.match(/<section/g) ?? []).length, 3, "only stats, feeding records, and transparency belong on this page");

  for (const forbidden of [
    "unsplash",
    "raja",
    "misty",
    "radical transparency",
    "#/mission",
    "feeding, shelter, care, and awareness",
    "a glimpse into our day",
    "across india",
  ]) {
    assert.equal(normalized.includes(forbidden), false, `found unsupported impact content: ${forbidden}`);
  }
});

test("feeding record card renders API facts without adding a story or outcome", async () => {
  let module: typeof import("../components/impact/FeedingRecordCard");
  try {
    module = await import("../components/impact/FeedingRecordCard");
  } catch {
    assert.fail("the genuine feeding record card must exist");
  }

  const html = renderToStaticMarkup(React.createElement(module.default, {
    record: {
      id: "feeding-1",
      imageUrl: "https://example.com/feeding-1.jpg",
      description: "Food served during the evening round.",
      userName: "A volunteer",
      location: "Sector 1",
      feedDate: "2026-08-01",
      animalCount: 4,
    },
  }));

  assert.match(html, /alt="Food served during the evening round\."/);
  assert.match(html, /dateTime="2026-08-01"/);
  assert.match(html, /1 August 2026/);
  assert.match(html, /Sector 1/);
  assert.match(html, /4 animals recorded/);
  assert.match(html, /Shared by A volunteer/);
  assert.equal(html.toLowerCase().includes("story"), false);
  assert.equal(html.toLowerCase().includes("outcome"), false);
});

test("impact record normalization rejects undated and malformed uploads", async () => {
  let module: typeof import("../components/impact/FeedingRecordCard");
  try {
    module = await import("../components/impact/FeedingRecordCard");
  } catch {
    assert.fail("the genuine feeding record normalizer must exist");
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
        description: "An animal photo without feeding evidence.",
        userName: "Admin",
      },
      {
        id: "bad-date",
        imageUrl: "https://example.com/bad-date.jpg",
        description: "Invalid record.",
        userName: "Admin",
        feedDate: "not-a-date",
      },
      {
        id: "impossible-date",
        imageUrl: "https://example.com/impossible-date.jpg",
        description: "Impossible record.",
        userName: "Admin",
        feedDate: "2026-02-30",
      },
      null,
    ],
  });

  assert.deepEqual(records, [{
    id: "feeding-1",
    imageUrl: "https://example.com/feeding-1.jpg",
    description: "Food served during the evening round.",
    userName: "A volunteer",
    location: "Sector 1",
    feedDate: "2026-08-01",
    animalCount: 4,
  }]);
});

test("impact records have honest loading, empty, and error states", async () => {
  let module: typeof import("../components/impact/FeedingRecordsDisplay");
  try {
    module = await import("../components/impact/FeedingRecordsDisplay");
  } catch {
    assert.fail("the feeding records state display must exist outside the Next page module");
  }

  const loading = renderToStaticMarkup(React.createElement(module.default, {
    status: "loading",
    records: [],
  }));
  assert.match(loading, /Loading verified feeding records\./);
  assert.match(loading, /motion-reduce:animate-none/);

  const empty = renderToStaticMarkup(React.createElement(module.default, {
    status: "ready",
    records: [],
  }));
  assert.match(empty, /No verified feeding records published yet\./);

  const error = renderToStaticMarkup(React.createElement(module.default, {
    status: "error",
    records: [],
  }));
  assert.match(error, /Feeding records could not be loaded right now\./);
});

test("transparency section states what is published and what is still being prepared", async () => {
  let module: typeof import("../components/impact/TransparencyStatus");
  try {
    module = await import("../components/impact/TransparencyStatus");
  } catch {
    assert.fail("the honest transparency status must exist");
  }

  const html = renderToStaticMarkup(React.createElement(module.default));

  assert.match(html, /id="transparency"/);
  assert.match(html, /confirmed donations/i);
  assert.match(html, /featured feeding records/i);
  assert.match(html, /Verified expense reconciliation is being prepared\./);
  assert.equal(html.toLowerCase().includes("every rupee"), false);
  assert.equal(html.toLowerCase().includes("real-time"), false);
});

test("impact metadata promises verified updates without real-time expense tracking", async () => {
  const module = await import("../app/impact/layout");

  assert.equal(
    module.metadata.description,
    "Verified feeding updates and confirmed community support for stray animals.",
  );

  const serialized = JSON.stringify(module.metadata).toLowerCase();
  assert.equal(serialized.includes("real-time"), false);
  assert.equal(serialized.includes("expense tracking"), false);
});
