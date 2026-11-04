// GA4 recommended event names for the site events that have one; every
// other site event is sent under its own name.
const recommendedEventMap = {
  search: "search",
  lead_submit: "generate_lead",
  booking_start: "begin_checkout",
};

export function isGoogleAnalyticsEnabled(config) {
  return Boolean(
    config &&
      config.enabled === true &&
      config.analyticsConsent === true &&
      typeof config.measurementId === "string" &&
      config.measurementId.trim() !== "",
  );
}

/**
 * Builds the GA4 event for a site analytics event, or null when GA4 records
 * it on its own: page views come from the tag's history-based page tracking.
 * GA4 event parameters must be scalars, so nested or empty metadata is dropped.
 */
export function toGoogleAnalyticsEvent(eventName, payload) {
  if (eventName === "page_view") {
    return null;
  }

  const params = {};

  if (payload?.entity?.type) {
    params.entity_type = payload.entity.type;
  }

  if (payload?.entity?.slug) {
    params.entity_slug = payload.entity.slug;
  }

  for (const [key, value] of Object.entries(payload?.metadata ?? {})) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      params[key] = value;
    }
  }

  return {
    name: recommendedEventMap[eventName] ?? eventName,
    params,
  };
}
