export type PortfolioRegionCard = {
  slug: string;
  name: string;
  image: string | null;
  description: string | null;
  apartmentCount: number;
  portfolioFeatured: boolean;
  portfolioSortOrder: number;
};

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return '/api';
}

export async function fetchFeaturedPortfolioRegions(): Promise<PortfolioRegionCard[]> {
  const response = await fetch(`${getBaseUrl()}/portfolio/regions`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioRegionCard[];
}
