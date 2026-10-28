import test from "node:test";
import assert from "node:assert/strict";

import { EMPTY_PASSENGER_OPTIONS, estimateBookingPrice } from "./booking-pricing.ts";

const singleRoom = { id: 1, name: "Egyágyas felár", price: 30000, currency: "HUF", priceUnit: "per_person", chargeRule: "solo_traveller" };
const cityTax = { id: 2, name: "Üdülőhelyi illeték", price: 3900, currency: "HUF", priceUnit: "per_person", chargeRule: "mandatory" };

function estimate(passengers) {
  return estimateBookingPrice({
    basePrice: 139800,
    discountPercent: null,
    departurePlace: null,
    extras: [singleRoom, cityTax],
    bookingExtraIds: [],
    passengerOptions: Array.from({ length: passengers }, () => EMPTY_PASSENGER_OPTIONS),
    insurances: null,
    startDate: null,
    endDate: null,
  });
}

test("per-person lines show how many pay and at what price each", () => {
  const { lines, total } = estimate(2);

  assert.deepEqual(
    lines.map(({ label, amount, perPerson }) => ({ label, amount, perPerson })),
    [
      { label: "Részvételi díj", amount: 279600, perPerson: { count: 2, unitPrice: 139800 } },
      { label: "Üdülőhelyi illeték", amount: 7800, perPerson: { count: 2, unitPrice: 3900 } },
    ],
  );
  assert.equal(total, 287400);
});

test("the single room supplement is charged only to a solo traveller", () => {
  assert.ok(estimate(1).lines.some((line) => line.label === "Egyágyas felár"));
  assert.ok(!estimate(2).lines.some((line) => line.label === "Egyágyas felár"));
});
