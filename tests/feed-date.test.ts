import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFeedDate } from "../lib/public-data/feed-date";

test("feed dates accept only real ISO calendar dates and supported UTC timestamps", () => {
  const cases: Array<{ value: unknown; expected: string | null }> = [
    { value: "2026-08-01", expected: "2026-08-01" },
    { value: "2024-02-29", expected: "2024-02-29" },
    { value: "2026-08-01T00:00:00.000Z", expected: "2026-08-01T00:00:00.000Z" },
    { value: "2026-08-01T12:34:56Z", expected: "2026-08-01T12:34:56Z" },
    { value: " 2026-08-01 ", expected: "2026-08-01" },
    { value: "2026-02-30", expected: null },
    { value: "2025-02-29", expected: null },
    { value: "2026-13-01", expected: null },
    { value: "2026-8-1", expected: null },
    { value: "08/01/2026", expected: null },
    { value: "2026-08-01T24:00:00.000Z", expected: null },
    { value: "2026-08-01T00:00:00+05:30", expected: null },
    { value: "not-a-date", expected: null },
    { value: null, expected: null },
  ];

  for (const { value, expected } of cases) {
    assert.equal(normalizeFeedDate(value), expected, `unexpected result for ${String(value)}`);
  }
});
