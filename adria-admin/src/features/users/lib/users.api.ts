import { apiClient } from '@/lib/api-client';

import type { AdminUser, UserListQuery, UserListResponse, UserUpsertInput } from './users.types';

type ResourceEnvelope<T> = {
  data: T;
};

function unwrapResource<T>(response: T | ResourceEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ResourceEnvelope<T>).data;
  }

  return response as T;
}

function toRequestBody(values: UserUpsertInput) {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    password_confirmation: values.passwordConfirmation,
    isActive: values.isActive,
    roles: values.roles,
    permissions: values.permissions,
    deniedPermissions: values.deniedPermissions,
  };
}

export async function getUsers(query: UserListQuery): Promise<UserListResponse> {
  return apiClient.get<UserListResponse>('/api/admin/users', { query });
}

export function createUser(values: UserUpsertInput) {
  return apiClient
    .post<AdminUser | ResourceEnvelope<AdminUser>>('/api/admin/users', toRequestBody(values))
    .then(unwrapResource);
}

export function updateUser(id: string | number, values: UserUpsertInput) {
  return apiClient
    .put<AdminUser | ResourceEnvelope<AdminUser>>(`/api/admin/users/${id}`, toRequestBody(values))
    .then(unwrapResource);
}

export function deactivateUser(id: string | number) {
  return apiClient.delete<void>(`/api/admin/users/${id}`);
}

export function setUserActiveState(id: string | number, isActive: boolean) {
  return apiClient
    .patch<AdminUser | ResourceEnvelope<AdminUser>>(`/api/admin/users/${id}/status`, { isActive })
    .then(unwrapResource);
}
