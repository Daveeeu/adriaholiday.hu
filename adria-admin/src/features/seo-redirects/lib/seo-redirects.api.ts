import { apiClient } from '@/lib/api-client';

import type {
  SeoRedirect,
  SeoRedirectUpsertInput,
  SeoRedirectsListQuery,
  SeoRedirectsListResponse,
} from './seo-redirects.types';

type ResourceEnvelope<T> = { data: T };

export const seoRedirectsQueryKey = ['seo-redirects'];

export function getSeoRedirects(query?: SeoRedirectsListQuery) {
  return apiClient.get<SeoRedirectsListResponse>('/api/admin/seo-redirects', { query });
}

export function createSeoRedirect(values: SeoRedirectUpsertInput) {
  return apiClient.post<ResourceEnvelope<SeoRedirect>>('/api/admin/seo-redirects', values);
}

export function updateSeoRedirect(id: string, values: SeoRedirectUpsertInput) {
  return apiClient.patch<ResourceEnvelope<SeoRedirect>>(`/api/admin/seo-redirects/${id}`, values);
}

export function deleteSeoRedirect(id: string) {
  return apiClient.delete<void>(`/api/admin/seo-redirects/${id}`);
}
