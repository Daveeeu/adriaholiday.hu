# Tracking plan – Google Tag Manager, GA4, Meta, Google Ads

How the public site's events reach Google Analytics 4, Meta and Google Ads. The
first-party pipeline (`POST /api/analytics/events`, admin reports, Meta
Conversions API) is described in [../analytics-architecture.md](../analytics-architecture.md).

## Accounts

| What | Id | Notes |
| --- | --- | --- |
| GA4 property | `G-JYZ3KL4M0B` (account „AdriaHoliday”, property „adriaholiday.hu”) | stream „AdriaHoliday web” → https://adriaholiday.hu |
| GTM container | `GTM-NTC5QFRN` (account „AdriaHoliday”, container „adriaholiday.hu”; `PORTFOLIO_VITE_GTM_ID`) | contents: [gtm-container.json](gtm-container.json) |
| Search Console | URL-prefix property https://adriaholiday.hu/ | verified by HTML file, sitemap `/sitemap.xml` |
| Microsoft Clarity | project `z8fxw09p8k` (GTM constant `Clarity Project ID`) | heatmaps and session recordings; „Microsoft Clarity” tag, statistics consent only |
| Meta Pixel | GTM constant `Meta Pixel ID` (placeholder `0` keeps the Meta tag off) | must equal backend `META_PIXEL_ID` (Conversions API) |

## Flow

1. Components call `trackEvent(name, payload)` (`src/app/analytics/trackEvent.ts`).
2. `AnalyticsProvider` gives every event an `event_id`, posts it to the
   first-party API (analytics consent) and pushes it to the dataLayer. The
   high-volume `ui_click` and `scroll_depth` go to the dataLayer only. The
   first-party identifiers (`ah_session_id`, `ah_visitor_id`, first-touch UTM)
   are created only with statistics consent, and the consent choice itself is
   stored only when the visitor makes it — an unanswered banner shows again.
3. GTM loads only after the visitor allowed statistics **or** marketing cookies
   (`src/app/analytics/google-tag-manager.ts`), with Consent Mode v2 set before
   any tag: `analytics_storage` ← statistics, `ad_*` ← marketing. The page view
   of the page the consent was given on is replayed once GTM is loaded.
4. In GTM, GA4 and Clarity tags require `analytics_storage`, Meta and Google
   Ads tags `ad_storage`. Clarity also gets its own `consentv2` signal. Areas
   with personal data (booking, apartment booking, group inquiry and contact
   forms, with their confirmations) carry `data-clarity-mask="true"`, so
   recordings never show them; keep the attribute on any new form.
5. A succeeded Barion payment is sent to GA4 from the server as `purchase`
   (`SendGooglePurchaseEventJob`, Measurement Protocol) for the visitor's GA
   client and session id stored with the booking — only when the visitor had
   given analytics consent at booking time.

## dataLayer contract

Built by `toDataLayerEvent()` in `src/app/analytics/data-layer-events.js`:

```js
{
  event: "view_item",          // GA4 name (table below); the site name otherwise
  event_id: "uuid",            // shared with the Conversions API event
  site_event: "offer_view",    // the first-party event name
  meta_event: "ViewContent",   // Meta standard event, or null
  entity_type: "tour",
  entity_slug: "velencei-karneval",
  ...scalar metadata,          // placement, transport, booking_type, …
  ecommerce: {                 // commerce events only; preceded by { ecommerce: null }
    currency: "HUF", value: 259800, transaction_id: "1234",
    items: [{ item_id: "<slug>", item_name, item_category: "tour" | "apartment", item_variant, price, quantity, index }]
  }
}
```

Never personal data: names, e-mails, phone numbers and passenger data stay out of
event parameters. `item_id` is the offer/apartment slug on every event, so lists,
offer pages and bookings join in GA4.

## Events

| Site event | GA4 event | Meta | Where | Key event |
| --- | --- | --- | --- | --- |
| `page_view` | `page_view` | PageView | every route change | |
| `item_list_view` | `view_item_list` | – | category / offer list, each loaded page | |
| `item_select` | `select_item` | – | offer card click in a list | |
| `offer_view` | `view_item` | ViewContent | tour page, apartment page | |
| `search` | `search` | Search | home hero search, trip finder | |
| `booking_start` | `begin_checkout` | InitiateCheckout | first booking interaction (tour, apartment) | |
| `booking_success` | `booking_submitted` | Purchase | booking request accepted (tour, apartment) | ✔ |
| — (server) | `purchase` | – | Barion payment succeeded | ✔ |
| `payment_result` | `payment_result` | – | payment result page, settled status | |
| `lead_submit` | `generate_lead` | Lead | group inquiry, contact form (`source`) | ✔ |
| `newsletter_signup` | `newsletter_signup` | – | newsletter forms (`placement`) | ✔ |
| `phone_click` / `email_click` / `whatsapp_click` | same | Contact | contact links | ✔ |
| `page_not_found` | `page_not_found` | – | 404 page (`missing_path`) | |
| `booking_step` | same | – | each booking step reached (`step_number`, `step_name`) | |
| `booking_field_error` | same | – | validation failed (`error_fields`: field names only, `error_count`, step) | |
| `booking_abandon` | same | – | left mid-booking: tab closed or navigated away (`last_step_*`, `last_field`, `form_seconds`) | |
| `ui_click` (GA4 only) | same | – | any link/button click (`click_text`, `click_element`, `click_section`, `link_path` / `link_domain` + `outbound`) | |
| `scroll_depth` (GA4 only) | same | – | 25/50/75/90% of a page (`percent_scrolled`) | |
| other site events (`cta_click`, `filter_click`, `gallery_open`, `program_view`, …) | same | – | see `event-catalog.ts` | |

## GA4 property settings

- Data retention: 14 months.
- Unwanted referrals: `barion.com`, `secure.barion.com` (customers return from the payment gateway).
- Enhanced measurement: page views from browser history events, scrolls, outbound clicks and form interactions **off** (the site sends `page_view`, `scroll_depth`, `ui_click` and the booking funnel events); site search, video and file downloads stay on.
- Custom dimensions (event scope): `entity_type`, `entity_slug`, `placement`, `transport`, `cta_name`, `booking_type`, `payment_kind`, `payment_status`, `source`, `step_name`, `step_number`, `last_step_name`, `last_field`, `error_fields`, `click_text`, `click_section`, `link_path`, `link_domain`; custom metric `form_seconds`. `item_list_name` and `percent_scrolled` are built-in.
- Explorations: „Foglalási tölcsér” (funnel: view_item → begin_checkout → booking_step 2/3/4 → booking_submitted), „Kilépő oldalak” (free form: page path × exits), „Foglalás megszakítás” (booking_abandon by last step / field).
- Key events: `booking_submitted`, `purchase`, `generate_lead`, `newsletter_signup`, `phone_click`, `email_click`, `whatsapp_click`.
- Measurement Protocol API secret → backend `GA_API_SECRET`.
- Linked: Search Console; Google Ads (key events imported as conversions).

## Changing the container

Edit tags in GTM, then export the container (Admin → Export container) over
`gtm-container.json`, so the repository keeps the deployed version. A new site
event needs: the name in `event-catalog.ts` and `AnalyticsEventName.php`, and —
if it should get a GA4 or Meta name — an entry in `data-layer-events.js`
(Meta also in `MetaEventMapper.php`).

## QA

- `npm test` covers the dataLayer mapping, consent mode and GA cookie parsing.
- GTM Preview (Tag Assistant) against `npm run dev` with `VITE_GTM_ID` set:
  before consent no GTM request; after „Mind elfogadása” GA4 and (with a Pixel
  id) Meta tags fire per event; with „Csak a szükséges” nothing loads.
- GA4 DebugView for parameters and ecommerce items.
- Backend: `TourBookingPaymentTest` covers the server-side purchase.
