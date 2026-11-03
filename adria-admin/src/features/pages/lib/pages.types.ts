export type PageKind = 'page' | 'text_block';

export type SitePage = {
  id: string;
  kind: PageKind;
  title: string;
  slug: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoRobots: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SitePageUpsertInput = {
  kind: PageKind;
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  active: boolean;
};

export type SitePagesListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  kind?: PageKind;
};

export type SitePagesListResponse = {
  items: SitePage[];
  totalCount: number;
  page: number;
  perPage: number;
};
