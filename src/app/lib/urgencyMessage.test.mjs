import test from "node:test";
import assert from "node:assert/strict";

import { urgencyMessage } from "./urgencyMessage.ts";

test("running low seats are counted for the selected date", () => {
  assert.deepEqual(urgencyMessage({ seatsRunningLow: true, seatsLeft: 6 }), {
    title: "Fogynak a helyek!",
    text: "Erre az időpontra már csak 6 szabad hely maradt.",
  });
});

test("the last seats discount is offered with the seats left", () => {
  assert.equal(
    urgencyMessage({ seatsRunningLow: true, seatsLeft: 3, discountPercent: 5 }).text,
    "Erre az időpontra már csak 3 szabad hely maradt. Ha most foglalsz, 5% kedvezményt adunk a részvételi díjból.",
  );
});

test("a date with enough free seats or none left shows nothing", () => {
  assert.equal(urgencyMessage({ seatsRunningLow: false, seatsLeft: 30 }), null);
  assert.equal(urgencyMessage({ seatsRunningLow: true, seatsLeft: 0 }), null);
});
