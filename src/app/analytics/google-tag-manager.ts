import type { AnalyticsConsent, AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";
import {
  hasTagConsent,
  parseGaClientId,
  parseGaSessionId,
  toConsentModeState,
  toDataLayerEvent,
} from "./data-layer-events.js";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export type GoogleAnalyticsIds = {
  ga_client_id?: string;
  ga_session_id?: string;
};

/** Sent with a booking so its later online payment is reported to GA4 for this visitor. */
export type BookingAnalyticsContext = GoogleAnalyticsIds & {
  analytics_consent: boolean;
};

let loadedContainerId: string | null = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function dataLayer() {
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

// Consent commands must reach Google tags as gtag() calls, which push the
// arguments object itself rather than a plain array.
const gtag: (...args: unknown[]) => void = function () {
  // eslint-disable-next-line prefer-rest-params
  dataLayer().push(arguments);
};

export function isTagManagerLoaded() {
  return loadedContainerId !== null;
}

/**
 * Loads the GTM container once the visitor allowed statistics or marketing
 * cookies, with the Consent Mode state set before any tag runs. Returns true
 * when this call loaded it.
 */
export function ensureTagManager(containerId: string, consent: AnalyticsConsent): boolean {
  const id = containerId.trim();

  if (!isBrowser() || id === "" || loadedContainerId !== null || !hasTagConsent(consent)) {
    return false;
  }

  gtag("consent", "default", toConsentModeState(consent));
  dataLayer().push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  loadedContainerId = id;
  return true;
}

export function updateTagManagerConsent(consent: AnalyticsConsent) {
  if (!isBrowser() || loadedContainerId === null) {
    return;
  }

  gtag("consent", "update", toConsentModeState(consent));
}

export function pushDataLayerEvent(
  eventName: AnalyticsEventName,
  eventId: string,
  payload?: AnalyticsTrackPayload,
) {
  if (!isBrowser() || loadedContainerId === null) {
    return;
  }

  // GTM's data model keeps every key ever pushed, so a parameter of an earlier
  // event (ecommerce, last_field, entity_slug, ...) would be sent again with
  // each later event that lacks it. Resetting the model first sends only this
  // event's own parameters.
  dataLayer().push(function (this: { reset: () => void }) {
    this.reset();
  });
  dataLayer().push(toDataLayerEvent(eventName, eventId, payload));
}

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * The GA4 client and session ids of this visitor, so a server-side event
 * (the paid booking) joins the visitor's original session and source.
 */
function getGoogleAnalyticsIds(): GoogleAnalyticsIds {
  if (!isBrowser()) {
    return {};
  }

  const sessionCookie = document.cookie.match(/(?:^|; )_ga_[A-Z0-9]+=([^;]*)/);
  const clientId = parseGaClientId(readCookie("_ga"));
  const sessionId = parseGaSessionId(sessionCookie ? decodeURIComponent(sessionCookie[1]) : null);

  return {
    ...(clientId ? { ga_client_id: clientId } : {}),
    ...(sessionId ? { ga_session_id: sessionId } : {}),
  };
}

export function getBookingAnalyticsContext(consent: AnalyticsConsent): BookingAnalyticsContext {
  return consent.analytics
    ? { analytics_consent: true, ...getGoogleAnalyticsIds() }
    : { analytics_consent: false };
}
