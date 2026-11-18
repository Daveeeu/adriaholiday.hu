import test from "node:test";
import assert from "node:assert/strict";

import { isChristmasSeason } from "./christmas-season.ts";

test("the season runs from 15 November to Epiphany", () => {
  assert.equal(isChristmasSeason(new Date("2026-11-14T12:00:00+01:00")), false);
  assert.equal(isChristmasSeason(new Date("2026-11-15T00:00:00+01:00")), true);
  assert.equal(isChristmasSeason(new Date("2026-12-24T18:00:00+01:00")), true);
  assert.equal(isChristmasSeason(new Date("2027-01-06T23:59:00+01:00")), true);
  assert.equal(isChristmasSeason(new Date("2027-01-07T00:00:00+01:00")), false);
  assert.equal(isChristmasSeason(new Date("2027-07-01T12:00:00+02:00")), false);
});

test("the days are counted in Hungarian time", () => {
  // 23:30 UTC on 14 November is already the 15th in Budapest.
  assert.equal(isChristmasSeason(new Date("2026-11-14T23:30:00Z")), true);
  // 23:30 UTC on 6 January is already the 7th in Budapest.
  assert.equal(isChristmasSeason(new Date("2027-01-06T23:30:00Z")), false);
});
