import test from "node:test";
import assert from "node:assert/strict";

import {
  hasTagConsent,
  parseGaClientId,
  parseGaSessionId,
  toConsentModeState,
  toDataLayerEvent,
} from "./data-layer-events.js";

test("site events map to GA4 recommended names and keep the site name", () => {
  assert.equal(toDataLayerEvent("offer_view", "e1").event, "view_item");
  assert.equal(toDataLayerEvent("item_list_view", "e1").event, "view_item_list");
  assert.equal(toDataLayerEvent("item_select", "e1").event, "select_item");
  assert.equal(toDataLayerEvent("booking_start", "e1").event, "begin_checkout");
  assert.equal(toDataLayerEvent("booking_success", "e1").event, "booking_submitted");
  assert.equal(toDataLayerEvent("lead_submit", "e1").event, "generate_lead");
  assert.equal(toDataLayerEvent("phone_click", "e1").event, "phone_click");
  assert.equal(toDataLayerEvent("phone_click", "e1").site_event, "phone_click");
});

test("events carry the shared event id and the Meta event name", () => {
  const event = toDataLayerEvent("booking_success", "evt-42");

  assert.equal(event.event_id, "evt-42");
  assert.equal(event.meta_event, "Purchase");
  assert.equal(toDataLayerEvent("gallery_open", "e1").meta_event, null);
});

test("entity and scalar metadata become flat parameters", () => {
  const event = toDataLayerEvent("cta_click", "e1", {
    entity: { type: "tour", slug: "velence", id: 7 },
    metadata: { cta_name: "hero", position: 2, sticky: false, tags: ["a"], nested: { a: 1 }, empty: null },
  });

  assert.deepEqual(event, {
    event: "cta_click",
    event_id: "e1",
    site_event: "cta_click",
    meta_event: null,
    cta_name: "hero",
    position: 2,
    sticky: false,
    entity_type: "tour",
    entity_slug: "velence",
  });
});

test("commerce events get a GA4 ecommerce object with HUF as default currency", () => {
  const event = toDataLayerEvent("booking_success", "e1", {
    ecommerce: {
      value: 259800,
      transactionId: 1234,
      items: [{ id: 7, name: "Velencei karnevál", category: "tour", variant: "2027-02-14", price: 129900, quantity: 2 }],
    },
  });

  assert.deepEqual(event.ecommerce, {
    currency: "HUF",
    value: 259800,
    transaction_id: "1234",
    items: [
      {
        item_id: "7",
        item_name: "Velencei karnevál",
        index: 0,
        item_category: "tour",
        item_variant: "2027-02-14",
        price: 129900,
        quantity: 2,
      },
    ],
  });
});

test("events without items carry no ecommerce object", () => {
  assert.equal(toDataLayerEvent("offer_view", "e1", { ecommerce: { items: [] } }).ecommerce, undefined);
});

test("consent mode follows the statistics and marketing choices", () => {
  assert.deepEqual(toConsentModeState({ necessary: true, analytics: true, marketing: false }), {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
});

test("tags load only after statistics or marketing consent", () => {
  assert.equal(hasTagConsent({ necessary: true, analytics: false, marketing: false }), false);
  assert.equal(hasTagConsent({ necessary: true, analytics: true, marketing: false }), true);
  assert.equal(hasTagConsent({ necessary: true, analytics: false, marketing: true }), true);
});

test("GA client and session ids are read from the cookies", () => {
  assert.equal(parseGaClientId("GA1.1.123456789.1700000000"), "123456789.1700000000");
  assert.equal(parseGaClientId("garbage"), null);
  assert.equal(parseGaSessionId("GS1.1.1700000123.3.1.1700000500.0.0.0"), "1700000123");
  assert.equal(parseGaSessionId("GS2.1.s1700000123$o3$g1$t1700000500$j0$l0$h0"), "1700000123");
  assert.equal(parseGaSessionId(undefined), null);
});
