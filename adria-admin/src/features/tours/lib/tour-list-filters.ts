/** The offers list's filters; 'all' does not filter. */
export type TourBooleanFilter = 'all' | 'true' | 'false';

export type TourListFilters = {
  regionId: string;
  active: TourBooleanFilter;
  featured: TourBooleanFilter;
  xmlEnabled: TourBooleanFilter;
};

export const DEFAULT_TOUR_LIST_FILTERS: TourListFilters = {
  regionId: 'all',
  active: 'all',
  featured: 'all',
  xmlEnabled: 'all',
};
