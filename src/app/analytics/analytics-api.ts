import { getPortfolioApiBaseUrl } from "../content/portfolio-api";

type AnalyticsApiPayload = {
  event_id: string;
  session_id: string;
  visitor_id: string;
  event_name: string;
  entity?: {
    type?: string;
    id?: string | number | null;
    slug?: string | null;
  };
  page: {
    url: string;
    path: string;
    referrer?: string;
  };
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  } | null;
  meta?: {
    fbp?: string;
    fbc?: string;
  };
  consent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  metadata?: Record<string, unknown>;
};

export async function postAnalyticsEvent(payload: AnalyticsApiPayload) {
  return fetch(`${getPortfolioApiBaseUrl()}/analytics/events`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    keepalive: true,
    body: JSON.stringify(payload),
  });
}
