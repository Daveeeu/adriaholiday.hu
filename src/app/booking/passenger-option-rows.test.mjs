import test from "node:test";
import assert from "node:assert/strict";

import { EMPTY_PASSENGER_OPTIONS } from "./booking-pricing.ts";
import {
  passengerOptionCoverage,
  setPassengerOption,
  togglePassengerOption,
} from "./passenger-option-rows.ts";

const singleRoom = { kind: "extra", extraId: 7 };
const cancellation = { kind: "cancellationInsurance" };
const three = [EMPTY_PASSENGER_OPTIONS, EMPTY_PASSENGER_OPTIONS, EMPTY_PASSENGER_OPTIONS];

test("ticking a row for everyone keeps each passenger's other choices", () => {
  const withInsurance = [{ ...EMPTY_PASSENGER_OPTIONS, travelInsurance: true }, EMPTY_PASSENGER_OPTIONS];
  const result = setPassengerOption(withInsurance, singleRoom, () => true);

  assert.deepEqual(result.map((options) => options.extraIds), [[7], [7]]);
  assert.deepEqual(result.map((options) => options.travelInsurance), [true, false]);
  assert.equal(passengerOptionCoverage(result, singleRoom), "all");
});

test("unticking a row for everyone clears it", () => {
  const everyone = setPassengerOption(three, cancellation, () => true);
  const nobody = setPassengerOption(everyone, cancellation, () => false);

  assert.equal(passengerOptionCoverage(nobody, cancellation), "none");
});

test("one passenger can be ticked on their own", () => {
  const result = togglePassengerOption(three, singleRoom, 1);

  assert.deepEqual(result.map((options) => options.extraIds), [[], [7], []]);
  assert.equal(passengerOptionCoverage(result, singleRoom), "some");
  assert.equal(passengerOptionCoverage(togglePassengerOption(result, singleRoom, 1), singleRoom), "none");
});

test("an extra is listed once even when ticked twice", () => {
  const once = setPassengerOption(three, singleRoom, () => true);
  const twice = setPassengerOption(once, singleRoom, () => true);

  assert.deepEqual(twice[0].extraIds, [7]);
});
