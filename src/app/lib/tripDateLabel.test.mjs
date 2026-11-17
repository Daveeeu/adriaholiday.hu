import test from "node:test";
import assert from "node:assert/strict";

import { tripDateLabel } from "./tripDateLabel.ts";

test("a multi-day date shows its span", () => {
  assert.equal(tripDateLabel("2027-04-04", "2027-04-10"), "2027.04.04. - 04.10.");
  assert.equal(tripDateLabel("2027-07-30", "2027-08-02"), "2027.07.30. - 08.02.");
});

test("a one-day trip shows only its day", () => {
  assert.equal(tripDateLabel("2027-12-06", "2027-12-06"), "2027.12.06.");
  assert.equal(tripDateLabel("2027-12-06", null), "2027.12.06.");
});

test("a date without a start has no label", () => {
  assert.equal(tripDateLabel(null, "2027-12-06"), null);
});
