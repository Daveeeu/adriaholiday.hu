import { apiClient } from '@/lib/api-client';

import type {
  HomepageOffer,
  HomepageOffersListQuery,
  HomepageOffersListResponse,
  HomepageOfferUpsertInput,
} from './homepage-offers.types';

export function getHomepageOffers(
  query?: HomepageOffersListQuery,
): Promise<HomepageOffersListResponse> {
  return apiClient.get<HomepageOffersListResponse>(
    '/api/admin/homepage-offers',
    { query },
  );
}

export async function getAllHomepageOffers(): Promise<HomepageOffer[]> {
  const response = await getHomepageOffers({ page: 1, perPage: 1000 });
  return response.items;
}

export function createHomepageOffer(values: HomepageOfferUpsertInput) {
  return apiClient.post<HomepageOffer>('/api/admin/homepage-offers', values);
}

export function updateHomepageOffer(
  id: string | number,
  values: HomepageOfferUpsertInput,
) {
  return apiClient.patch<HomepageOffer>(
    `/api/admin/homepage-offers/${id}`,
    values,
  );
}

export function deleteHomepageOffer(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/homepage-offers/${id}`);
}

export function setHomepageOfferStatus(
  id: string | number,
  active: boolean,
) {
  return apiClient.patch<HomepageOffer>(
    `/api/admin/homepage-offers/${id}/status`,
    { active },
  );
}

export function reorderHomepageOffers(orderedIds: Array<string | number>) {
  return apiClient.patch<void>('/api/admin/homepage-offers/reorder', {
    ids: orderedIds,
  });
}

