export function getPortfolioApiBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return '/api';
}

export class PortfolioApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'PortfolioApiError';
    this.status = status;
  }
}

