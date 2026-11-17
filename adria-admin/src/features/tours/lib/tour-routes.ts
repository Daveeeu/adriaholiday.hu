/** The tour offers list. */
export const TOURS_LIST_PATH = '/tours';

/** The full-page editor of a new tour. */
export const TOUR_CREATE_PATH = '/tours/new';

/** The full-page editor of a saved tour. */
export function tourEditPath(tourId: string | number): string {
  return `/tours/${tourId}/edit`;
}

/** Every tour query: the list pages and each tour's detail. */
export const TOURS_QUERY_KEY = ['tours'] as const;

/** One tour as the editor and the detail panel load it. */
export function tourDetailQueryKey(tourId: string | number) {
  return [...TOURS_QUERY_KEY, 'detail', String(tourId)] as const;
}
