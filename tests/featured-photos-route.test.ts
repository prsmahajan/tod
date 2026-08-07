import assert from "node:assert/strict";
import { mock, test } from "node:test";

function mockModule(specifier: string, exports: Record<string, unknown>) {
  Reflect.apply(mock.module, mock, [specifier, { exports }]);
}

test("the featured route relies only on complete feeding records", async (context) => {
  let feedingSourceAvailable = false;
  let adminQueries = 0;
  context.after(() => mock.restoreAll());
  mock.method(console, "error", () => undefined);

  mockModule("@/lib/appwrite/server", {
    databases: {
      listDocuments: async () => {
        if (!feedingSourceAvailable) {
          throw new Error("Appwrite feeding records are offline");
        }

        return {
          documents: [
            {
              $id: "feeding-1",
              imageIds: ["image-1"],
              description: "Evening feeding round.",
              userName: "Volunteer",
              location: "Sector 1",
              feedDate: "2026-08-01",
              animalCount: 4,
            },
            {
              $id: "undated",
              imageIds: ["image-2"],
              description: "No date supplied.",
              userName: "Volunteer",
            },
            {
              $id: "bad-date",
              imageIds: ["image-3"],
              description: "Bad date supplied.",
              userName: "Volunteer",
              feedDate: "not-a-date",
            },
            {
              $id: "",
              imageIds: ["image-4"],
              description: "No record identity.",
              userName: "Volunteer",
              feedDate: "2026-08-02",
            },
          ],
        };
      },
    },
    storage: {
      getFilePreview: (_bucket: string, imageId: string) => new URL(`https://example.com/${imageId}.jpg`),
    },
    DATABASE_ID: "test-database",
    COLLECTIONS: { USER_PHOTOS: "user-photos" },
    BUCKETS: { USER_UPLOADS: "user-uploads" },
    Query: {
      equal: () => "equal",
      orderDesc: () => "order-desc",
      limit: () => "limit",
    },
  });

  mockModule("@/lib/db", {
    prisma: {
      animalPhoto: {
        findMany: async () => {
          adminQueries += 1;
          return [{
            id: "admin-gallery-photo",
            imageUrl: "https://example.com/admin.jpg",
            caption: "A general animal photo without a feeding date.",
            uploader: { name: "Admin" },
          }];
        },
      },
    },
  });

  const route = await import(`../app/api/photos/featured/route?test=${Date.now()}`);

  await context.test("an available admin gallery cannot hide a failed feeding source", async () => {
    const response = await route.GET();

    assert.equal(adminQueries, 0, "general admin photos must not be consulted as feeding evidence");
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), {
      error: "Featured feeding records are unavailable right now.",
    });
  });

  await context.test("a successful feeding source publishes only complete dated records", async () => {
    feedingSourceAvailable = true;
    const response = await route.GET();

    assert.equal(response.status, 200);
    assert.equal(adminQueries, 0);
    assert.deepEqual(await response.json(), {
      photos: [{
        id: "feeding-1",
        imageUrl: "https://example.com/image-1.jpg",
        description: "Evening feeding round.",
        userName: "Volunteer",
        location: "Sector 1",
        feedDate: "2026-08-01",
        animalCount: 4,
        source: "user",
      }],
    });
  });
});
