import { useCallback, useMemo, useState } from "react";

import { claimLastSeatsCoupon, type IssuedCoupon } from "./bookings-api";
import { readLastSeatsCoupon, storeLastSeatsCoupon } from "./last-seats-coupon";
import type { BookingDateOption } from "./useTourBookingForm";

/**
 * The one-day last seats coupon of the selected date: the percentage the
 * date offers (null when it offers none), the coupon this browser was given
 * for it, and a way to ask the server for one.
 */
export function useLastSeatsCoupon(tourSlug: string, date: BookingDateOption) {
  const offeredPercent = date.lastSeatsDiscountPercent ?? null;
  const [claimed, setClaimed] = useState<Record<string, IssuedCoupon>>({});
  const dateKey = String(date.id);

  const coupon = useMemo(
    () => (offeredPercent !== null ? claimed[dateKey] ?? readLastSeatsCoupon(tourSlug, dateKey) : null),
    [claimed, dateKey, offeredPercent, tourSlug],
  );

  const claim = useCallback(async (): Promise<IssuedCoupon> => {
    const given = await claimLastSeatsCoupon(tourSlug, dateKey);

    storeLastSeatsCoupon(tourSlug, dateKey, given);
    setClaimed((current) => ({ ...current, [dateKey]: given }));

    return given;
  }, [dateKey, tourSlug]);

  return { offeredPercent, coupon, claim };
}

export type LastSeatsCouponState = ReturnType<typeof useLastSeatsCoupon>;
