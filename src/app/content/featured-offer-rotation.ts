/** How many featured offers the homepage shows at once. */
export const FEATURED_OFFERS_SHOWN = 4;

/** How often the shown featured offers move on to the next ones, in days. */
export const FEATURED_ROTATION_DAYS = 1;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The featured offers in today's order: the list keeps its set order but
 * starts further along every rotation period, so with more offers than the
 * homepage shows each of them gets its turn. Everyone sees the same offers on
 * a given day; with no more offers than are shown, the order stays as set.
 */
export function rotateFeaturedOffers<T>(
  offers: T[],
  now: Date = new Date(),
  shown: number = FEATURED_OFFERS_SHOWN,
): T[] {
  if (offers.length <= shown) {
    return offers;
  }

  const localDay = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / DAY_MS);
  const period = Math.floor(localDay / FEATURED_ROTATION_DAYS);
  const start = (period * shown) % offers.length;

  return [...offers.slice(start), ...offers.slice(0, start)];
}
