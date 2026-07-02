import { apiClient } from '@/lib/api-client';
import type { MediaCategory } from '@/components/media/media.constants';

export type MediaAsset = {
  id: string | number;
  url: string;
  thumbnailUrl?: string | null;
  sizes?: {
    thumbnail?: string | null;
    preview?: string | null;
    large?: string | null;
    original?: string | null;
  } | null;
  name: string;
  category?: MediaCategory | string;
  categoryLabel?: string;
  sourceContext?: string | null;
  sourceId?: string | number | null;
  alt?: string | null;
  title?: string | null;
  mimeType?: string | null;
  type?: 'image' | 'pdf' | 'document' | 'video' | 'file';
  extension?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  usage?: Array<{
    label: string;
    sourceContext?: string | null;
    sourceId?: string | number | null;
    modelType?: string | null;
    modelId?: string | number | null;
    collectionName?: string | null;
  }>;
  size: number;
  fileName?: string;
};

export type MediaListResponse = {
  items: MediaAsset[];
  totalCount: number;
  page: number;
  perPage: number;
};

export async function listMedia(query?: {
  page?: number;
  perPage?: number;
  search?: string;
  category?: MediaCategory | 'all';
  sourceContext?: string;
  sort?: 'newest' | 'oldest' | 'name';
}) {
  return apiClient.get<MediaListResponse>('/api/admin/media', { query });
}

export async function getMedia(id: string | number) {
  return apiClient.get<MediaAsset>(`/api/admin/media/${id}`);
}

export async function updateMedia(
  id: string | number,
  metadata: {
    category?: MediaCategory;
    sourceContext?: string;
    sourceId?: string | number;
    alt?: string;
    title?: string;
  },
) {
  return apiClient.patch<MediaAsset>(`/api/admin/media/${id}`, metadata);
}

export async function uploadMedia(
  file: File,
  metadata: {
    category?: MediaCategory;
    sourceContext?: string;
    sourceId?: string | number;
    alt?: string;
    title?: string;
  } = {},
) {
  const formData = new FormData();
  formData.append('file', file);

  if (metadata.category) {
    formData.append('category', metadata.category);
  }

  if (metadata.sourceContext) {
    formData.append('sourceContext', metadata.sourceContext);
  }

  if (metadata.sourceId !== undefined && metadata.sourceId !== null && metadata.sourceId !== '') {
    formData.append('sourceId', String(metadata.sourceId));
  }

  if (metadata.alt) {
    formData.append('alt', metadata.alt);
  }

  if (metadata.title) {
    formData.append('title', metadata.title);
  }

  return apiClient.post<MediaAsset>('/api/admin/media', formData);
}

export function deleteMedia(id: string | number) {
  return apiClient.delete<void>(`/api/admin/media/${id}`);
}
