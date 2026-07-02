import { getPortfolioApiBaseUrl, PortfolioApiError } from './portfolio-api';

export type PortfolioMedia = {
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
  mimeType?: string | null;
  alt?: string | null;
  title?: string | null;
};

export type PortfolioOfferDetailDate = {
  id: number | string;
  tourId?: number | string;
  startDate?: string | null;
  endDate?: string | null;
  price?: number | null;
  displayedPrice?: string | null;
  priceBox?: PortfolioPriceBox | null;
  status?: string | null;
};

export type PortfolioPriceBox = {
  price?: number | null;
  displayedPrice?: string | null;
  currency?: string | null;
  priceSuffix?: string | null;
  discountBadge?: string | null;
  discountText?: string | null;
  urgencyText?: string | null;
  ratingText?: string | null;
  minParticipants?: number | null;
  maxParticipants?: number | null;
  availableSeats?: number | null;
  capacity?: number | null;
  ctaPrimaryLabel?: string | null;
  ctaSecondaryLabel?: string | null;
};

export type PortfolioOfferProgramDay = {
  id: number | string;
  tourId?: number | string;
  sortOrder: number;
  dayNumber: number;
  title: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  experienceType?: string | null;
  badges: string[];
  active: boolean;
};

export type PortfolioOfferGalleryItem = {
  id: number | string;
  tourId?: number | string;
  mediaId?: number | string | null;
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  sortOrder: number;
  active: boolean;
  image?: PortfolioMedia | null;
};

export type PortfolioOfferDetail = {
  id: number | string;
  name: string;
  seoName: string;
  shortDescription: string;
  listDescription: string;
  programBefore?: string | null;
  program?: string | null;
  inclusions?: string | null;
  paymentProgram?: string | null;
  prices?: string | null;
  discounts?: string | null;
  notes?: string | null;
  programDays?: PortfolioOfferProgramDay[];
  galleryTitle?: string | null;
  gallerySubtitle?: string | null;
  gallery?: PortfolioOfferGalleryItem[];
  priceInformation?: {
    included: Array<{
      id: string;
      text: string;
    }>;
    excluded: Array<{
      id: string;
      text: string;
    }>;
  } | null;
  priceBox?: PortfolioPriceBox | null;
  price: number | null;
  displayedPrice: string | null;
  image: PortfolioMedia | null;
  sliderImage: PortfolioMedia | null;
  region?: {
    id: number | string;
    slug: string;
    name: string;
  } | null;
  dates: PortfolioOfferDetailDate[];
  departurePlaces: Array<{
    id: number | string;
    active: boolean;
    name: string;
    city: string;
    fee?: number | null;
  }>;
  partnerBonuses: Array<{
    id: number | string;
    sortOrder: number;
    label: string;
    value?: string | null;
  }>;
  tags: Array<Record<string, unknown>>;
  categories: Array<Record<string, unknown>>;
  badge?: string | null;
  transport?: string | null;
  accommodation?: string | null;
  meals?: string | null;
  country?: string | null;
  duration?: string | null;
  seatsLeft?: number | null;
  additionalDates?: boolean;
  departureDate?: string | null;
  departureDateLabel?: string | null;
  link?: string | null;
};

type PortfolioOfferDetailResponse = PortfolioOfferDetail;

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

export async function fetchPortfolioOfferDetail(
  slug: string,
): Promise<PortfolioOfferDetailResponse> {
  return request<PortfolioOfferDetailResponse>(
    `/portfolio/offers/${encodeURIComponent(slug)}`,
  );
}
