import { apiClient } from '@/lib/api-client';

import type {
  Bus,
  BusUpsertInput,
  BusesListQuery,
  BusesListResponse,
} from './buses.types';

export function getBuses(query?: BusesListQuery): Promise<BusesListResponse> {
  return apiClient.get<BusesListResponse>('/api/admin/buses', { query });
}

export async function getAllBuses(): Promise<Bus[]> {
  const response = await getBuses({ page: 1, perPage: 1000 });
  return response.items;
}

export function createBus(values: BusUpsertInput) {
  return apiClient.post<Bus>('/api/admin/buses', values);
}

export function updateBus(id: string | number, values: BusUpsertInput) {
  return apiClient.patch<Bus>(`/api/admin/buses/${id}`, values);
}

export function deleteBus(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/buses/${id}`);
}

export function setBusStatus(id: string | number, active: boolean) {
  return apiClient.patch<Bus>(`/api/admin/buses/${id}/status`, { active });
}

