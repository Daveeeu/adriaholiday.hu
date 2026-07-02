import type { AnalyticsConsent } from "./event-catalog";

const VISITOR_STORAGE_KEY = "ah_visitor_id";
const UTM_STORAGE_KEY = "ah_first_touch_utm";
const CONSENT_STORAGE_KEY = "ah_cookie_consent";
const META_FBC_COOKIE = "_fbc";
const META_FBP_COOKIE = "_fbp";
const DEFAULT_SESSION_COOKIE = "ah_session_id";
const DEFAULT_SESSION_LIFETIME_SECONDS = 60 * 30;

type UtmPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures.
  }
}

function readCookie(name: string) {
  if (!isBrowser()) {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds = DEFAULT_SESSION_LIFETIME_SECONDS) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function uuid() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getVisitorId() {
  const existing = isBrowser() ? window.localStorage.getItem(VISITOR_STORAGE_KEY) : null;

  if (existing && existing.trim() !== "") {
    return existing;
  }

  const next = uuid();

  if (isBrowser()) {
    window.localStorage.setItem(VISITOR_STORAGE_KEY, next);
  }

  return next;
}

export function getSessionId(cookieName = DEFAULT_SESSION_COOKIE) {
  const existing = readCookie(cookieName);

  if (existing && existing.trim() !== "") {
    writeCookie(cookieName, existing);
    return existing;
  }

  const next = uuid();
  writeCookie(cookieName, next);
  return next;
}

export function captureFirstTouchUtm() {
  if (!isBrowser()) {
    return null;
  }

  const existing = readStorage<UtmPayload>(UTM_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const params = new URLSearchParams(window.location.search);
  const payload: UtmPayload = {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
  };

  if (!Object.values(payload).some(Boolean)) {
    return null;
  }

  writeStorage(UTM_STORAGE_KEY, payload);
  return payload;
}

export function getFirstTouchUtm() {
  return readStorage<UtmPayload>(UTM_STORAGE_KEY);
}

export function getStoredConsent(): AnalyticsConsent {
  const consent = readStorage<Partial<AnalyticsConsent>>(CONSENT_STORAGE_KEY);

  return {
    necessary: consent?.necessary ?? true,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  };
}

export function setStoredConsent(consent: AnalyticsConsent) {
  writeStorage(CONSENT_STORAGE_KEY, consent);
}

export function syncMetaCookies() {
  if (!isBrowser()) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");

  if (fbclid && !readCookie(META_FBC_COOKIE)) {
    writeCookie(META_FBC_COOKIE, `fb.1.${Date.now()}.${fbclid}`, 60 * 60 * 24 * 90);
  }

  if (!readCookie(META_FBP_COOKIE)) {
    writeCookie(META_FBP_COOKIE, `fb.1.${Date.now()}.${Math.floor(Math.random() * 1_000_000_000)}`, 60 * 60 * 24 * 90);
  }
}

export function getMetaCookies() {
  return {
    fbp: readCookie(META_FBP_COOKIE) ?? undefined,
    fbc: readCookie(META_FBC_COOKIE) ?? undefined,
  };
}

export function getAnalyticsSessionCookieName() {
  return import.meta.env.VITE_ANALYTICS_SESSION_COOKIE || DEFAULT_SESSION_COOKIE;
}
