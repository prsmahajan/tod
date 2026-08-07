import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("support page makes only evidence-backed animal feeding claims", () => {
  const source = readFileSync(
    new URL("../app/support/page.tsx", import.meta.url),
    "utf8",
  );

  for (const forbidden of [
    "Every contribution goes directly",
    "you always know where your help is going",
    "Feeds one animal for a week",
    "medical supplies",
    "temporary shelter or a vet visit",
    "Full Transparency",
    "All financials are documented and shared",
  ]) {
    assert.equal(source.includes(forbidden), false, `found unsupported support-page claim: ${forbidden}`);
  }

  assert.match(source, /A TOD account is not required/);
  assert.match(source, /confirmed contribution totals and approved feeding records/i);
  assert.match(source, /expense reconciliation is being prepared/i);
  assert.match(source, /href="\/impact#transparency"/);
});
