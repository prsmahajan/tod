import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/public/supporters/route";

test("public supporter endpoint publishes no unverified or partial counts", async () => {
  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 410);
  assert.deepEqual(body, {
    error: "Supporter counts are not published.",
  });
  assert.equal("total" in body, false);
  assert.equal("activeCount" in body, false);
  assert.equal("supporters" in body, false);
});
