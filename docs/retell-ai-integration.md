# Retell AI integration: Custom Functions

This guide covers everything needed to connect the five AdriaHoliday catalog
functions to a Retell AI agent. All five are **read-only**: they search and
describe trips, but never create bookings, take payments or change data.

Backend code: `backend/app/Services/SalesAssistant` (tools, catalog, Retell
client), `backend/app/Http/Middleware/VerifyRetellSignature.php`,
`backend/app/Http/Requests/RetellFunctionRequest.php`. Background and the
browser demo: [ai-sales-assistant.md](ai-sales-assistant.md).

---

## 1. Endpoints

Base URL: **`https://adriaholiday.jandldavid.hu`** (later `https://adriaholiday.hu`).

| Function | Method | Public endpoint URL |
| --- | --- | --- |
| `search_trips` | POST | `https://adriaholiday.jandldavid.hu/api/sales-assistant/retell/functions/search_trips` |
| `get_trip_details` | POST | `https://adriaholiday.jandldavid.hu/api/sales-assistant/retell/functions/get_trip_details` |
| `get_trip_departures` | POST | `https://adriaholiday.jandldavid.hu/api/sales-assistant/retell/functions/get_trip_departures` |
| `get_pickup_locations` | POST | `https://adriaholiday.jandldavid.hu/api/sales-assistant/retell/functions/get_pickup_locations` |
| `get_trip_price` | POST | `https://adriaholiday.jandldavid.hu/api/sales-assistant/retell/functions/get_trip_price` |

The function name in the Retell configuration must match the last URL segment.

---

## 2. Server configuration

These go in `backend/.env.production` on the server; recreate the containers after changing them (`docker compose … up -d`), so the config cache picks them up.

```env
SALES_ASSISTANT_ENABLED=true            # off: every endpoint answers 404
SALES_ASSISTANT_DEMO_PAGE_ENABLED=false # the browser demo page, not needed for the functions
RETELL_API_KEY=key_...                  # Retell dashboard → Settings → API Keys (secret key)
RETELL_AGENT_ID=agent_...               # the agent allowed to call the functions
SALES_ASSISTANT_MAX_TOOL_CALLS=40       # function calls one Retell call may make
```

No secret is ever sent to or stored by the browser, and none is needed in the Retell function configuration.

---

## 3. Authentication (server to server)

Retell signs every Custom Function request with your **Retell API key**. Nothing has to be configured for this on the Retell side: no custom headers and no shared secret.

| Header | Sent by | Value |
| --- | --- | --- |
| `Content-Type` | Retell | `application/json` |
| `X-Retell-Signature` | Retell | `v=<unix time in ms>,d=<hex HMAC-SHA256>` |

The backend checks, in this order:

1. **Signature.** It computes `HMAC-SHA256(key = RETELL_API_KEY, message = raw request body + timestamp)` and compares it in constant time. Signatures older or newer than **5 minutes** are refused, so captured requests can't be replayed. This is the same algorithm as Retell's SDK `verify()`. Failure gives `401 {"message": "Invalid signature."}`.
2. **Agent.** `call.agent_id` must equal `RETELL_AGENT_ID`. Failure gives `403 {"message": "Unknown agent."}`.
3. **Arguments.** They are validated against the function's rules (see each function). Unknown arguments are dropped.

A rejected signature is logged as a warning with the function name, whether the header was present, whether a key is configured, and the IP. The body and the key are never logged.

---

## 4. Request format

Retell sends one JSON envelope, the same for every function:

```json
{
  "name": "search_trips",
  "call": { "call_id": "call_abc123", "agent_id": "agent_xyz", "call_type": "web_call" },
  "args": { "query": "Horvátország", "travel_mode": "bus" }
}
```

| Field | Rule |
| --- | --- |
| `name` | optional; when sent, it must be the function in the URL |
| `call.call_id` | required string (≤ 128); keys the per-call budget and rate limit |
| `call.agent_id` | required; must be `RETELL_AGENT_ID` |
| `args` | required object; validated by the function's rules |

> **Important:** in the Retell function settings, leave **"Payload: args only"** (`args_at_root`) **off**. The backend needs the `call` object next to `args`.

## 5. Response format

- **Success:** `200` with the function's JSON result (examples below). Retell hands it to the LLM as the function output. Every result is under 15,000 characters, Retell's default cap.
- **Expected problems** (invalid arguments, unknown trip, missing choice…): also **`200`**, as `{"error": {"code", "message", "details?"}}`. Retell only gives successful responses to the model, so this is how the agent reads the `message`, which tells it what to do next. `details` lists valid choices where useful.

| `error.code` | Meaning |
| --- | --- |
| `invalid_arguments` | an argument failed validation; `details.errors` names the parameters |
| `invalid_date_range` | `departure_until` is before `departure_from` |
| `unknown_tool` | there is no function with that name |
| `trip_not_found` | no active trip has the slug |
| `departure_not_found` | the trip has no upcoming departure with that id |
| `departure_required` | `get_trip_price` needs a `departure_id`; `details.departures` lists them |
| `departure_not_bookable` | the departure is sold out or cancelled |
| `pickup_location_required` | `get_trip_price` needs a `pickup_location_id`; `details.pickup_locations` lists them |
| `price_not_calculable` | the total depends on booking-form choices |
| `tool_budget_exhausted` | this call reached `SALES_ASSISTANT_MAX_TOOL_CALLS` |
| `tool_failed` | unexpected backend failure (reported to the error log, no details exposed) |

- **Protocol errors:** `401` for a bad signature, `403` for another agent, `404` when the feature is off, and `429` when one call makes more than **30 function calls per minute**.

Prices and seats are **catalog data**, not live inventory. They carry `source: "catalog"`, `last_updated`, `may_be_outdated` (not edited for 30 days) and `confirmed: false`, and the results include `guidance` and `catalog_note` for the model.

---

## 6. The functions

### 6.1 `search_trips`

Searches the trips the site lists, through the same search as `/api/portfolio/offers`. It returns at most 3, putting trips with a bookable departure first.

**Description (for Retell):** Search the Adria Holiday trip catalog. Returns at most 3 matching trips with their next matching departure and from-price per person, plus the total number of matches. Call it whenever the customer describes what they want; never recommend a trip that no search returned.

**Parameters (JSON schema):**
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string", "description": "Destination or kind of trip in Hungarian, e.g. \"Horvátország\", \"Toszkána\", \"Párizs\", \"adventi vásár\", \"tengerparti üdülés\". Omit to search by the other filters only." },
    "departure_from": { "type": "string", "format": "date", "description": "Earliest departure date the customer accepts. Format: YYYY-MM-DD." },
    "departure_until": { "type": "string", "format": "date", "description": "Latest departure date the customer accepts. Format: YYYY-MM-DD." },
    "max_price_per_person": { "type": "integer", "minimum": 1, "description": "Budget per person in Hungarian forints (HUF)." },
    "travel_mode": { "type": "string", "enum": ["bus", "plane", "train"], "description": "bus: autóbuszos, plane: repülős, train: vonatos." },
    "trip_length": { "type": "string", "enum": ["short", "medium", "long"], "description": "short: 1-4 days, medium: 5-8 days, long: 9 or more days." },
    "departure_city": { "type": "string", "description": "Hungarian city where the customer wants to board the bus, e.g. \"Győr\"." }
  },
  "required": [],
  "additionalProperties": false
}
```
Server rules: `query` and `departure_city` are ≤ 100 characters; the dates must be `YYYY-MM-DD`; `max_price_per_person` is an integer from 1 to 100,000,000.

**Example request:**
```json
{
  "name": "search_trips",
  "call": { "call_id": "call_example", "agent_id": "agent_xyz", "call_type": "web_call" },
  "args": { "query": "Horvátország", "travel_mode": "bus", "departure_from": "2026-11-01", "departure_until": "2026-12-31" }
}
```

**Example response:**
```json
{
  "total_matches": 1,
  "returned": 1,
  "trips": [
    {
      "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej",
      "name": "Zágráb, Európa legszebb karácsonyi vására",
      "destination": "Horvátország",
      "travel_mode": "bus",
      "duration": "2 nap / 1 éj",
      "next_departure": { "start_date": "2026-12-12", "end_date": "2026-12-13", "days": 2 },
      "matching_departure_count": 1,
      "from_price_per_person": {
        "amount": 58600, "currency": "HUF", "label": "58 600 Ft", "original_amount": 64900,
        "discount_badge": null, "source": "catalog", "last_updated": "2026-10-14", "may_be_outdated": false
      },
      "summary": "Varasd - Salajland - Zágráb"
    }
  ],
  "guidance": "Present these trips briefly and ask which one interests the customer. A trip whose next_departure is null has no scheduled date (on request): say so.",
  "catalog_note": "Prices and seats come from the Adria Holiday catalog, maintained by the office. They are not a live reservation: the office confirms availability and the final price when the booking is made."
}
```

**Example error** (`"travel_mode": "rocket"`):
```json
{
  "error": {
    "code": "invalid_arguments",
    "message": "Some arguments are invalid. Fix them and call the function again, or ask the customer to clarify.",
    "details": { "errors": { "travel_mode": ["The selected travel_mode is invalid."] } }
  }
}
```

### 6.2 `get_trip_details`

**Description:** Get the details of one trip: day-by-day program, accommodation, meals, travel mode, and what the price includes and excludes. Use it when the customer asks what a trip is like.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "slug": { "type": "string", "description": "The trip slug exactly as returned by search_trips." }
  },
  "required": ["slug"],
  "additionalProperties": false
}
```
Server rules: `slug` is required, ≤ 191 characters, with no whitespace, `/`, `?`, `#`, `%` or `\`. It is matched exactly against active trips.

**Example request:**
```json
{ "name": "get_trip_details", "call": { "call_id": "call_example", "agent_id": "agent_xyz" }, "args": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej" } }
```

**Example response:**
```json
{
  "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej",
  "name": "Zágráb, Európa legszebb karácsonyi vására",
  "destination": "Horvátország",
  "travel_mode": "bus",
  "duration": "2 nap / 1 éj",
  "next_departure": { "start_date": "2026-12-12", "end_date": "2026-12-13", "days": 2 },
  "matching_departure_count": 1,
  "from_price_per_person": { "amount": 58600, "currency": "HUF", "label": "58 600 Ft", "original_amount": 64900, "discount_badge": null, "source": "catalog", "last_updated": "2026-10-14", "may_be_outdated": false },
  "summary": "Varasd - Salajland - Zágráb",
  "subtitle": null,
  "description": "Varasd - Salajland - Zágráb",
  "accommodation": "Hotel***",
  "accommodation_info": "2 ágyas",
  "meals": "Reggeli",
  "meals_info": null,
  "program": [],
  "price_includes": [],
  "price_excludes": [],
  "last_updated": "2026-10-14"
}
```
`program` lists active program days as `"1. nap: …"`; `price_includes` and `price_excludes` hold at most 12 items each.

**Example error:**
```json
{ "error": { "code": "trip_not_found", "message": "No bookable trip has the slug \"nincs-ilyen\". Use a slug returned by search_trips; never guess one." } }
```

### 6.3 `get_trip_departures`

**Description:** List the upcoming departures of one trip: dates, catalog availability (bookable, seats left when known) and price per person. Use it for questions about when a trip goes and whether there is room. Availability is catalog data, not a confirmed reservation.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "slug": { "type": "string", "description": "The trip slug exactly as returned by search_trips." },
    "departure_from": { "type": "string", "format": "date", "description": "Only list departures on or after this date. Format: YYYY-MM-DD." },
    "limit": { "type": "integer", "minimum": 1, "maximum": 10, "description": "How many departures to list (default 6)." }
  },
  "required": ["slug"],
  "additionalProperties": false
}
```

**Example request:**
```json
{ "name": "get_trip_departures", "call": { "call_id": "call_example", "agent_id": "agent_xyz" }, "args": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej", "limit": 2 } }
```

**Example response:**
```json
{
  "trip": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej", "name": "Zágráb, Európa legszebb karácsonyi vására" },
  "total_upcoming": 1,
  "departures": [
    {
      "departure_id": 178,
      "start_date": "2026-12-12",
      "end_date": "2026-12-13",
      "days": 2,
      "availability": { "status": "available", "bookable": true, "seats_left": 38, "confirmed": false, "source": "catalog", "last_updated": "2026-10-14", "may_be_outdated": false },
      "price_per_person": { "amount": 58600, "currency": "HUF", "label": "58 600 Ft", "original_amount": 64900, "discount_badge": null, "source": "catalog", "last_updated": "2026-10-14", "may_be_outdated": false }
    }
  ],
  "guidance": "Seats and prices are catalog data: never promise a seat. Use get_trip_price for the price of the customer's group.",
  "catalog_note": "Prices and seats come from the Adria Holiday catalog, maintained by the office. They are not a live reservation: the office confirms availability and the final price when the booking is made."
}
```
`seats_left` is `null` when the catalog has no count, and `price_per_person` is `null` when the trip has no price.

### 6.4 `get_pickup_locations`

**Description:** List the pickup (boarding) locations of one trip with the extra fee per person for each. Pass departure_id to get only the locations that departure offers.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "slug": { "type": "string", "description": "The trip slug exactly as returned by search_trips." },
    "departure_id": { "type": "integer", "minimum": 1, "description": "Optional departure_id from get_trip_departures." }
  },
  "required": ["slug"],
  "additionalProperties": false
}
```

**Example request:**
```json
{ "name": "get_pickup_locations", "call": { "call_id": "call_example", "agent_id": "agent_xyz" }, "args": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej", "departure_id": 178 } }
```

**Example response** (8 locations, shortened):
```json
{
  "trip": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej", "name": "Zágráb, Európa legszebb karácsonyi vására" },
  "pickup_required": true,
  "pickup_locations": [
    { "pickup_location_id": 47, "name": "Budapest BOK Csarnok", "city": null, "fee_per_person": { "amount": 0, "currency": "HUF" } },
    { "pickup_location_id": 51, "name": "Miskolc, Centrum Áruház mögötti parkoló", "city": null, "fee_per_person": { "amount": 0, "currency": "HUF" } }
  ],
  "guidance": "The customer picks one location when booking."
}
```

### 6.5 `get_trip_price`

Prices a departure for a group with the **booking's own calculator** (`TourBookingPriceCalculator`), including the departure price, discount badge, pickup fee and mandatory extras. Optional extras, coupons and insurance are left out. It is never a binding quote.

**Description:** Calculate the indicative catalog price of one departure for a number of passengers, including the pickup fee and mandatory extras. It is not a binding quote: optional extras, coupons and insurance are not included and the office confirms the final price at booking.

**Parameters:**
```json
{
  "type": "object",
  "properties": {
    "slug": { "type": "string", "description": "The trip slug exactly as returned by search_trips." },
    "departure_id": { "type": "integer", "minimum": 1, "description": "The departure_id from get_trip_departures. Required when the trip has scheduled departures." },
    "passengers": { "type": "integer", "minimum": 1, "maximum": 20, "description": "Number of travellers." },
    "pickup_location_id": { "type": "integer", "minimum": 1, "description": "The pickup_location_id from get_pickup_locations. Required when the trip has pickup locations." }
  },
  "required": ["slug", "passengers"],
  "additionalProperties": false
}
```

**Example request:**
```json
{ "name": "get_trip_price", "call": { "call_id": "call_example", "agent_id": "agent_xyz" }, "args": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej", "passengers": 2, "departure_id": 178, "pickup_location_id": 47 } }
```

**Example response:**
```json
{
  "trip": { "slug": "zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej", "name": "Zágráb, Európa legszebb karácsonyi vására" },
  "departure": { "departure_id": 178, "start_date": "2026-12-12", "end_date": "2026-12-13", "days": 2 },
  "availability": { "status": "available", "bookable": true, "seats_left": 38, "confirmed": false, "source": "catalog", "last_updated": "2026-10-14", "may_be_outdated": false },
  "price_available": true,
  "currency": "HUF",
  "passengers": 2,
  "price_per_person": 58600,
  "base_total": 117200,
  "discount": null,
  "pickup_location": { "name": "Budapest BOK Csarnok", "fee_per_person": 0, "total": 0 },
  "mandatory_extras": [],
  "paid_on_site": [],
  "optional_extras_not_included": [
    { "name": "Egyágyas felár", "price": 5900, "currency": "HUF", "price_unit": "per_person" },
    { "name": "Vacsora", "price": 4600, "currency": "HUF", "price_unit": "per_person" }
  ],
  "total": 117200,
  "source": "catalog",
  "last_updated": "2026-10-14",
  "may_be_outdated": false,
  "binding_quote": false,
  "guidance": "Say the total as an indicative catalog price for the group, not a confirmed one. Optional extras and travel or cancellation insurance can be added when booking."
}
```

**Example error** (no `pickup_location_id`, shortened):
```json
{
  "error": {
    "code": "pickup_location_required",
    "message": "This trip needs a pickup location: ask the customer where they board and pass its pickup_location_id.",
    "details": { "pickup_locations": [ { "pickup_location_id": 47, "name": "Budapest BOK Csarnok", "fee_per_person": 0 } ] }
  }
}
```
A trip without a price answers `{"trip": {…}, "price_available": false, "guidance": "The catalog has no price for this trip. Do not estimate one: offer that the office sends a personal quote."}`.

---

## 7. Configuring the functions in the Retell dashboard

The quickest way is to print the whole Retell LLM configuration (prompt and all five functions) on the server:

```bash
ssh -i ~/.ssh/marrygallery_actions jandl@217.144.53.91 'cd /srv/apps/adriaholiday && docker compose --env-file .env.production -f docker-compose.prod.yml -f docker-compose.db.yml exec -T app php artisan sales-assistant:retell-config llm --site-url=https://adriaholiday.jandldavid.hu' > retell-llm.json
curl -X POST https://api.retellai.com/create-retell-llm -H "Authorization: Bearer $RETELL_API_KEY" -H "Content-Type: application/json" --data @retell-llm.json
```

Then `sales-assistant:retell-config agent --llm-id=<llm_id>` prints the agent body (Hungarian `hu-HU`, a 10-minute limit, `data_storage_setting: basic_attributes_only`). Set `voice_id`, POST it to `https://api.retellai.com/create-agent`, and put the returned `agent_id` into `RETELL_AGENT_ID`.

**By hand in the dashboard**, open the agent's LLM, then *Functions → Add → Custom Function*, once for each of the five functions:

| Field | Value |
| --- | --- |
| Name | the function name, e.g. `search_trips` (must match the URL) |
| Description | the description from section 6 |
| API Endpoint | the URL from section 1 |
| HTTP Method | `POST` |
| Headers / Query parameters | none (Retell signs the request itself) |
| Parameters | the JSON schema from section 6 |
| Payload: args only | **off** |
| Timeout | `10000` ms (answers normally take well under a second) |
| Speak during execution | on, with the message: say a very short Hungarian filler, e.g. „Máris megnézem.” |
| Speak after execution | on |
| Response variables | none |

Also set the agent's language to **Hungarian (hu-HU)**, add the built-in **End Call** function, and use the prompt printed by `sales-assistant:retell-config llm` (`general_prompt`). It tells the model to answer only from these functions, offer at most three trips, and never book or ask for card details.

---

## 8. Testing a function by hand

```bash
KEY=key_...   # the RETELL_API_KEY of the target server
BODY='{"name":"search_trips","call":{"call_id":"manual_test","agent_id":"agent_..."},"args":{"query":"Horvátország"}}'
TS=$(python3 -c 'import time; print(int(time.time()*1000))')
SIG="v=$TS,d=$(printf '%s%s' "$BODY" "$TS" | openssl dgst -sha256 -hmac "$KEY" -hex | sed 's/.*= //')"
curl -s -X POST -H 'Content-Type: application/json' -H "X-Retell-Signature: $SIG" --data-binary "$BODY" \
  https://adriaholiday.jandldavid.hu/api/sales-assistant/retell/functions/search_trips
```

Troubleshooting:
- **`401`:** the key differs from `RETELL_API_KEY`, the containers weren't recreated after the change, or the server clock is off by more than 5 minutes. The app log shows `Retell function call rejected: invalid signature.` with the reason fields.
- **`403`:** `RETELL_AGENT_ID` is not the agent making the call.
- **`invalid_arguments` for `args`:** "Payload: args only" is switched on.
- **`404`:** `SALES_ASSISTANT_ENABLED` is not `true`.

---

## 9. Limits, timeouts and logging

- **Rate limit:** 30 function calls per minute per Retell call (`call_id`), plus a budget of `SALES_ASSISTANT_MAX_TOOL_CALLS` per call.
- **Timeouts:** Retell waits for each function as long as its `timeout_ms` (10 s recommended). The functions only run bounded catalog queries: at most 3 trips per search, 10 departures and 12 list items.
- **Logging:** request bodies, transcripts and arguments are never logged or stored. Only rejected signatures (without the body) and unexpected tool failures are logged. The per-call tool count and the recommended trip ids live in the cache for at most 2 hours.

---

## 10. Automated tests

| Test file | Covers |
| --- | --- |
| `tests/Feature/SalesAssistantToolsTest.php` | all five functions through signed Retell calls: filters, empty results, invalid input, unknown trips, availability, missing and outdated prices, booking-calculator pricing, backend failure, no internal fields |
| `tests/Feature/SalesAssistantRetellFunctionsTest.php` | the signature on every endpoint (missing, wrong key, tampered, stale), the agent check, the payload shape, the per-call budget and rate limit, safe rejection logging |
| `tests/Feature/SalesAssistantRetellConfigTest.php` | the generated Retell configuration matches the server's tools |
| `tests/Unit/RetellSignatureTest.php` | the signature scheme |

Run them with:

```bash
cd backend && php artisan test --filter='SalesAssistant|RetellSignature'
```
