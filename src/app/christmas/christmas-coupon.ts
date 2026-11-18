import type { IssuedCoupon } from "../booking/bookings-api";
import { readIssuedCoupon, storeIssuedCoupon } from "../booking/issued-coupon";

const STORAGE_KEY = "adria:christmas-coupon";

/** The coupon this browser found in the Christmas gift box, while it holds. */
export function readChristmasCoupon(): IssuedCoupon | null {
  return readIssuedCoupon(STORAGE_KEY);
}

export function storeChristmasCoupon(coupon: IssuedCoupon): void {
  storeIssuedCoupon(STORAGE_KEY, coupon);
}
