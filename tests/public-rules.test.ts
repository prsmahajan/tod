import assert from "node:assert/strict";
import test from "node:test";
import { getDonationAmount } from "../lib/donations/public-rules";

test("returns server-owned preset amounts", () => {
  assert.equal(getDonationAmount("seedling"), 99);
  assert.equal(getDonationAmount("sprout"), 499);
  assert.equal(getDonationAmount("tree"), 999);
});

test("accepts a whole-number custom amount from 50 to 100000", () => {
  assert.equal(getDonationAmount("custom", 250), 250);
  assert.throws(() => getDonationAmount("custom", 49), /between/);
  assert.throws(() => getDonationAmount("custom", 100001), /between/);
  assert.throws(() => getDonationAmount("custom", 99.5), /whole/);
});

test("does not let a preset plan override its server amount", () => {
  assert.equal(getDonationAmount("seedling", 1), 99);
});
