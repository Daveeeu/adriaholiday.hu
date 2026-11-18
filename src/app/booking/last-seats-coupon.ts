import type { IssuedCoupon } from "./bookings-api";
import { readIssuedCoupon, storeIssuedCoupon } from "./issued-coupon";

const KEY_PREFIX = "adria:last-seats-coupon:";

function storageKey(tourSlug: string, tourDateId: number | string): string {
  return `${KEY_PREFIX}${tourSlug}:${tourDateId}`;
}

/** The last seats coupon this browser was given for the date, while it holds. */
export function readLastSeatsCoupon(tourSlug: string, tourDateId: number | string): IssuedCoupon | null {
  return readIssuedCoupon(storageKey(tourSlug, tourDateId));
}

export function storeLastSeatsCoupon(tourSlug: string, tourDateId: number | string, coupon: IssuedCoupon): void {
  storeIssuedCoupon(storageKey(tourSlug, tourDateId), coupon);
}
