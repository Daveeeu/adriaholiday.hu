# Backend Guidelines

## Purpose

This document defines backend rules for the AdriaHoliday Laravel API.

The backend is the source of truth.

Never trust the frontend.

Never place business logic in the frontend that must be enforced by the system.

---

# Backend Location

The backend application is located in:

```txt
/backend
```

All API, database, validation, authorization, media, permission and business logic work belongs here.

---

# Technology

Backend stack:

- Laravel
- PHP
- MySQL
- Laravel Sanctum
- Spatie Permission
- Spatie Media Library
- Spatie Activity Log

---

# Core Principles

Always prioritize:

1. Correctness
2. Security
3. Maintainability
4. Architecture
5. Performance
6. Developer Experience

Never implement quick hacks.

Never bypass Laravel conventions unless there is a strong reason.

---

# Layer Responsibilities

## Controllers

Controllers must stay thin.

Allowed responsibilities:

- Receive request
- Authorize action
- Call Form Request validation
- Call Service / Action
- Return Resource / JSON response

Controllers must NOT contain:

- Business logic
- Complex queries
- File upload handling logic
- Permission logic
- Data transformation logic
- Large condition trees

Bad:

```php
public function store(Request $request)
{
    $apartment = Apartment::create($request->all());

    if ($request->hasFile('image')) {
        $apartment->addMediaFromRequest('image')->toMediaCollection('images');
    }

    return response()->json($apartment);
}
```

Good:

```php
public function store(StoreApartmentRequest $request, ApartmentService $service)
{
    $apartment = $service->create($request->validated());

    return new ApartmentResource($apartment);
}
```

---

## Form Requests

All validation belongs in Form Request classes.

Never validate directly in controllers unless the endpoint is extremely small and temporary — but temporary endpoints should generally not exist.

Use:

```php
StoreApartmentRequest
UpdateApartmentRequest
StoreTourRequest
UpdateTourRequest
```

Every Form Request should include:

- rules()
- authorize()
- messages() only if needed
- attributes() only if needed

Authorization may be delegated to policies or permission checks.

---

## Services

Business logic belongs in Services.

Examples:

```txt
ApartmentService
TourService
BookingService
BlogPostService
HomepageOfferService
MediaService
UserService
```

Services should:

- coordinate database writes
- handle transactions
- enforce business rules
- call model methods
- dispatch events if needed
- remain reusable

Services should not:

- return HTTP responses
- depend on controllers
- know about React
- know about frontend components

---

## Actions

Use Actions for focused single-purpose operations.

Examples:

```txt
CreateApartmentAction
UpdateApartmentMediaAction
PublishBlogPostAction
ReorderHomepageOffersAction
```

Use Actions when logic is reusable or complex enough to deserve a dedicated class.

---

## Models

Models represent database entities.

Models may contain:

- relationships
- casts
- scopes
- accessors
- mutators
- simple helpers

Models should not contain large business workflows.

Avoid fat models.

---

## API Resources

Every API response should use Laravel Resources.

Never return raw Eloquent models.

Use:

```php
ApartmentResource
TourResource
BookingResource
MediaResource
UserResource
```

Resources should define the public API contract.

Never expose:

- hidden columns
- internal notes
- tokens
- raw permission internals
- unnecessary timestamps unless needed

---

# Response Format

Keep API responses consistent.

For single resources:

```json
{
  "data": {}
}
```

For collections:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "perPage": 20
  }
}
```

For admin lists, keep compatibility with the current admin format if already used:

```json
{
  "items": [],
  "totalCount": 0,
  "page": 1,
  "perPage": 20
}
```

Never randomly introduce a new response shape.

Before changing response formats, inspect existing frontend expectations.

---

# Pagination

All list endpoints must support pagination unless there is a strong reason not to.

Use query parameters:

```txt
page
perPage
search
sort
direction
```

Default:

```txt
page = 1
perPage = 20
```

Maximum:

```txt
perPage = 100
```

Never return huge unpaginated lists.

---

# Filtering and Sorting

Filtering and sorting should be explicit.

Allowed example:

```txt
GET /api/admin/apartments?search=sea&sort=name&direction=asc
```

Never allow arbitrary database column sorting without a whitelist.

Use allowed sort fields:

```php
$allowedSorts = ['id', 'name', 'created_at', 'updated_at'];
```

---

# Database Rules

Use migrations for every schema change.

Never manually change production schema.

Every migration should be reversible when reasonable.

Always add indexes for:

- foreign keys
- frequently filtered columns
- frequently sorted columns
- slug columns
- status columns where useful

Use foreign key constraints where appropriate.

---

# Transactions

Use transactions for multi-step writes.

Examples:

- creating apartment with media
- updating booking status with logs
- deleting entity with relations
- reordering records
- syncing permissions

Example:

```php
return DB::transaction(function () use ($data) {
    $apartment = Apartment::create($data);

    // related writes

    return $apartment;
});
```

Never leave the database in partial state.

---

# Query Performance

Avoid N+1 queries.

Always eager load needed relationships.

Bad:

```php
$apartments = Apartment::all();

foreach ($apartments as $apartment) {
    $apartment->region->name;
}
```

Good:

```php
$apartments = Apartment::query()
    ->with('region')
    ->paginate();
```

Use `withCount()` for counts.

Use `exists()` instead of `count() > 0`.

Select only needed columns when useful.

---

# Authorization

Authorization is mandatory.

Every protected endpoint must enforce permissions.

Frontend permission checks are only for UX.

Backend permission checks are authoritative.

Use:

- Policies
- Gates
- Spatie Permission

Never rely only on hidden buttons in the frontend.

---

# Spatie Permission

Use permissions consistently.

Permission naming format:

```txt
resource.action
```

Examples:

```txt
apartments.view
apartments.create
apartments.update
apartments.delete

tours.view
tours.create
tours.update
tours.delete

bookings.view
bookings.update
```

Avoid inconsistent names like:

```txt
edit apartment
can_delete_tours
tour.manage
```

---

# Authentication

Use Laravel Sanctum for API authentication.

Never implement custom token handling unless required.

Never expose tokens in logs.

Never store tokens in plain text outside Sanctum mechanisms.

---

# Validation Rules

Validation should be strict.

Prefer explicit rules.

Example:

```php
'name' => ['required', 'string', 'max:255'],
'slug' => ['required', 'string', 'max:255', Rule::unique('apartments')->ignore($apartment)],
'is_active' => ['required', 'boolean'],
```

Never accept uncontrolled arrays without validating nested keys.

Bad:

```php
'metadata' => ['array']
```

Better:

```php
'metadata' => ['nullable', 'array'],
'metadata.title' => ['nullable', 'string', 'max:255'],
'metadata.description' => ['nullable', 'string', 'max:500'],
```

---

# File Uploads

All media uploads should go through Spatie Media Library.

Never manually move uploaded files unless explicitly required.

Validate files:

```php
'image' => ['nullable', 'image', 'max:5120'],
'file' => ['nullable', 'file', 'max:10240'],
```

Always validate:

- file type
- size
- required dimensions if relevant
- collection name if passed from request

Never trust original filename.

---

# Media Library

Use consistent media collections.

Examples:

```txt
images
gallery
cover
documents
```

Avoid random collection names.

Bad:

```txt
img
pics
apartmentPhotos
```

Media response should go through `MediaResource`.

Do not expose raw storage paths when unnecessary.

---

# Deleting Records

Prefer soft deletes for business entities if recovery matters.

Use hard deletes only when safe.

Before deletion, consider:

- related bookings
- media files
- activity logs
- foreign key constraints
- public website references

Never delete important business data without checking dependencies.

---

# Activity Log

Use Spatie Activity Log for meaningful admin actions.

Log:

- create
- update
- delete
- publish
- unpublish
- status changes
- permission changes

Do not log noisy events without value.

Logs should help answer:

- who changed it
- what changed
- when it changed
- why it matters

---

# Exceptions

Never expose raw exceptions to users.

Use custom exceptions when helpful.

Unexpected exceptions should be logged.

Validation errors should return 422.

Authorization errors should return 403.

Unauthenticated requests should return 401.

Missing resources should return 404.

---

# HTTP Status Codes

Use correct status codes:

```txt
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Server Error
```

Never return 200 for failed operations.

---

# Routes

Admin API routes should be grouped clearly.

Example:

```php
Route::middleware(['auth:sanctum'])
    ->prefix('admin')
    ->group(function () {
        Route::apiResource('apartments', ApartmentController::class);
    });
```

Keep routes readable.

Avoid defining business logic in route closures.

---

# Naming Conventions

Use clear names.

Controllers:

```txt
ApartmentController
TourController
BookingController
```

Requests:

```txt
StoreApartmentRequest
UpdateApartmentRequest
```

Services:

```txt
ApartmentService
BookingService
```

Resources:

```txt
ApartmentResource
TourResource
```

Models:

```txt
Apartment
Tour
Booking
```

Never use unclear abbreviations.

---

# DTOs

Use DTOs when request data becomes complex.

DTOs are useful for:

- complex nested forms
- booking logic
- pricing logic
- multi-step operations
- imports

Do not create DTOs for trivial CRUD unless they improve clarity.

---

# Enums

Use PHP enums for fixed values.

Examples:

```php
enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
}
```

Avoid magic strings scattered across the codebase.

---

# Constants

Use constants only when enums are not appropriate.

Never duplicate the same string values across multiple files.

---

# Seeders

Seeders should create realistic development data.

Never seed production-only secrets.

Never hardcode private credentials.

Keep seeders idempotent where possible.

---

# Factories

Use factories for tests and development data.

Every major model should have a factory when tests need it.

---

# Testing

Backend features should have tests when possible.

Test:

- validation
- authorization
- successful creation
- successful update
- deletion
- filtering
- pagination
- important business rules

Do not only test happy paths.

---

# Laravel Commands

Use Artisan commands for repeatable backend operations.

Examples:

- import data
- cleanup stale records
- regenerate cache
- sync external content

Commands should be safe to rerun when possible.

---

# Legacy Content Import (adriaholiday.hu)

The old adriaholiday.hu site (custom PHP CMS, no API/sitemap) is imported via:

```txt
php artisan adria:import-offers
    {--dry-run}
    {--limit=}
    {--slug=*}          (repeatable: --slug=a --slug=b)
    {--country=*}       extra legacy country slug for the selected offers
    {--category=*}      extra legacy tour group slug for the selected offers
    {--update-existing}
```

Split into single-purpose services under `App\Services\Legacy` (never put scraping/parsing/import logic in the command itself):

- `LegacyAdriaOfferCrawler` — discovers offer URLs by walking the two tour group listing pages and their per-country sub-pages (no sitemap exists); rate-limited HTTP fetch with UA header.
- `LegacyAdriaOfferParser` — pure HTML → `App\Support\Legacy\LegacyOfferData` DTO, no I/O. A discounted date shows the struck-through original price first; the parser takes the last (bookable) price as `price` and the struck one as `original_price` (→ `tour_dates.price_box_original_price`, shown struck through). The red note under a price becomes the date's `label` (→ `price_box_label`: "Előfoglalási akció", "Őszi szünet"), except "Betelt", which marks the date `sold_out` — the only status the import sets; an existing date's other statuses are the admin's. A date without a legacy id (no booking button) is closed for booking: its `extras` are `null` (unknown), not an empty list.
- `LegacyOfferProgramReader` — reads the program tab, which has no structured "program days" / "price includes" sections: everything is `<p>` blocks in one rich-text tab, classified paragraph by paragraph and line by line. `"N. NAP Title"` starts a day, and free paragraphs after it continue that day (London's "a.) … f.)" options, offers written as heading + paragraph per day); after the last day only when every earlier day continued too, otherwise they are notes. Section headings (`"Részvételi díj"`, `"Az ár tartalmazza"`, `"(további) költségek merülhetnek fel"`, `"Csatlakozási lehetőség(ek)"`, `"…kedvezmény…"`) may share one paragraph, a price list may go on in the next paragraph, a bulleted list ends at its first unbulleted line, and `"Részvételi díj …, mely tartalmazza …. Nem tartalmazza …"` prose yields one included and one excluded item. Lines split on every `<br>` form (`<br style="…" />` too).
- `LegacyBookingOptionsParser` — pure parser for the per-date booking options the legacy booking form loads from `roundtrip/get_datas?offer_date_id=…` (departure place `<option>`s and the extras block). The command fetches them through the crawler (`fetchBookingOptions()` with the ids from `LegacyAdriaOfferParser::legacyDateIds()`) and hands the raw responses to the parser, so parsing stays I/O-free. The crawler also fetches a one-passenger quote from `roundtrip/get_roundtrip_price` (it needs every form field, or it answers with PHP notices), which carries the resort fee (forint → mandatory extra, euro → "not included" price item payable on site) and the Last Minute percentage (→ date discount badge). Checked + readonly extras are mandatory; the single room supplement (`data-name="single_bad"`) becomes a `solo_traveller` extra with the legacy alone/roommate choices; "Ft/fő" prices are per person, bare "Ft" per booking. A departure place priced above the date's price (e.g. BOK csarnok) gets the difference as its per-tour fee. Newly imported tours accept coupons, like every legacy tour did. Countries and categories come only from the crawl context (the listing pages an offer appears on): the offer page's breadcrumb names a single country and never the tour group. A `--slug` import therefore resolves its context with `LegacyAdriaOfferCrawler::discoverOfferContexts()`, which walks the same listing pages once for every selected offer; an offer listed nowhere gets an empty context, and an update then keeps the tour's existing countries and region.
- `LegacyMediaImporter` — downloads an image into the existing `AdminMediaItem` + Spatie `library` collection pattern (same one `MediaController::store` uses), deduping by `custom_properties.legacy_url` so re-imports and shared images never re-download.
- `LegacyTourImporter` — resolves `Region` / `TourReferenceOption` (country/category/tag/travel-mode) / `TourDeparturePlace`, then persists via `App\Services\Tour\TourContentSyncService` — the same service `TourController` uses for admin edits, so imported and admin-entered tours go through identical rules.

Idempotency: tours are matched by `seo_name`. Without `--update-existing`, an existing tour is skipped (never overwrites admin edits); with it, the tour's legacy content is refreshed via `TourContentSyncService` — never duplicated. Dates are matched by start and end date and updated in place, so bookings keep their `tour_date_id` and admin-managed date fields (status, available seats, capacity) survive; program days, gallery and price items are replaced. What the legacy site cannot know is kept: categories are merged (e.g. "Repülős körutazások" added on the new site stays), and once a tour is closed for booking (no date has a legacy id) its extras, departure places, travel mode, catering and accommodation are left as they are. `--dry-run` never touches the DB or downloads images; it only prints what the parser extracted.

Run `php artisan adria:import-offers --update-existing` to bring every tour in line with the legacy site again (it also creates offers added there since).

The listing pages do not show everything the legacy admin (`/admin/?p=roundtrip`) marks active: school trips ("Osztálykirándulás") are listed nowhere, and an offer's other groups (e.g. also a school trip) or the "Repülős utak" admin region never appear in its crawl context. Import those with `--slug` plus `--country` / `--category`, which are added to the crawl context: e.g. `--country=belfold --category=osztalykirandulas` for the domestic school trips, `--category=repulos-utak` for the flight tours (→ "Repülős körutazások"). Group slugs map to categories in `LegacyAdriaOfferParser::CATEGORY_NAMES`, country slugs to countries in `LegacyCountryDictionary`.

Config: `config('services.legacy_adria')` (`LEGACY_ADRIA_BASE_URL`, `LEGACY_ADRIA_USER_AGENT`, `LEGACY_ADRIA_DELAY_MS`, `LEGACY_ADRIA_TIMEOUT`).

---

# Tour Date Extras and Booking Pricing

Priced supplements ("felárak": dinner, single room, baggage, resort fee…) are `TourDateExtra` records owned by a `TourDate`, because prices differ between departures of the same tour. Each has a `price`, a `price_unit` (`App\Support\Tour\TourExtraPriceUnit`: `per_person` / `per_booking`), a `charge_rule` (`App\Support\Tour\TourExtraChargeRule`: `optional` = when selected, `mandatory` = always, `solo_traveller` = automatically when exactly one passenger travels, e.g. the single room supplement) and optional `choices` the customer must pick from once the extra is charged (single room: alone / find me a roommate). They are written only through `TourContentSyncService::syncDates()` as `dates[].extras[]` (admin form, duplicate and legacy import alike). `syncDates()` updates a date in place when it matches a stored one — by `id` (the admin form sends it), else by start and end date — because bookings reference `tour_dates`; dates left out are soft-deleted (`Booking::tourDate()` still resolves them). A date's extras are replaced whenever `extras` is present, so never reference a `TourDateExtra` id from other tables.

A departure place can carry a per-tour fee on the `tour_departure_place_tour` pivot (`TourContentSyncService::syncDeparturePlaces()`), overriding the place's general `fee` on that tour only. Travel and cancellation insurance rates live in the `booking` site settings group (`App\Support\Booking\BookingInsuranceSettings`, editable on the admin settings page).

Public bookings are priced on the server by `App\Services\Booking\TourBookingPriceCalculator` from a `TourBookingSelection`: base price × passengers − the price box discount badge (date badge, else tour badge — the same percentage the public price box shows, used for Last Minute discounts) + departure fee × passengers + charged extras − coupon = trip total; + travel insurance (daily fee × passengers × travel days) + cancellation insurance (percentage of the trip total, only while departure is at least the configured days away) = total. It rejects departure places that are not active places of the tour (one is required when the tour has any), extras of other dates, missing extra choices, unavailable insurances and invalid coupons. `PublicBookingService` redeems the coupon inside the booking transaction (row lock, marked `used`), and stores `bookings.total_amount` plus a snapshot in `payload.pricing`, which the admin booking detail and the office notification email display; the portfolio frontend (`src/app/booking/booking-pricing.ts`) only previews the same rules.

Group quote requests for a custom date (min. `TourInquiry::MIN_PASSENGERS` = 20 people) go to `POST /api/tour-inquiries` (`TourInquiryService`), stored as `booking_type = tour_inquiry` with the requested period in `arrival`/`departure`. Tours without scheduled dates show only this form on the public site.

---

# Online Booking Payment (Barion)

Tour bookings are paid online through the Barion Smart Gateway right after booking. `App\Services\Booking\BookingPaymentService` owns the flow; `App\Services\Payment\Barion\BarionClient` is the only class that talks to Barion (v2 `Payment/Start`, v4 `Payment/{id}/PaymentState`, POSKey in the `x-pos-key` header). Credentials live in `config/services.php` → `barion` (`BARION_ENVIRONMENT` = `test`/`prod`, `BARION_POS_KEY`, `BARION_PAYEE_EMAIL`, optional `BARION_REDIRECT_URL`, default `APP_URL/fizetes/eredmeny`). Without a POSKey and payee online payment is off and bookings behave as before.

How much is paid online is admin-configurable in the `booking` site settings group (`App\Support\Booking\BookingPaymentSettings`: `online_payment_enabled`, `online_payment_kind` = `full`/`deposit`, `online_payment_deposit_percent`); HUF amounts are rounded to whole forints.

Every attempt is a `BookingPayment` row (`status`: `pending` → `started` → `succeeded`/`failed`, see `App\Support\Payment\BookingPaymentStatus`). `POST /api/bookings` returns the gateway URL as `paymentUrl` (null when nothing is paid online or Barion refused — the booking still stands as `unpaid`). Barion's callback (`POST /api/payments/barion/callback`) and the public result page (`GET /api/payments/barion/{paymentId}`) only trigger `BookingPaymentService::sync()`, which reads the state from Barion and credits `paid_amount` / `payment_status` (`paid` or `partial`) exactly once under row locks — never trust the incoming request. A failed attempt can be replaced via `POST /api/payments/barion/{paymentId}/retry`; an open or succeeded one cannot, so a booking never has two open payments. Payments are addressed by Barion's unguessable payment id, and the public payload carries no personal data.

Barion shop approval requirements met in code: the official Barion payment banner (`src/app/components/BarionPaymentBanner.tsx`, unmodified PNGs from design.barion.com in `src/assets/payment/`) shows in the footer whenever `online_payment_enabled` is on, and next to the pay button and on the result page when online payment is available; the Base Barion Pixel is injected server-side into the public SPA's `<head>` by `PortfolioSpaController` (`App\Services\Payment\Barion\BarionPixel`) once `booking.barion_pixel_id` is set in the admin — it must be in the served HTML because bp.js reads `window.barion_pixel_id` on the page load event; every public booking must accept the ÁSZF and the privacy policy (`terms_accepted`, stored as `payload.termsAcceptedAt`). The legal texts themselves (company data, Barion description, Barion Pixel in the privacy policy) are admin-edited site settings.

---

# Company Data and Legal Pages

The public contact details live in the `contact` site settings group (`App\Support\CompanyContact`: `phone`, `email`, `address`, `whatsapp`, `opening_hours`). The texts of the Kapcsolat, Impresszum, Adatvédelem, ÁSZF and Süti pages are `legal.*_content` settings of type `richtext` (`App\Support\LegalPageContent`); their defaults — taken over from the legacy adriaholiday.hu site — are HTML files in `backend/database/content/legal/`, read by both `SiteSettingsSeeder` and the `import_legacy_company_and_legal_content` data migration. `richtext` values are sanitized with `RichTextSanitizer` when stored (`SiteSetting::encodeValue()`) and again with `sanitizeRichTextHtml()` when rendered by `src/app/routes/StaticPage.tsx`; admins edit them with the rich text editor on the settings page.

---

# Newsletter Subscription (signup coupon)

Public `POST /api/newsletter/subscribe` (throttled via the `newsletter` rate limiter) creates a `NewsletterSubscriber` and issues it a one-time `Coupon` (code prefixed `HIR-`, `name: 'Hírlevél feliratkozás'` so it's identifiable in the admin Coupons list), then emails it via `NewsletterCouponMail`. All of this is orchestrated by `App\Services\Newsletter\NewsletterSubscriptionService`, which is idempotent — resubscribing an existing email is a no-op (no second coupon, no resend).

The coupon amount is admin-configurable via the `newsletter.coupon_value` `SiteSetting` (`is_public = true`, so the portfolio site can advertise the live amount instead of hardcoding it).

Mail sending + `EmailLog` auditing is shared via `App\Services\Mail\LoggedMailer` (also used by `BookingNotificationService`) — reuse it for any new transactional email instead of duplicating the send/log/catch logic.

---

# Tour Program PDF

Public `GET /api/portfolio/offers/{slug}/pdf` (throttled via the `offer-pdf` rate limiter) renders a downloadable PDF of an active tour's *current* data on demand — no PDF is ever stored; `PortfolioOfferPdfController` builds it synchronously per-request via `barryvdh/laravel-dompdf` (`Pdf::loadView('pdf.tour-program', [...])->download(...)`) from the `resources/views/pdf/tour-program.blade.php` template, using the same `TourMeta`/`PriceBoxData` helpers the portfolio resources use. 404s for unknown/inactive tours, same as `PortfolioOfferController::show`.

This is unrelated to the pre-existing `program_pdf_path`/`program_pdf_file`/`pdf` media-collection fields on `Tour`, which are a manual admin-upload attachment mechanism (a static file picked in the admin panel), not a generated one.

---

# Queues

Use queues for slow operations.

Examples:

- image processing
- external API sync
- email sending
- large imports
- notifications

Do not block HTTP requests with slow work.

---

# Cache

Use cache carefully.

Cache only when:

- data is expensive to compute
- invalidation is clear
- stale data is acceptable

Never cache permission-sensitive responses without considering user context.

---

# Configuration

Use `.env` for environment-specific values.

Never hardcode:

- domains
- API keys
- credentials
- storage paths
- mail credentials

Add config values to Laravel config files when used in code.

---

# Security Rules

Never trust request input.

Never expose internal implementation details.

Never mass assign unvalidated request data.

Bad:

```php
Model::create($request->all());
```

Good:

```php
Model::create($request->validated());
```

Use `$fillable` carefully.

Avoid `$guarded = []` unless the model is very controlled.

---

# Admin Safety

Admin actions can be destructive.

For destructive actions:

- validate permission
- check dependencies
- log activity
- return clear response

Never silently delete related data unless explicitly expected.

---

# API Versioning

Do not introduce API versioning unless required.

If introduced, do it consistently.

Avoid mixing versioned and unversioned endpoints randomly.

---

# Localization

If the project uses Hungarian content, keep user-facing messages consistent.

Backend validation messages may remain Laravel default unless custom Hungarian messages already exist.

Do not mix languages randomly in API responses.

---

# Documentation

When adding new backend patterns, update documentation.

Important new patterns belong in:

```txt
/.claude/backend.md
/.claude/architecture.md
```

---

# Backend Checklist

Before finishing backend work, verify:

- controller is thin
- validation exists
- authorization exists
- service/action contains business logic
- response uses Resource
- pagination is consistent
- no N+1 queries
- transactions wrap multi-write logic
- errors use correct status codes
- media uses Media Library
- activity log exists where useful
- tests pass
- no debug code remains
- code is production ready