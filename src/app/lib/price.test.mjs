import test from "node:test";
import assert from "node:assert/strict";

import { formatAmount, formatHuf } from "./price.ts";

test("prices use a dot thousands separator and Ft", () => {
  assert.equal(formatHuf(68900), "68.900 Ft");
  assert.equal(formatHuf(1250000), "1.250.000 Ft");
  assert.equal(formatHuf(900), "900 Ft");
  assert.equal(formatHuf(0), "0 Ft");
});

test("amounts are rounded to whole forints and keep their sign", () => {
  assert.equal(formatAmount(68899.6), "68.900");
  assert.equal(formatAmount(-5000), "-5.000");
});
