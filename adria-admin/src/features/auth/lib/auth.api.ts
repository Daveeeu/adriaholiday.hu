import { apiClient } from '@/lib/api-client';

import type { AuthLoginInput, AuthLoginResponse, AuthUser } from './auth.types';

export function login(values: AuthLoginInput) {
  return apiClient.post<AuthLoginResponse>('/api/auth/login', values);
}

export function logout() {
  return apiClient.post<{ message: string }>('/api/auth/logout');
}

export function getMe() {
  return apiClient.get<AuthUser>('/api/auth/me');
}
