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


/**
 * A JSON resource of the portfolio API; a failed request throws a
 * PortfolioApiError with the API's message when it gives one.
 */
export async function fetchPortfolioJson<T>(path: string): Promise<T> {
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
