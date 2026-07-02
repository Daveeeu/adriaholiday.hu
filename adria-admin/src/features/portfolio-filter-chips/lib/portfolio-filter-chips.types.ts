export type PortfolioFilterChip = {
  id: string | number;
  scopeType: 'global' | 'category' | 'homepage_offer';
  scopeValue: string | null;
  label: string;
  slug: string;
  icon: string | null;
  filterType: 'tag' | 'category' | 'travel_mode' | 'country' | 'price' | 'theme' | 'custom';
  filterValue: string | null;
  filterConfig: Record<string, unknown> | null;
  sortOrder: number;
  active: boolean;
  hideWhenZero: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PortfolioFilterChipListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type PortfolioFilterChipListResponse = {
  items: PortfolioFilterChip[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type PortfolioFilterChipUpsertInput = {
  scopeType: PortfolioFilterChip['scopeType'];
  scopeValue: string | null;
  label: string;
  slug: string;
  icon: string | null;
  filterType: PortfolioFilterChip['filterType'];
  filterValue: string | null;
  filterConfig: Record<string, unknown> | null;
  sortOrder: number;
  active: boolean;
  hideWhenZero: boolean;
};
