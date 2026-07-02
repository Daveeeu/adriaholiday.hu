import {
  createContext,
  startTransition,
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
import { ensureMetaPixel, sendMetaPixelEvent } from "./meta-pixel-service";
import { setAnalyticsDispatcher } from "./runtime";
import {
  captureFirstTouchUtm,
  getAnalyticsSessionCookieName,
  getFirstTouchUtm,
  getMetaCookies,
  getSessionId,
  getStoredConsent,
  getVisitorId,
  setStoredConsent,
  syncMetaCookies,
} from "./storage";

type AnalyticsContextValue = {
  consent: AnalyticsConsent;
  setConsent: (consent: AnalyticsConsent) => void;
  trackEvent: (eventName: AnalyticsEventName, payload?: AnalyticsTrackPayload) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

function analyticsEnabled() {
  return import.meta.env.VITE_ANALYTICS_ENABLED !== "false";
}

function analyticsDebugEnabled() {
  return import.meta.env.VITE_ANALYTICS_DEBUG === "true";
}

function metaPixelId() {
  return import.meta.env.VITE_META_PIXEL_ID || "";
}

function metaPixelEnabled() {
  return import.meta.env.VITE_META_PIXEL_ENABLED === "true";
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [consent, setConsentState] = useState<AnalyticsConsent>(() => getStoredConsent());
  const consentRef = useRef(consent);
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsEnabled()) {
      return;
    }

    captureFirstTouchUtm();
    syncMetaCookies();
  }, []);

  useEffect(() => {
    consentRef.current = consent;
    setStoredConsent(consent);
  }, [consent]);

  useEffect(() => {
    if (!analyticsEnabled() || !consent.analytics || !consent.marketing) {
      return;
    }

    const pixelId = metaPixelId();
    if (pixelId) {
      ensureMetaPixel({
        enabled: metaPixelEnabled(),
        marketingConsent: consent.marketing,
        pixelId,
      });
    }
  }, [consent.analytics, consent.marketing]);

  const dispatchEvent = async (eventName: AnalyticsEventName, payload?: AnalyticsTrackPayload) => {
    if (!analyticsEnabled()) {
      return;
    }

    const eventId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const visitorId = getVisitorId();
    const sessionId = getSessionId(getAnalyticsSessionCookieName());
    const currentConsent = consentRef.current;
    const eventPayload = {
      event_id: eventId,
      session_id: sessionId,
      visitor_id: visitorId,
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

    if (currentConsent.analytics) {
      void postAnalyticsEvent(eventPayload).catch(() => {
        // Ignore client-side analytics transport failures.
      });
    }

    if (
      currentConsent.analytics &&
      currentConsent.marketing &&
      metaPixelEnabled() &&
      metaPixelId()
    ) {
      sendMetaPixelEvent({
        eventId,
        eventName,
        payload,
      });
    }
  };

  useEffect(() => {
    setAnalyticsDispatcher((eventName, payload) => dispatchEvent(eventName, payload));

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
    dispatchEvent("page_view", {
      metadata: {
        route_name: location.pathname,
      },
    });
  }, [dispatchEvent, location.pathname, location.search]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      consent,
      setConsent: (nextConsent) => {
        startTransition(() => {
          setConsentState(nextConsent);
        });
      },
      trackEvent: (eventName, payload) => {
        void dispatchEvent(eventName, payload);
      },
    }),
    [consent, dispatchEvent],
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
