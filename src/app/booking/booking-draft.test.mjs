import test from "node:test";
import assert from "node:assert/strict";

import { EMPTY_PASSENGER_OPTIONS } from "./booking-pricing.ts";
import { parseBookingDraft, serializeBookingDraft } from "./booking-draft.ts";

const draft = {
  dateId: "812",
  passengerCount: 2,
  departurePlaceId: "3",
  bookingExtraIds: [5],
  bookingExtraChoices: { 5: "Ablak mellett" },
  passengerOptions: [
    { extraIds: [7], extraChoices: { 7: "Egyedül" }, travelInsurance: false, cancellationInsurance: true },
    EMPTY_PASSENGER_OPTIONS,
  ],
};

test("a saved draft reads back the same", () => {
  assert.deepEqual(parseBookingDraft(serializeBookingDraft(draft), 20), draft);
});

test("the head count is held to the free seats, options following it", () => {
  const parsed = parseBookingDraft(serializeBookingDraft({ ...draft, passengerCount: 5 }), 3);

  assert.equal(parsed.passengerCount, 3);
  assert.equal(parsed.passengerOptions.length, 3);
  assert.deepEqual(parsed.passengerOptions[2], EMPTY_PASSENGER_OPTIONS);
});

test("anything else is ignored", () => {
  assert.equal(parseBookingDraft(null, 20), null);
  assert.equal(parseBookingDraft("not json", 20), null);
  assert.equal(parseBookingDraft(JSON.stringify({ ...draft, version: 99 }), 20), null);
  assert.equal(parseBookingDraft(JSON.stringify({ version: 1, ...draft, bookingExtraIds: ["x"] }), 20), null);
});

test("no personal data is written", () => {
  const stored = JSON.parse(serializeBookingDraft(draft));

  assert.deepEqual(Object.keys(stored).sort(), [
    "bookingExtraChoices",
    "bookingExtraIds",
    "dateId",
    "departurePlaceId",
    "passengerCount",
    "passengerOptions",
    "version",
  ]);
});
