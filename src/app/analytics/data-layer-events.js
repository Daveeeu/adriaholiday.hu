// Translates site analytics events into the dataLayer contract the Google Tag
// Manager container reads (docs/analytics/tracking-plan.md). Site event names
// stay the first-party ones (admin reports, Meta Conversions API); GTM gets
// GA4 recommended names where one exists.

const ga4EventMap = {
  offer_view: "view_item",
  item_list_view: "view_item_list",
  item_select: "select_item",
  search: "search",
  booking_start: "begin_checkout",
  booking_success: "booking_submitted",
  lead_submit: "generate_lead",
};

// Mirrors the backend's App\Services\Analytics\MetaEventMapper so the browser
// pixel and the Conversions API report the same event under one event_id.
const metaEventMap = {
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

const DEFAULT_CURRENCY = "HUF";

function isScalar(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function scalarParams(metadata) {
  const params = {};

  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (isScalar(value)) {
      params[key] = value;
    }
  }

  return params;
}

function toGa4Item(item, index) {
  const ga4Item = { item_id: String(item.id), item_name: item.name, index: item.index ?? index };

  if (item.category) ga4Item.item_category = item.category;
  if (item.variant) ga4Item.item_variant = item.variant;
  if (item.listName) ga4Item.item_list_name = item.listName;
  if (typeof item.price === "number") ga4Item.price = item.price;
  ga4Item.quantity = item.quantity ?? 1;

  return ga4Item;
}

function toGa4Ecommerce(ecommerce) {
  if (!ecommerce || !Array.isArray(ecommerce.items) || ecommerce.items.length === 0) {
    return undefined;
  }

  const result = {
    currency: ecommerce.currency ?? DEFAULT_CURRENCY,
    items: ecommerce.items.map(toGa4Item),
  };

  if (typeof ecommerce.value === "number") result.value = ecommerce.value;
  if (ecommerce.transactionId) result.transaction_id = String(ecommerce.transactionId);
  if (ecommerce.listName) result.item_list_name = ecommerce.listName;

  return result;
}

/**
 * Builds the dataLayer push for a site event: the GA4 event name, the shared
 * event_id, the Meta event name (if any), the entity, scalar metadata as
 * parameters and, for commerce events, a GA4 `ecommerce` object.
 *
 * @returns {{ event: string, event_id: string, ecommerce?: object } & Record<string, unknown>}
 */
export function toDataLayerEvent(eventName, eventId, payload) {
  /** @type {{ event: string, event_id: string, ecommerce?: object } & Record<string, unknown>} */
  const event = {
    event: ga4EventMap[eventName] ?? eventName,
    event_id: eventId,
    site_event: eventName,
    meta_event: metaEventMap[eventName] ?? null,
    ...scalarParams(payload?.metadata),
  };

  if (payload?.entity?.type) event.entity_type = payload.entity.type;
  if (payload?.entity?.slug) event.entity_slug = payload.entity.slug;

  const ecommerce = toGa4Ecommerce(payload?.ecommerce);
  if (ecommerce) event.ecommerce = ecommerce;

  return event;
}

/** Consent Mode v2 state for the site's cookie consent choice. */
export function toConsentModeState(consent) {
  const advertising = consent.marketing ? "granted" : "denied";

  return {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: advertising,
    ad_user_data: advertising,
    ad_personalization: advertising,
  };
}

/** Google tags load only after the visitor allowed statistics or marketing cookies. */
export function hasTagConsent(consent) {
  return consent.analytics === true || consent.marketing === true;
}

/**
 * Reads the GA4 client id from the `_ga` cookie value (GA1.1.<random>.<timestamp>).
 */
export function parseGaClientId(cookieValue) {
  const parts = (cookieValue ?? "").split(".");

  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : null;
}

/**
 * Reads the GA4 session id from a `_ga_<container>` cookie value, in either
 * the GS1 (GS1.1.<session>.…) or the GS2 (GS2.1.s<session>$o…) format.
 */
export function parseGaSessionId(cookieValue) {
  const value = cookieValue ?? "";

  if (value.startsWith("GS2.")) {
    const match = value.match(/(?:^|[.$])s(\d+)/);
    return match ? match[1] : null;
  }

  const parts = value.split(".");
  return parts.length >= 3 && /^\d+$/.test(parts[2]) ? parts[2] : null;
}
