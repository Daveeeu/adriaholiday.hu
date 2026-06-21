const TOKEN_KEYS = ['admin_api_token', 'access_token', 'token'] as const;
const AUTH_UNAUTHORIZED_EVENT = 'admin:auth-unauthorized';
const AUTH_FORBIDDEN_EVENT = 'admin:auth-forbidden';

type AuthEventHandlers = {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
};

let authEventHandlers: AuthEventHandlers = {};

export function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
}

export function setStoredAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('admin_api_token', token);
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  for (const key of TOKEN_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export function setAuthEventHandlers(handlers: AuthEventHandlers) {
  authEventHandlers = handlers;
}

export function notifyUnauthorized() {
  clearStoredAuthToken();
  authEventHandlers.onUnauthorized?.();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }
}

export function notifyForbidden() {
  authEventHandlers.onForbidden?.();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_FORBIDDEN_EVENT));
  }
}

export function onAuthUnauthorized(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, callback);
  return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, callback);
}

export function onAuthForbidden(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(AUTH_FORBIDDEN_EVENT, callback);
  return () => window.removeEventListener(AUTH_FORBIDDEN_EVENT, callback);
}
