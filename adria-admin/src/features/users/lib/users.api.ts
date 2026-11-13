import { apiClient } from '@/lib/api-client';

import type { AdminUser, CreatedUser, UserListQuery, UserListResponse, UserUpsertInput } from './users.types';

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

export async function createUser(values: UserUpsertInput): Promise<CreatedUser> {
  const response = await apiClient.post<ResourceEnvelope<AdminUser> & { meta?: { invitationSent?: boolean } }>(
    '/api/admin/users',
    toRequestBody(values),
  );

  return { user: response.data, invitationSent: response.meta?.invitationSent ?? false };
}

/** Emails the user a new link to set their password. */
export function sendUserInvitation(id: string | number) {
  return apiClient.post<{ message: string }>(`/api/admin/users/${id}/invitation`);
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
