import { getPortfolioApiBaseUrl, PortfolioApiError } from './portfolio-api';
import type { PortfolioFeaturedTour } from './portfolio-featured-tours-api';
import type { OfferSearchApiParams } from './offer-search';

export type PortfolioOfferCard = PortfolioFeaturedTour;

export type PortfolioOffersResponse = {
  items: PortfolioOfferCard[];
  totalCount: number;
  page: number;
  perPage: number;
  recommended?: PortfolioOfferCard[];
};

export type PortfolioCategoryFilterChip = {
  label: string;
  slug: string;
  icon: string | null;
  type: string;
  value: string | null;
  count: number;
  disabled: boolean;
  active?: boolean;
};

export type PortfolioCategoryCountryOption = {
  code: string;
  label: string;
  count: number;
  disabled: boolean;
  active?: boolean;
};

export type PortfolioOfferListParams = OfferSearchApiParams & {
  page?: number;
  perPage?: number;
  region?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  order?: string;
  country?: string;
  transport?: string;
  filters?: string;
};

type PortfolioFacetParams = OfferSearchApiParams & Pick<PortfolioOfferListParams, 'filters' | 'country'>;

function buildQuery(params: PortfolioOfferListParams = {}) {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.perPage !== undefined) query.set('perPage', String(params.perPage));
  if (params.region) query.set('region', params.region);
  if (params.category) query.set('category', params.category);
  if (params.tag) query.set('tag', params.tag);
  if (params.featured !== undefined) query.set('featured', params.featured ? '1' : '0');
  if (params.search) query.set('search', params.search);
  if (params.order) query.set('order', params.order);
  if (params.country) query.set('country', params.country);
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.departure) query.set('departure', params.departure);
  if (params.from) query.set('from', params.from);
  if (params.duration) query.set('duration', params.duration);
  if (params.transport) query.set('transport', params.transport);
  if (params.filters) query.set('filters', params.filters);

  const value = query.toString();
  return value ? `?${value}` : '';
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      if (typeof payload?.message === 'string' && payload.message.trim() !== '') {
        message = payload.message;
      }
    } catch {
      // Ignore invalid JSON error payloads.
    }

    throw new PortfolioApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export async function fetchPortfolioOffers(
  params: PortfolioOfferListParams = {},
): Promise<PortfolioOffersResponse> {
  return request<PortfolioOffersResponse>(`/portfolio/offers${buildQuery(params)}`);
}

export async function fetchPortfolioCategoryOffers(
  slug: string,
  params: PortfolioOfferListParams = {},
): Promise<PortfolioOffersResponse> {
  return request<PortfolioOffersResponse>(
    `/portfolio/categories/${encodeURIComponent(slug)}/offers${buildQuery(params)}`,
  );
}

export async function fetchPortfolioOfferFilters(
  params: Omit<PortfolioFacetParams, 'country'> = {},
): Promise<PortfolioCategoryFilterChip[]> {
  return request<PortfolioCategoryFilterChip[]>(`/portfolio/offers/filters${buildQuery(params)}`);
}

export async function fetchPortfolioOfferCountries(
  params: PortfolioFacetParams = {},
): Promise<PortfolioCategoryCountryOption[]> {
  return request<PortfolioCategoryCountryOption[]>(`/portfolio/offers/countries${buildQuery(params)}`);
}

export async function fetchPortfolioCategoryFilters(
  slug: string,
  params: Omit<PortfolioFacetParams, 'country'> = {},
): Promise<PortfolioCategoryFilterChip[]> {
  return request<PortfolioCategoryFilterChip[]>(
    `/portfolio/categories/${encodeURIComponent(slug)}/filters${buildQuery(params)}`,
  );
}

export async function fetchPortfolioCategoryCountries(
  slug: string,
  params: PortfolioFacetParams = {},
): Promise<PortfolioCategoryCountryOption[]> {
  return request<PortfolioCategoryCountryOption[]>(
    `/portfolio/categories/${encodeURIComponent(slug)}/countries${buildQuery(params)}`,
  );
}

export async function fetchPortfolioRegionOffers(
  slug: string,
  params: PortfolioOfferListParams = {},
): Promise<PortfolioOffersResponse> {
  return request<PortfolioOffersResponse>(
    `/portfolio/regions/${encodeURIComponent(slug)}/offers${buildQuery(params)}`,
  );
}
