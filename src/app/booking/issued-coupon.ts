import type { IssuedCoupon } from "./bookings-api";

/** The stored coupon when it is well formed and has not expired by `now`, else null. */
export function parseIssuedCoupon(raw: string | null, now: number): IssuedCoupon | null {
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
 * The coupon this browser was given and stored under the key, so a reload or
 * another visit shows the same one instead of asking for a new one.
 */
export function readIssuedCoupon(storageKey: string): IssuedCoupon | null {
  try {
    return parseIssuedCoupon(window.localStorage.getItem(storageKey), Date.now());
  } catch {
    return null;
  }
}

export function storeIssuedCoupon(storageKey: string, coupon: IssuedCoupon): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(coupon));
  } catch {
    // Without storage the coupon still holds for this page view.
  }
}

/** "november 19. 14:30", the moment the coupon expires, in Hungarian time. */
export function issuedCouponDeadline(coupon: IssuedCoupon): string {
  return new Intl.DateTimeFormat("hu-HU", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Budapest",
  }).format(new Date(coupon.expiresAt));
}
