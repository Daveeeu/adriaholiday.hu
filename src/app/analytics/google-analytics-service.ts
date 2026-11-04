import type { AnalyticsConsent, AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";
import { isGoogleAnalyticsEnabled, toGoogleAnalyticsEvent } from "./google-analytics-config.js";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleAnalyticsInitConfig = {
  enabled: boolean;
  consent: AnalyticsConsent;
  measurementId: string;
};

let initializedMeasurementId: string | null = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function consentModeState(consent: AnalyticsConsent) {
  const advertising = consent.marketing ? "granted" : "denied";

  return {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: advertising,
    ad_user_data: advertising,
    ad_personalization: advertising,
  };
}

export function ensureGoogleAnalytics({ enabled, consent, measurementId }: GoogleAnalyticsInitConfig) {
  if (
    !isBrowser() ||
    !isGoogleAnalyticsEnabled({ enabled, analyticsConsent: consent.analytics, measurementId })
  ) {
    return;
  }

  const id = measurementId.trim();

  if (initializedMeasurementId === id) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js only processes the arguments object itself, not a copied array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag("consent", "default", consentModeState(consent));
  window.gtag("js", new Date());
  window.gtag("config", id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  initializedMeasurementId = id;
}

export function updateGoogleAnalyticsConsent(consent: AnalyticsConsent) {
  if (!isBrowser() || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("consent", "update", consentModeState(consent));
}

export function sendGoogleAnalyticsEvent(eventName: AnalyticsEventName, payload?: AnalyticsTrackPayload) {
  if (!isBrowser() || typeof window.gtag !== "function") {
    return;
  }

  const event = toGoogleAnalyticsEvent(eventName, payload);

  if (event) {
    window.gtag("event", event.name, event.params);
  }
}
