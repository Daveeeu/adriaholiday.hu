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