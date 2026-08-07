import assert from "node:assert/strict";
import test from "node:test";
import { createFeaturedFeedingResponse } from "../lib/public-data/featured-feeding";

test("a failed Appwrite feeding loader returns a non-cacheable 503", async () => {
  const response = await createFeaturedFeedingResponse({
    loadDocuments: async () => {
      throw new Error("Appwrite feeding records are offline");
    },
    getImageUrl: () => "https://example.com/unreachable.jpg",
  });

  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    error: "Featured feeding records are unavailable right now.",
  });
});

test("a successful empty Appwrite feeding loader returns a truthful empty 200", async () => {
  const response = await createFeaturedFeedingResponse({
    loadDocuments: async () => [],
    getImageUrl: () => "https://example.com/unreachable.jpg",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { photos: [] });
});

test("the featured response keeps only complete records with real ISO feeding dates", async () => {
  const response = await createFeaturedFeedingResponse({
    loadDocuments: async () => [
      {
        $id: "feeding-1",
        imageIds: ["image-1"],
        description: "Evening feeding round.",
        userName: "Volunteer",
        location: "Sector 1",
        feedDate: "2026-08-01T00:00:00.000Z",
        animalCount: 4,
      },
      {
        $id: "impossible-date",
        imageIds: ["image-2"],
        description: "This date must not roll into March.",
        userName: "Volunteer",
        feedDate: "2026-02-30",
      },
      {
        $id: "malformed-date",
        imageIds: ["image-3"],
        description: "This date is malformed.",
        userName: "Volunteer",
        feedDate: "08/01/2026",
      },
      {
        $id: "undated",
        imageIds: ["image-4"],
        description: "No date supplied.",
        userName: "Volunteer",
      },
      {
        $id: "",
        imageIds: ["image-5"],
        description: "No record identity.",
        userName: "Volunteer",
        feedDate: "2026-08-02",
      },
    ],
    getImageUrl: (imageId) => `https://example.com/${imageId}.jpg`,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    photos: [{
      id: "feeding-1",
      imageUrl: "https://example.com/image-1.jpg",
      description: "Evening feeding round.",
      userName: "Volunteer",
      location: "Sector 1",
      feedDate: "2026-08-01T00:00:00.000Z",
      animalCount: 4,
      source: "user",
    }],
  });
});
