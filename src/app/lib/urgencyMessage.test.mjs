import test from "node:test";
import assert from "node:assert/strict";

import { urgencyMessage } from "./urgencyMessage.ts";

test("running low seats are counted for the selected date", () => {
  assert.deepEqual(urgencyMessage({ seatsRunningLow: true, seatsLeft: 6, urgencyText: "18 fő érdeklődött" }), {
    title: "Fogynak a helyek!",
    text: "Erre az időpontra már csak 6 szabad hely maradt.",
  });
});

test("otherwise the office's urgency text is shown", () => {
  assert.deepEqual(urgencyMessage({ seatsRunningLow: false, seatsLeft: 30, urgencyText: " 18 fő érdeklődött " }), {
    title: "Ne maradj le!",
    text: "18 fő érdeklődött",
  });
});

test("nothing to urge shows nothing", () => {
  assert.equal(urgencyMessage({ seatsRunningLow: false, seatsLeft: 30, urgencyText: "" }), null);
  assert.equal(urgencyMessage({ seatsRunningLow: true, seatsLeft: 0, urgencyText: null }), null);
});
