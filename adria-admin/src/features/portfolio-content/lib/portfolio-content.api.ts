import { apiClient } from '@/lib/api-client';

import type { PortfolioContentResponse } from './portfolio-content.types';

export function getPortfolioContent(page = 'home') {
  return apiClient.get<PortfolioContentResponse>('/api/admin/portfolio/content', {
    query: { page },
  });
}

export function updatePortfolioContentBlock(
  key: string,
  payload: { draftValue?: unknown; draftValueJson?: unknown },
) {
  return apiClient.patch(`/api/admin/portfolio/content/${encodeURIComponent(key)}`, payload);
}

export function publishPortfolioContentBlock(key: string) {
  return apiClient.post(`/api/admin/portfolio/content/${encodeURIComponent(key)}/publish`);
}

export function publishAllPortfolioContent(page = 'home') {
  return apiClient.post('/api/admin/portfolio/content/publish-all', { page });
}

export function uploadPortfolioContentMedia(
  key: string,
  file: File,
  metadata: { alt?: string; title?: string; category?: string; sourceContext?: string; sourceId?: string | number } = {},
) {
  const formData = new FormData();
  formData.append('file', file);

  if (metadata.alt) {
    formData.append('alt', metadata.alt);
  }

  if (metadata.title) {
    formData.append('title', metadata.title);
  }

  if (metadata.category) {
    formData.append('category', metadata.category);
  }

  if (metadata.sourceContext) {
    formData.append('sourceContext', metadata.sourceContext);
  }

  if (metadata.sourceId !== undefined && metadata.sourceId !== null && metadata.sourceId !== '') {
    formData.append('sourceId', String(metadata.sourceId));
  }

  return apiClient.post(`/api/admin/portfolio/content/${encodeURIComponent(key)}/media`, formData);
}

export function deletePortfolioContentMedia(key: string) {
  return apiClient.delete(`/api/admin/portfolio/content/${encodeURIComponent(key)}/media`);
}
