import { create } from 'zustand';

import { queryClient } from '@/app/providers/query-client';
import { ApiError } from '@/lib/api-client';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setAuthEventHandlers,
  setStoredAuthToken,
} from '@/lib/auth-session';
import { getMe, login, logout } from '@/features/auth/lib/auth.api';
import type { AuthLoginInput, AuthUser } from '@/features/auth/lib/auth.types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  lastError: string | null;
  bootstrap: () => Promise<void>;
  signIn: (values: AuthLoginInput) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string | string[]) => boolean;
  onUnauthorized: () => void;
  onForbidden: () => void;
};

function hasAnyPermission(user: AuthUser | null, permission: string | string[]) {
  if (!user) {
    return false;
  }

  const permissions = new Set(user.permissions);
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  return requiredPermissions.some((requiredPermission) => permissions.has(requiredPermission));
}

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: 'idle',
  lastError: null,
  async bootstrap() {
    const token = getStoredAuthToken();

    if (!token) {
      set({ user: null, status: 'unauthenticated', lastError: null });
      return;
    }

    set({ status: 'loading', lastError: null });

    try {
      const currentUser = await getMe();
      set({ user: currentUser, status: 'authenticated', lastError: null });
    } catch (error) {
      clearStoredAuthToken();
      queryClient.clear();

      if (error instanceof ApiError) {
        set({ user: null, status: 'unauthenticated', lastError: error.message });
        return;
      }

      set({ user: null, status: 'unauthenticated', lastError: 'auth.bootstrapFailed' });
    }
  },
  async signIn(values) {
    set({ status: 'loading', lastError: null });

    try {
      const response = await login(values);
      setStoredAuthToken(response.token);
      set({ user: response.user, status: 'authenticated', lastError: null });
      queryClient.clear();
      return response.user;
    } catch (error) {
      clearStoredAuthToken();
      set({
        user: null,
        status: 'unauthenticated',
        lastError: error instanceof ApiError ? error.message : 'auth.signInFailed',
      });
      throw error;
    }
  },
  async signOut() {
    try {
      await logout();
    } catch {
      // Ignore logout transport errors. The local session is still cleared below.
    } finally {
      clearStoredAuthToken();
      queryClient.clear();
      set({ user: null, status: 'unauthenticated', lastError: null });
    }
  },
  hasPermission(permission) {
    return hasAnyPermission(get().user, permission);
  },
  onUnauthorized() {
    clearStoredAuthToken();
    queryClient.clear();
    set({ user: null, status: 'unauthenticated', lastError: null });
  },
  onForbidden() {
    set({ lastError: 'auth.forbidden' });
  },
}));

setAuthEventHandlers({
  onUnauthorized: () => {
    useAuthStore.getState().onUnauthorized();
  },
  onForbidden: () => {
    useAuthStore.getState().onForbidden();
  },
});

export { useAuthStore };
