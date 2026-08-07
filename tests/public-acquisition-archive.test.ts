import assert from "node:assert/strict";
import test from "node:test";

test("retired public acquisition endpoints return a truthful archive response", async () => {
  let module: {
    archivedAcquisitionResponse?: () => Response;
  } = {};
  try {
    module = await import("../lib/public-acquisition");
  } catch {
    // The assertion below records the missing release boundary as a RED failure.
  }

  assert.equal(typeof module.archivedAcquisitionResponse, "function");
  if (!module.archivedAcquisitionResponse) return;

  const response = module.archivedAcquisitionResponse();
  const payload = await response.json();

  assert.equal(response.status, 410);
  assert.deepEqual(payload, {
    error: "This signup program is no longer accepting entries.",
  });
});

test("legacy signup and projection routes all use the archive boundary", async () => {
  const handlers = [
    (await import("../app/api/waitlist/route")).GET,
    (await import("../app/api/waitlist/route")).POST,
    (await import("../app/api/subscribe/route")).POST,
    (await import("../app/api/subscribers/route")).POST,
    (await import("../app/api/stats/route")).GET,
    (await import("../app/api/stats/subscribers/route")).GET,
  ];

  for (const handler of handlers) {
    const response = await handler();
    assert.equal(response.status, 410);
    assert.deepEqual(await response.json(), {
      error: "This signup program is no longer accepting entries.",
    });
  }
});
