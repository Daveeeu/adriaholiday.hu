import { getPortfolioApiBaseUrl } from './portfolio-api';

/** A guest's letter about the agency ("Rólunk írták"). */
export type PortfolioTestimonial = {
  id: number;
  title: string;
  author: string | null;
  excerpt: string;
  /** Sanitized HTML of the whole letter. */
  body: string;
  publishedAt: string;
};

export type PortfolioTestimonialsResponse = {
  items: PortfolioTestimonial[];
  totalCount: number;
  page: number;
  perPage: number;
};

/** Published letters, newest first. */
export async function fetchPortfolioTestimonials(page = 1, perPage = 12): Promise<PortfolioTestimonialsResponse> {
  const response = await fetch(
    `${getPortfolioApiBaseUrl()}/portfolio/testimonials?page=${encodeURIComponent(page)}&perPage=${encodeURIComponent(perPage)}`,
    {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as PortfolioTestimonialsResponse;
}

export function testimonialAnchor(id: number): string {
  return `level-${id}`;
}

/** Monogram of the letter's signature ("B Istvánné" → "BI"), shown instead of a photo. */
export function testimonialInitials(author: string | null): string {
  const initials = (author ?? '')
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '“';
}

export function formatTestimonialDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });
}
