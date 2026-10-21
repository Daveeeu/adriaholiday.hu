# AI travel sales assistant (demo, Retell AI)

A Hungarian voice travel consultant built on **Retell AI**. The Retell agent
answers only from the AdriaHoliday tour catalog, through five read-only
custom functions that Retell calls on this backend. It never books, takes
payment or stores the conversation.

Status:
- **Retell agent functions: done.** They need `SALES_ASSISTANT_ENABLED=true` plus the Retell credentials, and can be tested in the Retell dashboard.
- **Browser demo page (`/ai-utazasi-tanacsado`): being moved to Retell's Web SDK.** It stays hidden until `SALES_ASSISTANT_DEMO_PAGE_ENABLED=true`.

---

## Reused catalog code

| Concern | Existing code reused |
| --- | --- |
| Trips | `Tour` (`listedPublicly()`, `seo_name` slug, `travel_mode_id`, `country_ids`) |
| Departures | `TourDate` (`upcoming()`, `status`, price box prices, seats), `TourDateStatus::isBookable()` |
| Prices | `TourBookingPriceCalculator` (the booking's own pricing), `PriceBoxData` |
| Pickup locations | `TourDeparturePlace::tourFee()`, `TourDate::offeredDeparturePlaces()` |
| Labels | `Region`, `TourMeta` (country, duration, stay, meals) |
| Search | `PortfolioOfferQuery::buildBaseQuery()`, the same query as `/api/portfolio/offers` (with `until`) |
| Offer cards | `PortfolioFeaturedTourResource` / the site's `OfferCard` |

Availability is **catalog data the office maintains**, not a live inventory feed. Every result says so (`confirmed: false`, `source: "catalog"`, `last_updated`, `may_be_outdated`).

---

## How it works

```
Retell (agent, voice, LLM)                         Laravel backend
──────────────────────────                         ───────────────
custom function call
POST /api/sales-assistant/retell/functions/{tool}
  body  {name, call: {call_id, agent_id, …}, args}
  X-Retell-Signature: v=<ms>,d=<HMAC>  ─────────▶  VerifyRetellSignature (Retell API key, 5 min window)
                                                   RetellFunctionRequest  (own agent only, tool's rules)
                                                   SalesAssistantSessionService::executeTool
                                                     · per-call budget, remembers the trips
                                                     · SalesAssistantToolRegistry → Tool → TripCatalog
  ◀─────────── 200 JSON result (or {error}) ──────

Browser demo page (when enabled)
POST /api/sales-assistant/sessions  ───────────▶  access code, IP and daily limits
                                                   RetellClient → POST /v3/create-web-call (secret key)
  ◀── {sessionToken, call: {accessToken, …}} ────
retell-client-js-sdk joins the web call with the access token (audio goes straight to Retell)
GET /api/sales-assistant/sessions/current/recommendations  → the trips the agent talked about
```

- `Services/SalesAssistant/RetellClient` creates web calls. With `SalesAssistantSessionService` it is the only code that uses `RETELL_API_KEY`.
- `Support/SalesAssistant/RetellSignature` holds Retell's signature scheme, ported from its SDK's `verify()`. The HMAC-SHA256 is taken over `rawBody . timestamp`.
- `Services/SalesAssistant/SalesAssistantCallStore` holds the per-call tool budget and the recommended trips, in the cache only.
- `Support/SalesAssistant/SalesAssistantInstructions` is the agent prompt. `RetellAgentConfiguration` builds the Retell LLM and agent payloads from the same tool definitions, so the function schemas Retell sees always match the server's validation.

Tool errors are answered with **HTTP 200** and `{ "error": { "code", "message", "details?" } }`, because Retell only hands successful responses to the model. The codes are `invalid_arguments`, `invalid_date_range`, `unknown_tool`, `trip_not_found`, `departure_not_found`, `departure_required`, `departure_not_bookable`, `pickup_location_required`, `price_not_calculable`, `tool_budget_exhausted` and `tool_failed`.
A bad or old signature gets `401`, another agent's call `403`, and more than 30 calls a minute per call `429`.

---

## Setting up Retell (step by step)

1. **Credentials.** In the Retell dashboard, open *Settings → API Keys* and copy the secret API key (`key_…`). The same key signs the function calls.
2. **Server environment** (`backend/.env.production`):
   ```env
   SALES_ASSISTANT_ENABLED=true
   SALES_ASSISTANT_DEMO_PAGE_ENABLED=false
   RETELL_API_KEY=key_...
   RETELL_AGENT_ID=           # filled in at step 5
   ```
   Recreate the containers so the config cache picks the values up (`docker compose … up -d`).
3. **Choose a voice.** In the dashboard, open *Voices* and pick one that speaks Hungarian well. Note its `voice_id`.
4. **Create the Retell LLM.** Print its configuration on the server and send it to Retell:
   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml -f docker-compose.db.yml exec -T app php artisan sales-assistant:retell-config llm --site-url=https://adriaholiday.jandldavid.hu > retell-llm.json
   curl -X POST https://api.retellai.com/create-retell-llm -H "Authorization: Bearer $RETELL_API_KEY" -H "Content-Type: application/json" --data @retell-llm.json
   ```
   Note the `llm_id` in the answer. In the dashboard you can paste the same prompt and the five custom functions (URL, POST, JSON schema) instead. Keep **"Payload: args only" off**: the backend needs the `call` object next to the arguments.
5. **Create the agent.**
   ```bash
   … php artisan sales-assistant:retell-config agent --llm-id=<llm_id> > retell-agent.json
   ```
   Set `voice_id` in the file to the voice from step 3, then POST it to `https://api.retellai.com/create-agent`. Put the answer's `agent_id` into `RETELL_AGENT_ID` and recreate the containers. The agent speaks `hu-HU`, ends calls after 10 minutes, and keeps only basic call attributes (`data_storage_setting: basic_attributes_only`).
6. **Test** in the dashboard's *Test* panel (web call, no phone number needed), following the checklist below.
7. **Demo page:** when the Web SDK page is ready, set `SALES_ASSISTANT_DEMO_PAGE_ENABLED=true` (and optionally `SALES_ASSISTANT_ACCESS_CODE`).

---

## Configuration

```env
SALES_ASSISTANT_ENABLED=false
SALES_ASSISTANT_DEMO_PAGE_ENABLED=false
SALES_ASSISTANT_ACCESS_CODE=
RETELL_API_KEY=
RETELL_AGENT_ID=
RETELL_LLM_MODEL=gpt-4.1          # used by sales-assistant:retell-config
RETELL_VOICE_ID=                  # used by sales-assistant:retell-config
SALES_ASSISTANT_SESSION_TTL=600
SALES_ASSISTANT_MAX_TOOL_CALLS=40
SALES_ASSISTANT_DAILY_SESSION_LIMIT=100
SALES_ASSISTANT_SESSIONS_PER_IP_PER_HOUR=6
SALES_ASSISTANT_STALE_AFTER_DAYS=30
```

---

## Security controls

- **Key isolation.** `RETELL_API_KEY` is used only on the server: it creates web calls and verifies the signature of every function call. Browsers get only a short-lived web call access token.
- **Read-only functions.** Only the five registered tools exist. Each one validates its arguments with Laravel rules and drops unknown arguments, so the model has no database access beyond those queries. No partner, legacy, internal-note or admin fields are returned.
- **Authenticity.** A function call must carry a fresh signature made with our key over the exact body, and come from our agent.
- **Cost controls.** There is a feature flag, a separate page flag, an optional access code, a per-IP hourly session limit, a daily session cap, a per-call function budget and a per-call rate limit.
- **Privacy.** We store no transcript, audio or arguments (cache only: the tool count and recommended trip ids, per call). The agent config asks Retell to keep only basic attributes.

---

## Tests

- `tests/Feature/SalesAssistantRetellFunctionsTest.php` covers signatures (missing, wrong key, tampered body, stale), the agent check, the payload shape, the per-call budget and rate limit, and the trip cards.
- `tests/Feature/SalesAssistantToolsTest.php` runs every tool through signed Retell calls: filters, empty results, validation, unknown trips, availability, missing and outdated prices, pricing through the booking calculator, failures, and no internal fields.
- `tests/Feature/SalesAssistantSessionTest.php` covers the flags, web call creation with the server key, the access code, missing credentials, Retell failures, the daily and IP limits, and the session lifecycle.
- `tests/Feature/SalesAssistantRetellConfigTest.php` checks that the generated LLM and agent configuration match the registered tools.
- `tests/Unit/RetellSignatureTest.php` covers the signature scheme.

---

## Manual Hungarian test checklist (Retell dashboard test call)

- [ ] It greets you in Hungarian and asks where you would like to go.
- [ ] „Júliusban mennénk Horvátországba busszal, ketten, fejenként százötvenezer alatt.” It asks at most one clarifying question, then presents at most three trips from the catalog. In the call log, `search_trips` answered 200.
- [ ] „Mesélj a másodikról!” It describes the program, stay and meals without inventing details.
- [ ] „Mikor indul, és van még hely?” It gives the dates from the catalog and says availability is confirmed at booking.
- [ ] „Honnan lehet felszállni?” It lists the pickup locations and their fees.
- [ ] „Mennyi lesz ketten, budapesti felszállással?” The total matches the booking form's total, and it calls the figure a guide price.
- [ ] Ask about a trip with no price: it does not estimate one and offers the office.
- [ ] „Antarktiszra mennék.” It says honestly that there is no such trip and suggests alternatives.
- [ ] „Foglald le nekem!” It says it cannot book.
- [ ] „Megadom a kártyaszámom…” It stops you and never asks for card details.
- [ ] Ask in English: it answers in Hungarian that the demo speaks Hungarian.
- [ ] The answers stay short (two or three sentences) and never read out URLs or ids.
- [ ] „Köszönöm, viszlát!” It says goodbye and ends the call.
