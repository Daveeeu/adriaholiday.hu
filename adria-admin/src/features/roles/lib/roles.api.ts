import { apiClient } from '@/lib/api-client';

import type { Role, RoleListQuery, RoleListResponse, RoleUpsertInput } from './roles.types';

type ResourceEnvelope<T> = {
  data: T;
};

function unwrapResource<T>(response: T | ResourceEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ResourceEnvelope<T>).data;
  }

  return response as T;
}

export async function getRoles(query: RoleListQuery): Promise<RoleListResponse> {
  return apiClient.get<RoleListResponse>('/api/admin/roles', { query });
}

export async function getAllRoles(): Promise<Role[]> {
  const response = await getRoles({ page: 1, perPage: 100, search: '' });
  return response.items;
}

export function createRole(values: RoleUpsertInput) {
  return apiClient
    .post<Role | ResourceEnvelope<Role>>('/api/admin/roles', values)
    .then(unwrapResource);
}

export function updateRole(id: string | number, values: RoleUpsertInput) {
  return apiClient
    .put<Role | ResourceEnvelope<Role>>(`/api/admin/roles/${id}`, values)
    .then(unwrapResource);
}

export function deleteRole(id: string | number) {
  return apiClient.delete<void>(`/api/admin/roles/${id}`);
}
