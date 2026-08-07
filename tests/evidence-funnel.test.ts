import assert from "node:assert/strict";
import test from "node:test";

import { shouldTrackEvidenceView } from "../lib/analytics/evidence-funnel";

test("evidence is not counted while loading or after empty and failed responses", () => {
  assert.equal(shouldTrackEvidenceView({ status: "loading", recordCount: 0, isIntersecting: true, hasTracked: false }), false);
  assert.equal(shouldTrackEvidenceView({ status: "ready", recordCount: 0, isIntersecting: true, hasTracked: false }), false);
  assert.equal(shouldTrackEvidenceView({ status: "error", recordCount: 0, isIntersecting: true, hasTracked: false }), false);
});

test("genuine ready records are counted only after intersection", () => {
  assert.equal(shouldTrackEvidenceView({ status: "ready", recordCount: 2, isIntersecting: false, hasTracked: false }), false);
  assert.equal(shouldTrackEvidenceView({ status: "ready", recordCount: 2, isIntersecting: true, hasTracked: false }), true);
});

test("duplicate visibility callbacks are ignored after evidence was counted", () => {
  assert.equal(shouldTrackEvidenceView({ status: "ready", recordCount: 2, isIntersecting: true, hasTracked: true }), false);
});
