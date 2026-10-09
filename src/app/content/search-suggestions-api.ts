import { getPortfolioApiBaseUrl, PortfolioApiError } from "./portfolio-api";

/** A destination offered while typing in the hero search, with the number of tours it finds. */
export type SearchSuggestion = {
  label: string;
  count: number;
};

/** Below this many characters the API returns no suggestions, so none are asked for. */
export const SEARCH_SUGGESTION_MIN_LENGTH = 2;

export async function fetchSearchSuggestions(query: string, signal?: AbortSignal): Promise<SearchSuggestion[]> {
  const response = await fetch(
    `${getPortfolioApiBaseUrl()}/portfolio/search-suggestions?${new URLSearchParams({ q: query })}`,
    { headers: { Accept: "application/json" }, signal },
  );

  if (!response.ok) {
    throw new PortfolioApiError(response.status, `Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { data?: SearchSuggestion[] };

  return Array.isArray(payload.data) ? payload.data : [];
}
