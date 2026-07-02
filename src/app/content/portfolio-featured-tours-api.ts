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
};

export type PortfolioFeaturedToursResponse = {
  items: PortfolioFeaturedTour[];
};

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
