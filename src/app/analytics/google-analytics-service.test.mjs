import test from "node:test";
import assert from "node:assert/strict";

import { isGoogleAnalyticsEnabled, toGoogleAnalyticsEvent } from "./google-analytics-config.js";

test("google analytics loads only when enabled, consented and configured", () => {
  assert.equal(
    isGoogleAnalyticsEnabled({ enabled: true, analyticsConsent: true, measurementId: "G-TEST123" }),
    true,
  );

  assert.equal(
    isGoogleAnalyticsEnabled({ enabled: false, analyticsConsent: true, measurementId: "G-TEST123" }),
    false,
  );

  assert.equal(
    isGoogleAnalyticsEnabled({ enabled: true, analyticsConsent: false, measurementId: "G-TEST123" }),
    false,
  );

  assert.equal(
    isGoogleAnalyticsEnabled({ enabled: true, analyticsConsent: true, measurementId: " " }),
    false,
  );
});

test("page views are left to the google tag's own page tracking", () => {
  assert.equal(toGoogleAnalyticsEvent("page_view", { metadata: { route_name: "/" } }), null);
});

test("site events map to recommended GA4 events where one exists", () => {
  assert.equal(toGoogleAnalyticsEvent("lead_submit").name, "generate_lead");
  assert.equal(toGoogleAnalyticsEvent("booking_start").name, "begin_checkout");
  assert.equal(toGoogleAnalyticsEvent("search").name, "search");
  assert.equal(toGoogleAnalyticsEvent("phone_click").name, "phone_click");
});

test("event parameters keep the entity and scalar metadata only", () => {
  const event = toGoogleAnalyticsEvent("booking_success", {
    entity: { type: "tour", slug: "velence-karneval", id: null },
    metadata: { booking_id: 42, participants: 2, transport: null, extras: ["a"], paid: false },
  });

  assert.deepEqual(event, {
    name: "booking_success",
    params: {
      entity_type: "tour",
      entity_slug: "velence-karneval",
      booking_id: 42,
      participants: 2,
      paid: false,
    },
  });
});
