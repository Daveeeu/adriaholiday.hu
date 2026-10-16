import { fetchPortfolioJson } from '../content/portfolio-api';
import type { PortfolioMedia, PortfolioOfferGalleryItem } from '../content/portfolio-offer-detail-api';

export type ApartmentService = {
  key: string;
  label: string;
};

export type ApartmentLocationFilters = {
  layouts: Array<{ value: string; label: string }>;
  services: ApartmentService[];
  stars: number[];
};

/** A location's apartment page (/apartmanok/{area}/{location}). */
export type ApartmentLocation = {
  slug: string;
  name: string;
  areaSlug: string;
  areaName: string | null;
  regionName: string | null;
  link: string;
  /** Shown above the apartment list. */
  description: string | null;
  /** The location guide, shown under the apartment list. */
  guide: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  robots: string | null;
  filters: ApartmentLocationFilters;
};

export type ApartmentCard = {
  id: number;
  slug: string;
  link: string;
  name: string;
  code: string | null;
  stars: number;
  address: string | null;
  shortDescription: string | null;
  distanceToCenterM: number | null;
  distanceToSeaM: number | null;
  maxGuests: number | null;
  apartmentTypes: string[];
  /** The lowest price per night of the periods still to come, in euros. */
  lowestPrice: number | null;
  currency: string;
  services: ApartmentService[];
  image: PortfolioMedia | null;
};

export type ApartmentList = {
  items: ApartmentCard[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type ApartmentSearch = {
  code?: string;
  guests?: number | null;
  layouts?: string[];
  stars?: number[];
  services?: string[];
  page?: number;
};

export type ApartmentPriceRow = {
  category: string;
  beds: string;
  maxGuests: number | null;
  /** Per night, in the periods' order; null where there is no price. */
  prices: Array<number | null>;
};

export type ApartmentInsurance = {
  name: string;
  info: string | null;
};

export type ApartmentDetail = Omit<ApartmentCard, 'image' | 'lowestPrice' | 'shortDescription'> & {
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  apartmentTypeContent: string | null;
  additionalInformation: string | null;
  allInclusiveDescription: string | null;
  gallery: PortfolioOfferGalleryItem[];
  prices: {
    header: string | null;
    innerHeader: string | null;
    currency: string;
    periods: Array<{ startDate: string; endDate: string }>;
    rows: ApartmentPriceRow[];
  };
  location: {
    slug: string;
    name: string;
    areaSlug: string | null;
    areaName: string | null;
    regionName: string | null;
    link: string | null;
    apartmentInformation: string | null;
  } | null;
  seoTitle: string | null;
  seoDescription: string | null;
  robots: string | null;
  bookingInsurances: {
    travelInsurance?: ApartmentInsurance | null;
    cancellationInsurance?: ApartmentInsurance | null;
  } | null;
};

function locationPath(area: string, location: string) {
  return `/portfolio/apartment-locations/${encodeURIComponent(area)}/${encodeURIComponent(location)}`;
}

export function fetchApartmentLocation(area: string, location: string): Promise<ApartmentLocation> {
  return fetchPortfolioJson<ApartmentLocation>(locationPath(area, location));
}

export function fetchApartments(area: string, location: string, search: ApartmentSearch): Promise<ApartmentList> {
  const query = new URLSearchParams();

  if (search.code?.trim()) {
    query.set('code', search.code.trim());
  }

  if (search.guests) {
    query.set('guests', String(search.guests));
  }

  search.layouts?.forEach((layout) => query.append('layouts[]', layout));
  search.stars?.forEach((stars) => query.append('stars[]', String(stars)));
  search.services?.forEach((service) => query.append('services[]', service));

  if (search.page && search.page > 1) {
    query.set('page', String(search.page));
  }

  const queryString = query.toString();

  return fetchPortfolioJson<ApartmentList>(`${locationPath(area, location)}/apartments${queryString ? `?${queryString}` : ''}`);
}

export function fetchApartment(slug: string): Promise<ApartmentDetail> {
  return fetchPortfolioJson<ApartmentDetail>(`/portfolio/apartments/${encodeURIComponent(slug)}`);
}

/** The home page's apartment section: locations with an apartment page and apartments to show off. */
export type ApartmentHighlights = {
  locations: Array<{
    name: string;
    areaName: string | null;
    regionName: string | null;
    link: string;
    apartmentCount: number;
  }>;
  apartments: ApartmentCard[];
};

export function fetchApartmentHighlights(): Promise<ApartmentHighlights> {
  return fetchPortfolioJson<ApartmentHighlights>('/portfolio/apartment-highlights');
}
