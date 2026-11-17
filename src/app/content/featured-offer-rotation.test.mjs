import test from "node:test";
import assert from "node:assert/strict";

import { rotateFeaturedOffers } from "./featured-offer-rotation.ts";

const offers = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const day = (date) => new Date(`${date}T12:00:00`);

test("a few offers keep their set order", () => {
  assert.deepEqual(rotateFeaturedOffers(["a", "b", "c"], day("2026-11-18")), ["a", "b", "c"]);
  assert.deepEqual(rotateFeaturedOffers(["a", "b", "c", "d"], day("2026-11-18")), ["a", "b", "c", "d"]);
});

test("the shown offers move on by four every day, all of them kept in order", () => {
  const today = rotateFeaturedOffers(offers, day("2026-11-18"));
  const tomorrow = rotateFeaturedOffers(offers, day("2026-11-19"));

  assert.equal(today.length, offers.length);
  assert.deepEqual([...today].sort(), offers);
  assert.equal(offers.indexOf(tomorrow[0]), (offers.indexOf(today[0]) + 4) % offers.length);
  assert.deepEqual(today, [...offers.slice(offers.indexOf(today[0])), ...offers.slice(0, offers.indexOf(today[0]))]);
});

test("the order is the same all day long", () => {
  assert.deepEqual(
    rotateFeaturedOffers(offers, new Date("2026-11-18T00:05:00")),
    rotateFeaturedOffers(offers, new Date("2026-11-18T23:55:00")),
  );
});

test("every offer gets its turn among the first four within a few days", () => {
  const shown = new Set();

  for (let i = 0; i < 5; i += 1) {
    const date = new Date(day("2026-11-18").getTime() + i * 24 * 60 * 60 * 1000);
    rotateFeaturedOffers(offers, date).slice(0, 4).forEach((offer) => shown.add(offer));
  }

  assert.equal(shown.size, offers.length);
});
