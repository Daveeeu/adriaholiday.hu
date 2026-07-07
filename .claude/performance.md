# Performance Guidelines

## Purpose

This document defines performance standards for the AdriaHoliday platform.

Performance is a feature.

Every implementation should scale from hundreds to tens of thousands of records without major architectural changes.

Never optimize prematurely.

Always optimize intentionally.

---

# Core Principles

Priority

Correctness

↓

Maintainability

↓

Performance

↓

Micro Optimizations

Always measure before making complex optimizations.

---

# Backend Performance

## Database Queries

Always inspect query count.

Avoid:

- duplicated queries
- N+1 queries
- unnecessary eager loading
- loading unnecessary columns

---

## Eager Loading

Bad

```php
$apartments = Apartment::all();

foreach ($apartments as $apartment) {
    echo $apartment->region->name;
}
```

Good

```php
$apartments = Apartment::query()
    ->with('region')
    ->paginate();
```

---

## withCount()

Instead of

```php
$count = $apartment->bookings->count();
```

Use

```php
Apartment::withCount('bookings');
```

---

## exists()

Instead of

```php
User::where(...)->count() > 0
```

Use

```php
User::where(...)->exists()
```

---

## Select Only Needed Columns

Avoid

```php
Apartment::all();
```

Prefer

```php
Apartment::select([
    'id',
    'name',
    'slug'
]);
```

when only those fields are required.

---

## Pagination

Never return huge datasets.

Always paginate list endpoints.

Default

```txt
20
```

Maximum

```txt
100
```

---

## Search

Searching should happen in SQL.

Never fetch everything then filter in PHP.

Bad

```php
Apartment::all()
    ->filter(...)
```

Good

```php
Apartment::query()
    ->where(...)
```

---

## Sorting

Sorting belongs in SQL.

Never sort thousands of records in PHP.

---

## Transactions

Use transactions only when needed.

Do not wrap read-only operations.

---

## Caching

Cache only expensive operations.

Examples

- homepage content
- settings
- destination lists
- SEO data

Avoid caching highly dynamic admin data.

---

## Queue Long Operations

Use queues for:

- image processing
- external API calls
- email sending
- imports
- exports

Never block HTTP requests unnecessarily.

---

## Images

Always optimize uploaded images.

Generate thumbnails when appropriate.

Never send full-resolution images to admin tables.

---

## API Resources

Return only required fields.

Avoid huge nested responses.

Example

Bad

Apartment

↓

Bookings

↓

Customer

↓

Invoices

↓

Payments

Good

Apartment

↓

Booking Count

↓

Cover Image

---

# Frontend Performance

## React Components

Components should render only what they need.

Avoid unnecessary state.

Avoid unnecessary props.

---

## React Query

Use caching.

Do not manually cache API responses.

Use:

- staleTime
- invalidateQueries
- refetchOnWindowFocus when appropriate

---

## Memoization

Use

```
memo
```

```
useMemo
```

```
useCallback
```

only when profiling justifies it.

Do not wrap everything in memo.

---

## Lists

Never render huge lists.

Use pagination.

If needed,

consider virtualization.

---

## Derived State

Avoid storing derived state.

Bad

```tsx
const [fullName, setFullName] = useState('');
```

Good

```tsx
const fullName = `${firstName} ${lastName}`;
```

---

## API Calls

Avoid duplicate API requests.

Reuse existing queries.

Do not fetch the same data multiple times.

---

## Lazy Loading

Lazy load:

- large pages
- editors
- charts
- media-heavy views

Avoid loading rarely used modules on startup.

---

## Bundle Size

Avoid unnecessary dependencies.

Before installing a package ask:

Can existing code solve this?

Smaller bundle wins.

---

## Images

Use appropriately sized images.

Never load original images into tables.

Use thumbnails.

---

## Icons

Reuse existing icon libraries.

Do not import entire libraries.

Import only required icons.

---

## Tables

Admin tables should support:

- pagination
- server-side search
- server-side sorting
- loading state

Never load thousands of rows.

---

## Forms

Large forms should be split.

Avoid unnecessary rerenders.

---

# Network Performance

Compress responses.

Use gzip or Brotli.

Keep JSON responses small.

Avoid unnecessary nested objects.

---

# Database Indexes

Create indexes for:

- foreign keys
- slug
- search columns
- frequently sorted columns

Review indexes before large features.

---

# Logging

Avoid excessive logging.

Logs should not become a performance bottleneck.

---

# Monitoring

Monitor:

- slow queries
- failed jobs
- queue time
- API response times
- page load time

---

# Performance Review Checklist

Before finishing verify:

☐ No N+1 queries

☐ Pagination exists

☐ Server-side filtering

☐ Server-side sorting

☐ Small API responses

☐ Images optimized

☐ No unnecessary rerenders

☐ Queries eager loaded

☐ Appropriate indexes

☐ Bundle impact acceptable

---

# Definition of Done

Performance work is complete only when:

✅ No obvious bottlenecks remain

✅ Database queries are efficient

✅ React rendering is efficient

✅ API responses are minimal

✅ Images are optimized

✅ Large datasets are paginated

✅ Implementation scales with future growth