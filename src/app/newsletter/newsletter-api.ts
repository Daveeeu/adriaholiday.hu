import { getPortfolioApiBaseUrl } from '../content/portfolio-api';

export type NewsletterSubscribeResponse = {
  status: 'subscribed' | 'already_subscribed';
};

export class NewsletterApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'NewsletterApiError';
    this.status = status;
  }
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResponse> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}/newsletter/subscribe`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === 'string' && body.message.trim() !== ''
        ? body.message
        : `A feliratkozás sikertelen volt (${response.status}).`;

    throw new NewsletterApiError(response.status, message);
  }

  return (await response.json()) as NewsletterSubscribeResponse;
}
