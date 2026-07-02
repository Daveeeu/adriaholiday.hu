import type { AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";
import { isMetaPixelEnabled } from "./meta-pixel-config.js";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

type MetaTrackInput = {
  eventId: string;
  eventName: AnalyticsEventName;
  payload?: AnalyticsTrackPayload;
};

type MetaPixelInitConfig = {
  enabled: boolean;
  marketingConsent: boolean;
  pixelId: string;
};

const standardEventMap: Partial<Record<AnalyticsEventName, string>> = {
  page_view: "PageView",
  offer_view: "ViewContent",
  homepage_offer_view: "ViewContent",
  search: "Search",
  lead_start: "Lead",
  lead_submit: "Lead",
  phone_click: "Contact",
  email_click: "Contact",
  whatsapp_click: "Contact",
  booking_start: "InitiateCheckout",
  booking_anchor_click: "InitiateCheckout",
  booking_success: "Purchase",
};

let initializedPixelId: string | null = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function ensureMetaPixel(config: MetaPixelInitConfig) {
  if (!isBrowser() || !isMetaPixelEnabled(config)) {
    return;
  }

  const pixelId = config.pixelId.trim();

  if (initializedPixelId === pixelId && typeof window.fbq === "function") {
    return;
  }

  if (typeof window.fbq !== "function") {
    ((f: Window) => {
      const fbq = function (...args: unknown[]) {
        if ((fbq as { callMethod?: (...innerArgs: unknown[]) => void }).callMethod) {
          (fbq as { callMethod: (...innerArgs: unknown[]) => void }).callMethod(...args);
        } else {
          ((fbq as { queue?: unknown[] }).queue ??= []).push(args);
        }
      };

      if (!f.fbq) {
        f.fbq = fbq;
      }

      (fbq as { push?: unknown; loaded?: boolean; version?: string; queue?: unknown[] }).push = fbq;
      (fbq as { loaded?: boolean }).loaded = true;
      (fbq as { version?: string }).version = "2.0";
      (fbq as { queue?: unknown[] }).queue = [];

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    })(window);
  }

  window.fbq?.("init", pixelId);
  initializedPixelId = pixelId;
}

export function sendMetaPixelEvent({ eventId, eventName, payload }: MetaTrackInput) {
  if (!isBrowser() || typeof window.fbq !== "function") {
    return;
  }

  const standardEventName = standardEventMap[eventName];
  const customPayload = {
    content_name: payload?.entity?.slug,
    content_category: payload?.entity?.type,
    content_ids: payload?.entity?.id ? [String(payload.entity.id)] : undefined,
    ...payload?.metadata,
  };

  if (standardEventName) {
    window.fbq("track", standardEventName, customPayload, { eventID: eventId });
    return;
  }

  window.fbq("trackCustom", eventName, customPayload, { eventID: eventId });
}
