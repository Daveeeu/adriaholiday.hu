import test from "node:test";
import assert from "node:assert/strict";

import { lastSeatsCouponDeadline, parseLastSeatsCoupon } from "./last-seats-coupon.ts";

const NOW = Date.parse("2026-11-18T12:00:00Z");
const coupon = { code: "LAST-K3P9QZ", percent: 5, expiresAt: "2026-11-19T12:00:00+00:00" };

test("a stored coupon holds until it expires", () => {
  assert.deepEqual(parseLastSeatsCoupon(JSON.stringify(coupon), NOW), coupon);
  assert.equal(parseLastSeatsCoupon(JSON.stringify(coupon), Date.parse("2026-11-19T12:00:01Z")), null);
});

test("nothing or something malformed stored gives no coupon", () => {
  assert.equal(parseLastSeatsCoupon(null, NOW), null);
  assert.equal(parseLastSeatsCoupon("{", NOW), null);
  assert.equal(parseLastSeatsCoupon(JSON.stringify({ ...coupon, percent: "5" }), NOW), null);
});

test("the deadline is told in Hungarian time", () => {
  assert.equal(lastSeatsCouponDeadline(coupon), "november 19. 13:00");
});
