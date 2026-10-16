import type { ApartmentSearch } from './apartments-api';

/**
 * The location page's search as URL query parameters (Hungarian, like the
 * site's URLs), so a search can be shared and survives going back. The stay
 * (arrival, departure) is carried on to the apartment's booking form.
 */
export const SEARCH_PARAM = {
  arrival: 'erkezes',
  departure: 'tavozas',
  guests: 'fo',
  code: 'kod',
  layout: 'elrendezes',
  stars: 'csillag',
  service: 'szolgaltatas',
  page: 'oldal',
} as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ApartmentStay = {
  arrival: string;
  departure: string;
  guests: number | null;
};

export function readStay(params: URLSearchParams): ApartmentStay {
  const date = (key: string) => {
    const value = params.get(key) ?? '';

    return ISO_DATE.test(value) ? value : '';
  };
  const guests = Number(params.get(SEARCH_PARAM.guests));

  return {
    arrival: date(SEARCH_PARAM.arrival),
    departure: date(SEARCH_PARAM.departure),
    guests: Number.isInteger(guests) && guests > 0 && guests <= 30 ? guests : null,
  };
}

export function readSearch(params: URLSearchParams): ApartmentSearch {
  const page = Number(params.get(SEARCH_PARAM.page));

  return {
    code: params.get(SEARCH_PARAM.code) ?? '',
    guests: readStay(params).guests,
    layouts: params.getAll(SEARCH_PARAM.layout),
    stars: params.getAll(SEARCH_PARAM.stars).map(Number).filter((stars) => Number.isInteger(stars)),
    services: params.getAll(SEARCH_PARAM.service),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function toSearchParams(stay: ApartmentStay, search: ApartmentSearch): URLSearchParams {
  const params = new URLSearchParams();

  if (stay.arrival) params.set(SEARCH_PARAM.arrival, stay.arrival);
  if (stay.departure) params.set(SEARCH_PARAM.departure, stay.departure);
  if (stay.guests) params.set(SEARCH_PARAM.guests, String(stay.guests));
  if (search.code?.trim()) params.set(SEARCH_PARAM.code, search.code.trim());
  search.layouts?.forEach((layout) => params.append(SEARCH_PARAM.layout, layout));
  search.stars?.forEach((stars) => params.append(SEARCH_PARAM.stars, String(stars)));
  search.services?.forEach((service) => params.append(SEARCH_PARAM.service, service));
  if (search.page && search.page > 1) params.set(SEARCH_PARAM.page, String(search.page));

  return params;
}

/** The apartment's page with the stay searched for, so its booking form starts with it. */
export function apartmentLink(link: string, stay: ApartmentStay): string {
  const params = toSearchParams(stay, {});
  const query = params.toString();

  return query ? `${link}?${query}` : link;
}
