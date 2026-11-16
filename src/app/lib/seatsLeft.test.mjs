import test from "node:test";
import assert from "node:assert/strict";

import { seatsLeftLabel } from "./seatsLeft.ts";

test("seats are shown only when 15 or fewer are left", () => {
  assert.equal(seatsLeftLabel(15), "Már csak 15 hely");
  assert.equal(seatsLeftLabel(3), "Már csak 3 hely");
  assert.equal(seatsLeftLabel(16), null);
  assert.equal(seatsLeftLabel(37), null);
});

test("unknown or sold-out seats show nothing", () => {
  assert.equal(seatsLeftLabel(null), null);
  assert.equal(seatsLeftLabel(undefined), null);
  assert.equal(seatsLeftLabel(0), null);
});

