import type { PortfolioFeaturedTour } from "./portfolio-featured-tours-api";

export type FeaturedOfferFilter = {
  key: string;
  label: string;
  matches: (tour: PortfolioFeaturedTour) => boolean;
};

export const ALL_OFFERS_FILTER: FeaturedOfferFilter = {
  key: "all",
  label: "Összes ajánlat",
  matches: () => true,
};

/**
 * The filter chips of the featured offers: travel modes, the tours'
 * categories (as set in the admin) and discounted tours, after "Összes
 * ajánlat". A chip shows only when it selects at least one tour and not the
 * same tours as a chip before it (e.g. "Körutazások" when every tour is one).
 */
export function buildFeaturedOfferFilters(
  tours: PortfolioFeaturedTour[],
): FeaturedOfferFilter[] {
  const categories = new Map<string, string>();

  tours.forEach((tour) =>
    (tour.categories ?? []).forEach((category) => categories.set(category.id, category.label)),
  );

  const candidates: FeaturedOfferFilter[] = [
    { key: "bus", label: "Autóbuszos utak", matches: (tour) => tour.transport === "bus" },
    { key: "plane", label: "Repülős utak", matches: (tour) => tour.transport === "plane" },
    ...[...categories].map(([id, label]) => ({
      key: `category-${id}`,
      label,
      matches: (tour: PortfolioFeaturedTour) =>
        (tour.categories ?? []).some((category) => category.id === id),
    })),
    { key: "discount", label: "Akciós utak", matches: (tour) => Boolean(tour.discountBadge) },
  ];

  const shownSelections = new Set([selectionOf(ALL_OFFERS_FILTER, tours)]);

  return [
    ALL_OFFERS_FILTER,
    ...candidates.filter((filter) => {
      const selection = selectionOf(filter, tours);

      if (selection === "" || shownSelections.has(selection)) {
        return false;
      }

      shownSelections.add(selection);

      return true;
    }),
  ];
}

function selectionOf(filter: FeaturedOfferFilter, tours: PortfolioFeaturedTour[]): string {
  return tours
    .filter(filter.matches)
    .map((tour) => String(tour.id))
    .join(",");
}
