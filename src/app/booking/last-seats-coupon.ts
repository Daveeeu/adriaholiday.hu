import type { LastSeatsCoupon } from "./bookings-api";

const KEY_PREFIX = "adria:last-seats-coupon:";

function storageKey(tourSlug: string, tourDateId: number | string): string {
  return `${KEY_PREFIX}${tourSlug}:${tourDateId}`;
}

/** The stored coupon when it is well formed and has not expired by `now`, else null. */
export function parseLastSeatsCoupon(raw: string | null, now: number): LastSeatsCoupon | null {
  if (raw === null) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(raw);

    if (typeof value !== "object" || value === null) {
      return null;
    }

    const { code, percent, expiresAt } = value as Record<string, unknown>;

    if (typeof code !== "string" || typeof percent !== "number" || typeof expiresAt !== "string") {
      return null;
    }

    const expires = Date.parse(expiresAt);

    return Number.isFinite(expires) && expires > now ? { code, percent, expiresAt } : null;
  } catch {
    return null;
  }
}

/**
 * The coupon this browser was given for the date, so a reload or another
 * visit within its day shows the same one instead of asking for a new one.
 */
export function readLastSeatsCoupon(tourSlug: string, tourDateId: number | string): LastSeatsCoupon | null {
  try {
    return parseLastSeatsCoupon(window.localStorage.getItem(storageKey(tourSlug, tourDateId)), Date.now());
  } catch {
    return null;
  }
}

export function storeLastSeatsCoupon(tourSlug: string, tourDateId: number | string, coupon: LastSeatsCoupon): void {
  try {
    window.localStorage.setItem(storageKey(tourSlug, tourDateId), JSON.stringify(coupon));
  } catch {
    // Without storage the coupon still holds for this page view.
  }
}

/** "november 19. 14:30", the moment the coupon expires, in Hungarian time. */
export function lastSeatsCouponDeadline(coupon: LastSeatsCoupon): string {
  return new Intl.DateTimeFormat("hu-HU", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Budapest",
  }).format(new Date(coupon.expiresAt));
}
