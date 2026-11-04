import type { AnalyticsEntity, AnalyticsItem } from "./event-catalog";
import { trackEvent } from "./trackEvent";

type TourLike = {
  slug: string;
  name: string;
  price?: number | null;
  country?: string | null;
};

/**
 * A tour as a commerce item. The slug is the item id everywhere (lists, offer
 * page, booking), so GA4 joins a tour's views, selections and bookings.
 */
export function tourItem(tour: TourLike, overrides: Partial<AnalyticsItem> = {}): AnalyticsItem {
  return {
    id: tour.slug,
    name: tour.name,
    category: "tour",
    ...(tour.country ? { variant: tour.country } : {}),
    ...(typeof tour.price === "number" ? { price: tour.price } : {}),
    ...overrides,
  };
}

/** An apartment as a commerce item; the variant is its resort. */
export function apartmentItem(
  apartment: { slug: string; name: string; location?: { name: string } | null },
  overrides: Partial<AnalyticsItem> = {},
): AnalyticsItem {
  return {
    id: apartment.slug,
    name: apartment.name,
    category: "apartment",
    ...(apartment.location?.name ? { variant: apartment.location.name } : {}),
    ...overrides,
  };
}

/** Offer cards carry the slug as seoName. */
export function offerCardTour(card: { seoName: string; name: string; price?: number | null; country?: string | null }): TourLike {
  return { slug: card.seoName, name: card.name, price: card.price, country: card.country };
}

/** Reports a page of offer cards shown in a list (category, search results). */
export function trackItemListView(
  listName: string,
  entity: AnalyticsEntity,
  tours: TourLike[],
  startIndex = 0,
) {
  if (tours.length === 0) {
    return;
  }

  trackEvent("item_list_view", {
    entity,
    metadata: { item_list_name: listName, item_count: tours.length },
    ecommerce: {
      listName,
      items: tours.map((tour, index) => tourItem(tour, { index: startIndex + index, listName })),
    },
  });
}

/** Reports the offer card a visitor picked from a list. */
export function trackItemSelect(listName: string, entity: AnalyticsEntity, tour: TourLike, index?: number) {
  trackEvent("item_select", {
    entity,
    metadata: { item_list_name: listName },
    ecommerce: {
      listName,
      items: [tourItem(tour, { listName, ...(index !== undefined ? { index } : {}) })],
    },
  });
}
