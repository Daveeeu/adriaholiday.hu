# AdriaHoliday Analytics Architecture

## Overview

The analytics stack is designed as a first-party event pipeline:

1. React UI calls `trackEvent(eventName, payload)`.
2. `AnalyticsProvider` enriches the event with `event_id`, `visitor_id`, `session_id`, page context, UTM data, consent, `_fbp`, `_fbc`.
3. Frontend posts the event to `POST /api/analytics/events`.
4. Laravel validates and persists the event in `analytics_events`.
5. Marketing-capable events are dispatched to the `analytics` queue.
6. Queue fanout sends partner-ready events to destination services.
7. Meta Pixel uses the same `event_id` in browser as CAPI uses in backend for deduplication.

## Frontend Structure

Files:

- `src/app/analytics/trackEvent.ts`
- `src/app/analytics/useAnalytics.ts`
- `src/app/analytics/analytics-provider.tsx`
- `src/app/analytics/analytics-api.ts`
- `src/app/analytics/meta-pixel-service.ts`
- `src/app/analytics/storage.ts`
- `src/app/analytics/event-catalog.ts`

Current wiring:

- Automatic `page_view` on route change.
- `offer_view` on offer detail route load.
- `category_view` on category route load.
- `pricebox_view`, `date_select`, `booking_anchor_click`.
- `gallery_open`, `gallery_next`, `gallery_previous`.
- `program_view`, `program_day_open`.
- `filter_click`, `filter_remove`.
- `phone_click`, `whatsapp_click`, common CTA clicks.

Rule:

- No component should call `fbq` directly.
- All future events must go through `trackEvent(...)`.

## Backend Structure

Files:

- `backend/config/analytics.php`
- `backend/app/Models/AnalyticsEvent.php`
- `backend/app/Http/Requests/Analytics/StoreAnalyticsEventRequest.php`
- `backend/app/Http/Controllers/AnalyticsEventController.php`
- `backend/app/Services/Analytics/AnalyticsIngestionService.php`
- `backend/app/Services/Analytics/AnalyticsFanoutService.php`
- `backend/app/Services/Analytics/MetaEventMapper.php`
- `backend/app/Services/Analytics/MetaConversionsApiService.php`
- `backend/app/Services/Analytics/Destinations/*`
- `backend/app/Jobs/DispatchAnalyticsEventJob.php`
- `backend/app/Support/Analytics/AnalyticsEventName.php`

Public endpoint:

- `POST /api/analytics/events`

## Data Model

Table: `analytics_events`

Columns:

- `id`
- `event_id`
- `session_id`
- `visitor_id`
- `user_id`
- `event_name`
- `entity_type`
- `entity_id`
- `entity_slug`
- `page_url`
- `page_path`
- `referrer`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `metadata`
- `fbp`
- `fbc`
- `ip_hash`
- `user_agent`
- `consent_analytics`
- `consent_marketing`
- `created_at`

Indexes included for:

- `event_id`
- `event_name + created_at`
- `entity_type + entity_id + created_at`
- session and visitor IDs
- core UTM fields

## Queue And Destinations

Current queue flow:

1. Event stored in DB.
2. If marketing consent is present, `DispatchAnalyticsEventJob` is queued on `ANALYTICS_QUEUE`.
3. `AnalyticsFanoutService` iterates destination adapters.
4. `MetaConversionsApiDestination` maps internal events to Meta CAPI.

This is intentionally extensible. New providers should follow the same destination contract:

- `supports(AnalyticsEvent $event): bool`
- `dispatch(AnalyticsEvent $event): void`

Next adapters can be:

- GA4 Measurement Protocol
- Google Ads Offline/Enhanced Conversions
- TikTok Events API
- internal BI/webhook sinks

## Meta Integration

Browser side:

- `meta-pixel-service.ts` loads Pixel centrally.
- `eventID` is always the frontend-generated `event_id`.

Backend side:

- `MetaConversionsApiService` sends `event_id` with the same value.
- Mapping lives in `MetaEventMapper`.

Current standard mappings:

- `page_view` -> `PageView`
- `offer_view` / `homepage_offer_view` -> `ViewContent`
- `search` -> `Search`
- `lead_start` / `lead_submit` -> `Lead`
- `phone_click` / `email_click` / `whatsapp_click` -> `Contact`
- `booking_start` / `booking_anchor_click` -> `InitiateCheckout`
- `booking_success` -> `Purchase`

Everything else can be sent later as Meta custom events.

## GDPR And Consent

Implemented baseline:

- Consent is stored client-side in localStorage.
- Event payload always carries `necessary`, `analytics`, `marketing`.
- Without analytics consent, first-party analytics storage is skipped.
- Without marketing consent, queue fanout and Pixel/CAPI dispatch are skipped.

Recommended next step:

- Replace localStorage consent with the real CMP as single source of truth.
- Optionally allowlist truly necessary operational events separately from analytics events.

## Session, Visitor, Attribution

- `visitor_id`: localStorage-backed stable UUID.
- `session_id`: first-party cookie-backed UUID with sliding lifetime.
- first-touch UTM values are captured once and attached to every event.
- `_fbc` is derived from `fbclid` when available.
- `_fbp` is first-party cookie managed centrally.

## Admin Dashboard Plan

Recommended V2 data products:

- top offers by `offer_view`
- top CTA placements by `cta_click`
- top categories by `category_view`
- campaign tables by `utm_source`, `utm_medium`, `utm_campaign`
- PriceBox CTR: `booking_anchor_click / pricebox_view`
- gallery engagement: `gallery_open`, next/previous rate
- program engagement: `program_view`, `program_day_open`
- conversion funnel:
  - `offer_view`
  - `pricebox_view`
  - `booking_start`
  - `lead_submit`
  - `booking_success`

## Roadmap

### V1

- First-party event collection
- shared frontend helper
- backend persistence
- analytics queue
- Meta Pixel centralization
- Meta CAPI adapter
- route and core CTA tracking

### V2

- Full offer page instrumentation
- full category/search instrumentation
- CMP integration
- admin analytics endpoints
- initial dashboard widgets in admin

### V3

- GA4 / Google Ads / TikTok adapters
- attribution and assisted conversion reporting
- booking completion instrumentation
- cohort and campaign performance reporting
