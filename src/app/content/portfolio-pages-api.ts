import { getPortfolioApiBaseUrl } from './portfolio-api';

/** A free text page the office publishes at its own address ("/autobuszaink"). */
export type PortfolioPage = {
  title: string;
  slug: string;
  /** Sanitized HTML. */
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string | null;
};

/** The published page at the address, or null when there is none. */
export async function fetchPortfolioPage(slug: string): Promise<PortfolioPage | null> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}/portfolio/pages/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioPage;
}
