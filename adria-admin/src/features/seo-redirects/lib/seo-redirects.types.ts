export type SeoRedirectOrigin = 'legacy' | 'manual';

export type SeoRedirect = {
  id: string;
  sourcePath: string;
  target: string;
  active: boolean;
  origin: SeoRedirectOrigin;
  hits: number;
  lastHitAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SeoRedirectUpsertInput = {
  sourcePath: string;
  target: string;
  active: boolean;
};

export type SeoRedirectsListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  origin?: SeoRedirectOrigin;
};

export type SeoRedirectsListResponse = {
  items: SeoRedirect[];
  totalCount: number;
  page: number;
  perPage: number;
};
