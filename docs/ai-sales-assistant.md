# AI travel sales assistant (demo)

A Hungarian voice travel consultant on the public site at `/ai-utazasi-tanacsado`.
The visitor talks to it through the microphone. It answers only from the
AdriaHoliday tour catalog, through five read-only tools, and it never books,
takes payment or stores the conversation.

Status: **demo, read-only, off by default** (`SALES_ASSISTANT_ENABLED=false`).

---

## Repository findings (what it builds on)

| Concern | Existing code reused |
| --- | --- |
| Trips | `Tour` (active and `listedPublicly()` scopes, `seo_name` slug, `travel_mode_id`, `country_ids`) |
| Departures | `TourDate` (`upcoming()` scope, `status`, price box prices, seats) and `TourDateStatus` |
| Prices | `TourBookingPriceCalculator` (the booking's own pricing), `PriceBoxData` |
| Pickup locations | `TourDeparturePlace` and its per-tour pivot fee (`tourFee()`), `TourDate::offeredDeparturePlaces()` |
| Destinations, labels | `Region`, `TourMeta` (country, duration, stay, meals) |
| Search and filtering | `PortfolioOfferQuery::buildBaseQuery()`, the same query as `/api/portfolio/offers` |
| Offer cards | `PortfolioFeaturedTourResource` on the server, `OfferCard` and `toUnifiedOfferCardModel` on the site |
| Imported and partner offers | Legacy and partner offers are ordinary `Tour` rows; freshness is their `updated_at` |

Availability is **catalog data the office maintains** (date status and seat
count), not a live inventory feed. Every tool result says so (`confirmed: false`,
`source: "catalog"`, `last_updated`, `may_be_outdated`).

Changes made to shared code along the way:

- `PortfolioOfferQuery` accepts `until`, the latest departure date, matched on the same departure as `from` and `duration`.
- `TourDateStatus::unbookable()` / `isBookable()` replace a private constant.
- `Tour::publicPath()` replaces the duplicated `/ajanlat/…` link building.
- `TourDeparturePlace::tourFee()` holds the pickup fee precedence (the tour's fee, else the place's).
- `TripDurationRange::contains()`.
- nginx `Permissions-Policy` now allows `microphone=(self)`; it previously blocked the microphone site-wide.
- `PortfolioSeoResolver` serves the demo page as `noindex` while the flag is on, and as a 404 while it is off.

---

## Architecture

```
Browser (src/app/sales-assistant)                    Laravel (backend)                         OpenAI
─────────────────────────────────                    ─────────────────                         ──────
click "Beszélgetés indítása"
  getUserMedia (only now)
  POST /api/sales-assistant/sessions  ───────────▶  SalesAssistantSessionService
                                                     · flag, access code, IP and daily limits
                                                     · OpenAiRealtimeClient ─────────────────▶ POST /v1/realtime/client_secrets
                                                       (server API key, instructions, tools)     (secret valid for 120 s)
  ◀── { sessionToken, clientSecret (ek_…) } ──────  · SalesAssistantSessionStore (cache only)
  RTCPeerConnection + "oai-events" channel
  POST /v1/realtime/calls (SDP, Bearer ek_…) ───────────────────────────────────────────────▶ WebRTC voice session
  ◀════════════════ audio and events ═══════════════════════════════════════════════════════
  response.done → function_call
  POST /api/sales-assistant/tools/{tool} ────────▶  RequireSalesAssistantSession (token header)
       X-Assistant-Session: <token>                  ExecuteSalesAssistantToolRequest (tool's rules)
                                                     SalesAssistantToolRegistry → Tool → TripCatalog
  ◀── { result (for the model), display.trips } ──  SalesAssistantToolResultResource
  conversation.item.create (function_call_output) ──────────────────────────────────────────▶
  response.create ──────────────────────────────────────────────────────────────────────────▶
```

### Backend (`backend/app`)

- `Services/SalesAssistant/OpenAiRealtimeClient` mints ephemeral client secrets. It is the only code that holds `OPENAI_API_KEY`.
- `Services/SalesAssistant/SalesAssistantSessionService` starts and ends conversations: feature flag, access code, daily cap, tool-call budget, and the Realtime session configuration (Hungarian transcription, semantic VAD, voice, tools).
- `Services/SalesAssistant/SalesAssistantSessionStore` keeps sessions in the cache only, keyed by the hash of the token, with a TTL.
- `Services/SalesAssistant/SalesAssistantToolRegistry` is the allow-list of callable tools. Unexpected failures are reported and answered generically.
- `Services/SalesAssistant/TripCatalog` holds the shared lookups (active trip by slug, departures), the price precedence, and the availability and freshness descriptions.
- `Services/SalesAssistant/Tools/*` holds `search_trips`, `get_trip_details`, `get_trip_departures`, `get_pickup_locations` and `get_trip_price`. Each tool has a JSON schema (for the model) and Laravel rules (enforced on the server).
- `Support/SalesAssistant/SalesAssistantInstructions` holds the sales behaviour: Hungarian, at most three options, short answers, catalog-only facts, no bookings, no card details.
- `Http/Controllers/SalesAssistantController` is the thin controller. Requests: `StartSalesAssistantSessionRequest`, `ExecuteSalesAssistantToolRequest`. Middleware: `EnsureSalesAssistantEnabled`, `RequireSalesAssistantSession`.
- `config/sales_assistant.php` holds every setting, read from the environment.

### Frontend (`src/app/sales-assistant`)

- `realtime-events.ts` handles events without side effects: transcript, phase, function-call extraction and recommendation merging. It is unit-tested with Node.
- `realtime-connection.ts` wraps the WebRTC peer and data channel.
- `useSalesAssistant.ts` covers the conversation lifecycle, relays tool calls, and handles expiry and `pagehide`.
- `useAudioLevel.ts` writes the stream loudness to a CSS variable (no re-renders).
- `SalesAssistantRoute.tsx` composes the page from `AssistantVoiceOrb`, `AssistantControls`, `AssistantTranscript` and `AssistantRecommendations` (the site's `OfferCard`, opened in a new tab so the conversation continues).

---

## API

All endpoints answer `404` while `SALES_ASSISTANT_ENABLED=false` and are rate-limited per IP (`sales-assistant`: 60 per minute).

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/sales-assistant/status` | `{ data: { available, accessCodeRequired, maxRecommendations } }` |
| POST | `/api/sales-assistant/sessions` | `{ accessCode? }` → `201 { data: { sessionToken, expiresAt, clientSecret, clientSecretExpiresAt, model } }`. `403` wrong code, `429` IP limit, `503` not configured or daily cap reached, `502` OpenAI failed |
| DELETE | `/api/sales-assistant/sessions/current` | Header `X-Assistant-Session` → `204`. `401` if not live |
| POST | `/api/sales-assistant/tools/{tool}` | Header `X-Assistant-Session`, body `{ arguments: {…} }` → `{ data: { tool, result, display: { trips, replacesRecommendations } } }` |

Tool errors use one shape, which the browser hands to the model as the function output:
`{ error: { code, message, details? } }`. The codes are `invalid_arguments`, `invalid_date_range`,
`unknown_tool`, `trip_not_found`, `departure_not_found`, `departure_required`,
`departure_not_bookable`, `pickup_location_required`, `price_not_calculable`
and `tool_failed`. Session errors are `session_invalid` (401) and `tool_budget_exhausted` (429).

---

## Security controls

- **Key isolation.** `OPENAI_API_KEY` is used only by the server. The browser receives a client secret that expires 120 seconds after it is minted and is good only for opening the connection.
- **Read-only tools.** The model can call only the five registered functions. Each one validates its arguments with Laravel rules and drops unknown arguments, so the model has no database access beyond those queries. Results are built field by field: no partner, legacy, internal-note or admin fields are included.
- **Session lifecycle.** A session token (64 random characters, sent in a header, stored as a hash) is required for every tool call. It expires after `SALES_ASSISTANT_SESSION_TTL` seconds, ends on stop or page leave, and allows `SALES_ASSISTANT_MAX_TOOL_CALLS` calls.
- **Cost controls.** There is a feature flag, an optional access code (`SALES_ASSISTANT_ACCESS_CODE`), a per-IP hourly session limit and a site-wide daily session cap. A session OpenAI refused does not count against the day.
- **Privacy.** No audio, transcript or tool arguments are stored, logged or sent to analytics. The microphone is requested only when the visitor presses start. The page is `noindex`.
- **Behaviour.** The instructions forbid inventing prices, dates or trips, claiming a reservation, or asking for card or ID details. Tool results carry `guidance` that reinforces this case by case.

---

## Configuration

```env
SALES_ASSISTANT_ENABLED=true
OPENAI_API_KEY=sk-...
SALES_ASSISTANT_ACCESS_CODE=            # optional
SALES_ASSISTANT_MODEL=gpt-realtime-2.1
SALES_ASSISTANT_VOICE=marin
SALES_ASSISTANT_TRANSCRIPTION_MODEL=gpt-4o-transcribe
SALES_ASSISTANT_SESSION_TTL=600
SALES_ASSISTANT_MAX_TOOL_CALLS=40
SALES_ASSISTANT_DAILY_SESSION_LIMIT=100
SALES_ASSISTANT_SESSIONS_PER_IP_PER_HOUR=6
SALES_ASSISTANT_STALE_AFTER_DAYS=30
```

The voice connection needs HTTPS (or `localhost`) and the `microphone=(self)` permission policy.
After changing the environment on the server, rebuild the config cache (see the deployment notes).

---

## Tests

- `backend/tests/Feature/SalesAssistantSessionTest.php` covers the feature flag, status, secret minting with the server key, access code, missing key, OpenAI failure, daily cap, IP rate limit, missing, ended and expired sessions, the tool budget, and that nothing is stored.
- `backend/tests/Feature/SalesAssistantToolsTest.php` covers search filters and the date window, the three-result cap with bookable trips first, empty results, recommendation links, argument validation, unknown tools and arguments, unknown trips, details, catalog availability, on-request trips, missing prices, outdated prices, pricing through the booking calculator, the missing departure or pickup location, sold-out departures, pickup fees, unexpected tool failures, and that no internal fields are exposed.
- `backend/tests/Feature/PortfolioOfferSearchTest.php` covers the `until` filter.
- `src/app/sales-assistant/realtime-events.test.mjs` (`npm test`) covers transcript ordering, function-call parsing, phases and recommendation merging.

---

## Manual Hungarian voice test checklist

Run it on desktop Chrome and on a phone (iOS Safari, Android Chrome) over HTTPS, with the flag and key set.

**Start and permissions**

- [ ] Opening the page shows no microphone prompt; it appears only after clicking „Beszélgetés indítása”.
- [ ] Denying the microphone shows „engedélyezd a mikrofon használatát…”, and no session is started (no `POST /sessions` in the network tab).
- [ ] With an access code configured: a wrong code shows „Érvénytelen hozzáférési kód.”, and the right one connects.
- [ ] After connecting, the consultant greets you in Hungarian and asks where you would like to go.

**States and controls**

- [ ] The status shows Hallgatlak while you speak, Gondolkodom… while it searches, and Válaszolok while it talks. The orb reacts to your voice and to its voice.
- [ ] „Némítás” stops it hearing you (the status shows Némítva), and pressing it again resumes.
- [ ] You can interrupt it while it speaks („Bocsánat, inkább repülővel.”), and it stops and listens.
- [ ] „Befejezés” ends the call: the microphone indicator in the browser turns off.
- [ ] Closing the tab mid-call ends the session (later tool calls with its token are refused).
- [ ] After `SALES_ASSISTANT_SESSION_TTL` the call ends with the time-limit notice.

**Sales conversation** (compare every figure with the trip page and the admin)

- [ ] „Júliusban mennénk Horvátországba busszal, ketten, fejenként százötvenezer alatt.” It asks at most one clarifying question, then presents at most three trips, and the same trips appear as cards.
- [ ] „Mesélj a másodikról!” It describes the program, accommodation and meals without inventing details.
- [ ] „Mikor indul, és van még hely?” It gives dates from the catalog and says availability is confirmed at booking.
- [ ] „Honnan lehet felszállni?” It lists the pickup locations and their fees.
- [ ] „Mennyi lesz ketten, budapesti felszállással?” The total matches what the booking form computes, and it calls the figure a guide price.
- [ ] Ask about a trip with no price: it says it cannot quote one and offers the office.
- [ ] Ask for something not in the catalog („Antarktiszra mennék”): it says honestly that there is no such trip and suggests alternatives.
- [ ] „Foglald le nekem!” It says it cannot book, and points to the card's „Foglalás” or the office.
- [ ] „Megadom a kártyaszámom…” It stops you and never asks for card details.
- [ ] Ask in English: it answers briefly in Hungarian that the demo speaks Hungarian.
- [ ] Clicking a card opens the trip page in a new tab, and the conversation continues.
- [ ] The answers stay short (two or three sentences) and never read out URLs or ids.

**Mobile**

- [ ] The layout has no horizontal scrolling, and the controls are reachable above the sticky mobile CTA.
- [ ] Audio plays through the speaker on iOS Safari after starting.
