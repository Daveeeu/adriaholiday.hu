import { getPortfolioApiBaseUrl } from './portfolio-api';

export type PortfolioFeaturedTourImage = {
  id?: number | null;
  url: string;
  thumbnailUrl?: string | null;
  sizes?: {
    thumbnail?: string | null;
    preview?: string | null;
    large?: string | null;
    original?: string | null;
  } | null;
  name?: string | null;
  fileName?: string | null;
  size?: number | null;
};

export type PortfolioFeaturedTour = {
  id: number | string;
  name: string;
  seoName: string;
  shortDescription: string;
  listDescription: string;
  price: number | null;
  displayedPrice: string | null;
  image: PortfolioFeaturedTourImage | null;
  duration: string | null;
  departureDate: string | null;
  departureDateLabel?: string | null;
  departureDateCount?: number | null;
  link: string;
  badge?: string | null;
  transport?: 'bus' | 'plane' | string | null;
  programTypeLabel?: string | null;
  accommodation?: string | null;
  meals?: string | null;
  seatsLeft?: number | null;
  additionalDates?: boolean;
  country?: string | null;
  categories?: Array<{ id: string; label: string }>;
  discountBadge?: string | null;
};

export type PortfolioFeaturedToursResponse = {
  items: PortfolioFeaturedTour[];
};

/**
 * The offers most like the trip being viewed and, when given, the visitor's
 * earlier views (most recent first), as offer cards.
 */
export async function fetchPortfolioRelatedTours(
  slug: string,
  viewedSlugs: string[] = [],
): Promise<PortfolioFeaturedToursResponse> {
  const query = viewedSlugs.length > 0 ? `?viewed=${encodeURIComponent(viewedSlugs.join(','))}` : '';
  const response = await fetch(`${getPortfolioApiBaseUrl()}/portfolio/offers/${encodeURIComponent(slug)}/related${query}`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioFeaturedToursResponse;
}

export async function fetchPortfolioFeaturedTours(
  limit = 6,
): Promise<PortfolioFeaturedToursResponse> {
  const response = await fetch(
    `${getPortfolioApiBaseUrl()}/portfolio/featured-tours?limit=${encodeURIComponent(limit)}`,
    {
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioFeaturedToursResponse;
}
