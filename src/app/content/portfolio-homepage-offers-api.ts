export type PortfolioHomepageOfferImage = {
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

export type PortfolioHomepageOffer = {
  id: number | string;
  name: string;
  seoName: string;
  shortDescription?: string | null;
  link: string;
  image: PortfolioHomepageOfferImage | null;
  sortOrder: number;
  active: boolean;
};

export type PortfolioHomepageOffersResponse = {
  items: PortfolioHomepageOffer[];
};

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return '/api';
}

export async function fetchPortfolioHomepageOffers(): Promise<PortfolioHomepageOffersResponse> {
  const response = await fetch(`${getBaseUrl()}/portfolio/homepage-offers`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioHomepageOffersResponse;
}
