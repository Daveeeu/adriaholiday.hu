import { apiClient } from '@/lib/api-client';

import type {
  TourDeparturePlace,
  TourDeparturePlaceFormValues,
  TourDeparturePlaceListQuery,
  TourDeparturePlaceListResponse,
  TourDetail,
  TourFormValues,
  TourListQuery,
  TourListResponse,
  TourRegionGroup,
  TourRegionGroupFormValues,
  TourRegionGroupListQuery,
  TourRegionGroupListResponse,
  TourSeasonalGroup,
  TourSeasonalGroupFormValues,
  TourSeasonalGroupListQuery,
  TourSeasonalGroupListResponse,
  Tour,
  TourWordImportResponse,
} from './tours.types';
import { normalizeTourFormValues } from './tours.types';

type ResourceEnvelope<T> = {
  data: T;
};

function unwrapResource<T>(response: T | ResourceEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ResourceEnvelope<T>).data;
  }

  return response as T;
}

export async function getTours(
  query: TourListQuery,
): Promise<TourListResponse> {
  return apiClient.get<TourListResponse>('/api/admin/tours', {
    query,
  });
}

export async function getTourById(id: string): Promise<TourDetail> {
  const response = await apiClient.get<Tour | ResourceEnvelope<Tour>>(
    `/api/admin/tours/${id}`,
  );
  return unwrapResource(response);
}

export async function getAllTourOffers(): Promise<Tour[]> {
  const response = await getTours({
    page: 1,
    perPage: 1000,
    search: '',
    sortBy: 'sortOrder',
    sortDirection: 'asc',
  });
  return response.items;
}

export function createTour(values: TourFormValues) {
  return apiClient.post<Tour | ResourceEnvelope<Tour>>('/api/admin/tours', normalizeTourFormValues(values)).then(unwrapResource);
}

export function parseWordTourImport(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files[]', file));

  return apiClient.post<TourWordImportResponse>('/api/admin/tours/import/word/parse', formData);
}

export function updateTour(id: string, values: TourFormValues) {
  return apiClient
    .patch<Tour | ResourceEnvelope<Tour>>(
      `/api/admin/tours/${id}`,
      normalizeTourFormValues(values),
    )
    .then(unwrapResource);
}

export function deleteTour(id: string) {
  return apiClient.delete<{ id: string }>(`/api/admin/tours/${id}`);
}

export function setTourActive(id: string, active: boolean) {
  return apiClient
    .patch<Tour | ResourceEnvelope<Tour>>(`/api/admin/tours/${id}/status`, { active })
    .then(unwrapResource);
}

export function reorderTourOffers(orderedIds: string[]) {
  return apiClient.patch<void>('/api/admin/tours/reorder', {
    ids: orderedIds,
  });
}

export function duplicateTourOffer(id: string) {
  return apiClient
    .post<Tour | ResourceEnvelope<Tour>>(`/api/admin/tours/${id}/duplicate`)
    .then(unwrapResource);
}

export function moveTourOffer(id: string, direction: 'up' | 'down') {
  return apiClient
    .post<Tour | ResourceEnvelope<Tour>>(`/api/admin/tours/${id}/move`, { direction })
    .then(unwrapResource);
}

export async function getTourRegionGroups(
  query: TourRegionGroupListQuery,
): Promise<TourRegionGroupListResponse> {
  return apiClient.get<TourRegionGroupListResponse>(
    '/api/admin/tour-region-groups',
    { query },
  );
}

export function createTourRegionGroup(values: TourRegionGroupFormValues) {
  return apiClient.post<TourRegionGroup>('/api/admin/tour-region-groups', values);
}

export function updateTourRegionGroup(
  id: string,
  values: TourRegionGroupFormValues,
) {
  return apiClient.patch<TourRegionGroup>(
    `/api/admin/tour-region-groups/${id}`,
    values,
  );
}

export function deleteTourRegionGroup(id: string) {
  return apiClient.delete<{ id: string }>(`/api/admin/tour-region-groups/${id}`);
}

export function setTourRegionGroupActive(id: string, active: boolean) {
  return apiClient.patch<TourRegionGroup>(
    `/api/admin/tour-region-groups/${id}/status`,
    { active },
  );
}

export async function getTourSeasonalGroups(
  query: TourSeasonalGroupListQuery,
): Promise<TourSeasonalGroupListResponse> {
  return apiClient.get<TourSeasonalGroupListResponse>(
    '/api/admin/tour-seasonal-groups',
    { query },
  );
}

export function createTourSeasonalGroup(values: TourSeasonalGroupFormValues) {
  return apiClient.post<TourSeasonalGroup>(
    '/api/admin/tour-seasonal-groups',
    values,
  );
}

export function updateTourSeasonalGroup(
  id: string,
  values: TourSeasonalGroupFormValues,
) {
  return apiClient.patch<TourSeasonalGroup>(
    `/api/admin/tour-seasonal-groups/${id}`,
    values,
  );
}

export function deleteTourSeasonalGroup(id: string) {
  return apiClient.delete<{ id: string }>(`/api/admin/tour-seasonal-groups/${id}`);
}

export function setTourSeasonalGroupActive(id: string, active: boolean) {
  return apiClient.patch<TourSeasonalGroup>(
    `/api/admin/tour-seasonal-groups/${id}/status`,
    { active },
  );
}

export async function getTourDeparturePlaces(
  query: TourDeparturePlaceListQuery,
): Promise<TourDeparturePlaceListResponse> {
  return apiClient.get<TourDeparturePlaceListResponse>(
    '/api/admin/tour-departure-places',
    { query },
  );
}

export function createTourDeparturePlace(
  values: TourDeparturePlaceFormValues,
) {
  return apiClient.post<TourDeparturePlace>(
    '/api/admin/tour-departure-places',
    values,
  );
}

export function updateTourDeparturePlace(
  id: string,
  values: TourDeparturePlaceFormValues,
) {
  return apiClient.patch<TourDeparturePlace>(
    `/api/admin/tour-departure-places/${id}`,
    values,
  );
}

export function deleteTourDeparturePlace(id: string) {
  return apiClient.delete<{ id: string }>(`/api/admin/tour-departure-places/${id}`);
}

export function setTourDeparturePlaceActive(id: string, active: boolean) {
  return apiClient.patch<TourDeparturePlace>(
    `/api/admin/tour-departure-places/${id}/status`,
    { active },
  );
}
