import { apiClient } from '@/lib/api-client';

import type { AcceptInvitationInput, AuthLoginInput, AuthLoginResponse, AuthUser } from './auth.types';

export function login(values: AuthLoginInput) {
  return apiClient.post<AuthLoginResponse>('/api/auth/login', values);
}

export function logout() {
  return apiClient.post<{ message: string }>('/api/auth/logout');
}

export function getMe() {
  return apiClient.get<AuthUser>('/api/auth/me');
}

export function acceptInvitation(values: AcceptInvitationInput) {
  return apiClient.post<{ message: string }>('/api/auth/invitation/accept', {
    email: values.email,
    token: values.token,
    password: values.password,
    password_confirmation: values.passwordConfirmation,
  });
}
