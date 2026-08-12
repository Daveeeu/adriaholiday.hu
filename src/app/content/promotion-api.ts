export type PortfolioPromotion = {
  id: number | string;
  title: string;
  message: string;
  code: string | null;
};

export type PortfolioPromotionResponse = {
  promotion: PortfolioPromotion | null;
};

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return '/api';
}

export async function fetchActivePromotion(): Promise<PortfolioPromotionResponse> {
  const response = await fetch(`${getBaseUrl()}/portfolio/promotion`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioPromotionResponse;
}
