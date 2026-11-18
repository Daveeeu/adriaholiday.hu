import test from "node:test";
import assert from "node:assert/strict";

import { issuedCouponDeadline, parseIssuedCoupon } from "./issued-coupon.ts";

const NOW = Date.parse("2026-11-18T12:00:00Z");
const coupon = { code: "LAST-K3P9QZ", percent: 5, expiresAt: "2026-11-19T12:00:00+00:00" };

test("a stored coupon holds until it expires", () => {
  assert.deepEqual(parseIssuedCoupon(JSON.stringify(coupon), NOW), coupon);
  assert.equal(parseIssuedCoupon(JSON.stringify(coupon), Date.parse("2026-11-19T12:00:01Z")), null);
});

test("nothing or something malformed stored gives no coupon", () => {
  assert.equal(parseIssuedCoupon(null, NOW), null);
  assert.equal(parseIssuedCoupon("{", NOW), null);
  assert.equal(parseIssuedCoupon(JSON.stringify({ ...coupon, percent: "5" }), NOW), null);
});

test("the deadline is told in Hungarian time", () => {
  assert.equal(issuedCouponDeadline(coupon), "november 19. 13:00");
});
