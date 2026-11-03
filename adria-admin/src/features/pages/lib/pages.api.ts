import { apiClient } from '@/lib/api-client';

import type { SitePage, SitePageUpsertInput, SitePagesListQuery, SitePagesListResponse } from './pages.types';

type ResourceEnvelope<T> = { data: T };

export const sitePagesQueryKey = ['site-pages'];

export function getSitePages(query?: SitePagesListQuery) {
  return apiClient.get<SitePagesListResponse>('/api/admin/pages', { query });
}

export function createSitePage(values: SitePageUpsertInput) {
  return apiClient.post<ResourceEnvelope<SitePage>>('/api/admin/pages', values);
}

export function updateSitePage(id: string, values: SitePageUpsertInput) {
  return apiClient.patch<ResourceEnvelope<SitePage>>(`/api/admin/pages/${id}`, values);
}

export function deleteSitePage(id: string) {
  return apiClient.delete<void>(`/api/admin/pages/${id}`);
}
