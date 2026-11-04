import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";

import { postAnalyticsEvent } from "./analytics-api";
import type { AnalyticsConsent, AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";
import {
  ensureTagManager,
  isTagManagerLoaded,
  pushDataLayerEvent,
  updateTagManagerConsent,
} from "./google-tag-manager";
import { setAnalyticsDispatcher } from "./runtime";
import { useInteractionTracking } from "./useInteractionTracking";
import {
  captureFirstTouchUtm,
  getAnalyticsSessionCookieName,
  getFirstTouchUtm,
  getMetaCookies,
  getSessionId,
  getStoredConsent,
  getVisitorId,
  hasStoredConsentDecision,
  setStoredConsent,
  syncMetaCookies,
} from "./storage";

type AnalyticsContextValue = {
  consent: AnalyticsConsent;
  setConsent: (consent: AnalyticsConsent) => void;
  trackEvent: (eventName: AnalyticsEventName, payload?: AnalyticsTrackPayload) => void;
  isConsentBannerOpen: boolean;
  openConsentPreferences: () => void;
};

type PendingPageView = {
  eventId: string;
  payload?: AnalyticsTrackPayload;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

function analyticsEnabled() {
  return import.meta.env.VITE_ANALYTICS_ENABLED !== "false";
}

function analyticsDebugEnabled() {
  return import.meta.env.VITE_ANALYTICS_DEBUG === "true";
}

function tagManagerContainerId() {
  return import.meta.env.VITE_GTM_ID || "";
}

/**
 * High-volume interaction events (every click, scroll milestones) go to GA4
 * only; the first-party store keeps the business events.
 */
const TAG_MANAGER_ONLY_EVENTS = new Set<AnalyticsEventName>(["ui_click", "scroll_depth"]);

function createEventId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [consent, setConsentState] = useState<AnalyticsConsent>(() => getStoredConsent());
  const [isConsentBannerOpen, setConsentBannerOpen] = useState(
    () => analyticsEnabled() && !hasStoredConsentDecision(),
  );
  const consentRef = useRef(consent);
  const lastTrackedPathRef = useRef<string | null>(null);
  // The page view of the page the visitor gives consent on, replayed to GTM
  // once the container loads.
  const pendingPageViewRef = useRef<PendingPageView | null>(null);
  // The landing page's query string: its campaign parameters are stored only
  // once statistics consent is given, which may happen pages later.
  const landingSearchRef = useRef(typeof window !== "undefined" ? window.location.search : "");

  useEffect(() => {
    consentRef.current = consent;

    if (!analyticsEnabled()) {
      return;
    }

    if (consent.analytics) {
      captureFirstTouchUtm(landingSearchRef.current);
    }

    if (consent.marketing) {
      syncMetaCookies();
    }

    updateTagManagerConsent(consent);

    const pendingPageView = pendingPageViewRef.current;
    if (ensureTagManager(tagManagerContainerId(), consent) && pendingPageView) {
      pushDataLayerEvent("page_view", pendingPageView.eventId, pendingPageView.payload);
      pendingPageViewRef.current = null;
    }
  }, [consent]);

  const dispatchEvent = useCallback(async (eventName: AnalyticsEventName, payload?: AnalyticsTrackPayload) => {
    if (!analyticsEnabled()) {
      return;
    }

    const eventId = createEventId();
    const currentConsent = consentRef.current;

    // The first-party identifiers (session cookie, visitor id) are created
    // only with statistics consent, as the cookie policy states.
    if (currentConsent.analytics && !TAG_MANAGER_ONLY_EVENTS.has(eventName)) {
      const eventPayload = {
        event_id: eventId,
        session_id: getSessionId(getAnalyticsSessionCookieName()),
        visitor_id: getVisitorId(),
        event_name: eventName,
        entity: payload?.entity,
        page: {
          url: window.location.href,
          path: `${window.location.pathname}${window.location.search}`,
          referrer: document.referrer || undefined,
        },
        attribution: getFirstTouchUtm(),
        meta: getMetaCookies(),
        consent: currentConsent,
        metadata: payload?.metadata,
      };

      if (analyticsDebugEnabled()) {
        console.debug("[analytics]", eventPayload);
      }

      void postAnalyticsEvent(eventPayload).catch(() => {
        // Ignore client-side analytics transport failures.
      });
    }

    if (isTagManagerLoaded()) {
      pushDataLayerEvent(eventName, eventId, payload);
    } else if (eventName === "page_view") {
      pendingPageViewRef.current = { eventId, payload };
    }
  }, []);

  useInteractionTracking(dispatchEvent, `${location.pathname}${location.search}`);

  useEffect(() => {
    setAnalyticsDispatcher(dispatchEvent);

    return () => {
      setAnalyticsDispatcher(null);
    };
  }, [dispatchEvent]);

  useEffect(() => {
    const nextPath = `${location.pathname}${location.search}`;

    if (lastTrackedPathRef.current === nextPath) {
      return;
    }

    lastTrackedPathRef.current = nextPath;
    void dispatchEvent("page_view", {
      metadata: {
        route_name: location.pathname,
      },
    });
  }, [dispatchEvent, location.pathname, location.search]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      consent,
      setConsent: (nextConsent) => {
        // Stored only on the visitor's own choice: an unanswered banner shows
        // again on the next page load instead of counting as a refusal.
        setStoredConsent(nextConsent);
        startTransition(() => {
          setConsentState(nextConsent);
          setConsentBannerOpen(false);
        });
      },
      trackEvent: (eventName, payload) => {
        void dispatchEvent(eventName, payload);
      },
      isConsentBannerOpen,
      openConsentPreferences: () => setConsentBannerOpen(true),
    }),
    [consent, dispatchEvent, isConsentBannerOpen],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalyticsContext must be used within AnalyticsProvider.");
  }

  return context;
}
