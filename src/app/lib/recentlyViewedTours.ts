const STORAGE_KEY = "ah_recently_viewed_tours";

/** As many as the related offers endpoint takes. */
export const MAX_RECENTLY_VIEWED = 10;

/**
 * The list with the tour moved to the front, as the most recent view, and
 * cut to the maximum length.
 */
export function withViewedTour(slugs: string[], slug: string, max = MAX_RECENTLY_VIEWED): string[] {
  return [slug, ...slugs.filter((viewed) => viewed !== slug)].slice(0, max);
}

/**
 * The trips the visitor looked at, most recent first, kept only on their own
 * device and only while they allow personalised offers (the "Marketing"
 * cookie consent); the trip page's "Ezek is érdekelhetnek" offers use them.
 */
export function readRecentlyViewedTours(personalised: boolean): string[] {
  if (!personalised) {
    return [];
  }

  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");

    return Array.isArray(value) ? value.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

export function rememberViewedTour(slug: string, personalised: boolean): void {
  if (!personalised) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withViewedTour(readRecentlyViewedTours(true), slug)));
  } catch {
    // Without storage there is simply no history to personalise with.
  }
}

/** Forgets the views, e.g. when the visitor withdraws their consent. */
export function forgetViewedTours(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored then.
  }
}
