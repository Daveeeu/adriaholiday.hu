# Coding Style

## Purpose

This document defines coding style rules for the AdriaHoliday repository.

The goal is simple:

Write code that is easy to read, easy to change and hard to break.

---

# Core Principles

Prefer clarity over cleverness.

Prefer explicit code over magic.

Prefer small files over huge files.

Prefer reusable logic over copy-paste.

Prefer boring, predictable solutions over complex abstractions.

---

# General Rules

Code must be:

- readable
- consistent
- strongly typed
- maintainable
- production ready

Never leave:

- TODO comments
- debug logs
- commented-out code
- unused imports
- unused variables
- dead files
- temporary hacks

---

# Naming

Use meaningful names.

Bad:

```ts
const d = getData();
const x = item.id;
```

Good:

```ts
const apartmentData = getApartmentData();
const selectedApartmentId = apartment.id;
```

Avoid abbreviations unless they are universally understood.

Bad:

```php
$apt;
$usr;
$cfg;
```

Good:

```php
$apartment;
$user;
$config;
```

---

# File Naming

Use consistent file names.

React components:

```txt
ApartmentFormPanel.tsx
BookingListPage.tsx
MediaUploader.tsx
```

Hooks:

```txt
useApartments.ts
useBookings.ts
useMediaUpload.ts
```

Utilities:

```txt
formatDate.ts
buildQueryParams.ts
```

Laravel classes:

```txt
ApartmentController.php
StoreApartmentRequest.php
ApartmentService.php
ApartmentResource.php
```

---

# Functions

Functions should do one thing.

Keep functions small.

Avoid long parameter lists.

Bad:

```ts
function createApartment(name, slug, price, region, status, images, description) {}
```

Good:

```ts
function createApartment(payload: CreateApartmentPayload) {}
```

---

# Return Early

Prefer early returns over deeply nested code.

Bad:

```ts
if (user) {
  if (user.isActive) {
    if (user.canEdit) {
      return true;
    }
  }
}
return false;
```

Good:

```ts
if (!user) {
  return false;
}

if (!user.isActive) {
  return false;
}

return user.canEdit;
```

---

# Comments

Do not explain obvious code.

Bad:

```ts
// Set loading to true
setLoading(true);
```

Good comments explain why:

```ts
// Keep deleted media IDs so the backend can remove them during update.
const deletedMediaIds = [];
```

Use comments only when they add real context.

---

# TypeScript Rules

Never use `any` unless absolutely unavoidable.

Prefer:

```ts
unknown
Record<string, unknown>
specific interfaces
generics
```

Always type API responses.

Bad:

```ts
const response = await api.get('/apartments');
```

Good:

```ts
const response = await api.get<PaginatedResponse<Apartment>>('/apartments');
```

---

# TypeScript Interfaces

Use clear interface names.

```ts
export interface Apartment {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}
```

For payloads:

```ts
export interface CreateApartmentPayload {}

export interface UpdateApartmentPayload {}
```

For forms:

```ts
export interface ApartmentFormValues {}
```

---

# Boolean Naming

Boolean variables should read naturally.

Good:

```ts
isLoading
isActive
hasPermission
canEdit
shouldShowPanel
```

Bad:

```ts
loading
active
permission
show
```

---

# React Components

Components should be small and focused.

A component should usually be under 250 lines.

If larger, split into:

- child components
- hooks
- utilities
- form sections

Bad:

```txt
ApartmentFormPanel.tsx
900 lines
```

Good:

```txt
ApartmentFormPanel.tsx
ApartmentDetailsSection.tsx
ApartmentMediaSection.tsx
ApartmentSeoSection.tsx
useApartmentForm.ts
```

---

# React Props

Define props explicitly.

```ts
interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onDelete: (apartment: Apartment) => void;
}
```

Avoid passing huge unrelated objects.

Avoid prop drilling when a local composition pattern is better.

---

# React State

Keep state as local as possible.

Server state belongs in React Query.

UI state belongs in React state.

Do not duplicate server state into local state unless necessary for forms.

---

# React Effects

Avoid unnecessary `useEffect`.

Do not use `useEffect` for derived state.

Bad:

```ts
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Good:

```ts
const fullName = `${firstName} ${lastName}`;
```

---

# API Calls

Never call `fetch` directly from components.

Use centralized API services.

Bad:

```ts
fetch('/api/admin/apartments');
```

Good:

```ts
apartmentService.getApartments();
```

---

# Error Handling

Never ignore errors.

Bad:

```ts
try {
  await save();
} catch {}
```

Good:

```ts
try {
  await save();
} catch (error) {
  handleApiError(error);
}
```

---

# Forms

Form logic should be cleanly separated.

Use:

- typed form values
- validation schema if available
- reusable fields
- clear submit handlers

Avoid giant submit functions.

---

# Styling

Use existing Tailwind patterns.

Do not invent random spacing or colors.

Reuse existing components.

Keep UI consistent between modules.

---

# Laravel Style

Follow Laravel conventions.

Use:

- Form Requests
- Resources
- Services
- Policies
- Migrations
- Factories
- Seeders

Avoid:

- huge controllers
- raw request arrays
- duplicated queries
- inline business logic

---

# PHP Naming

Use clear variable names.

Bad:

```php
$a = Apartment::find($id);
```

Good:

```php
$apartment = Apartment::findOrFail($id);
```

---

# PHP Types

Use type hints wherever possible.

```php
public function update(UpdateApartmentRequest $request, Apartment $apartment): ApartmentResource
```

Use return types.

Use constructor property promotion when clean.

---

# Arrays

Prefer explicit arrays.

Bad:

```php
$data = $request->all();
```

Good:

```php
$data = $request->validated();
```

---

# Conditionals

Avoid complex conditionals.

Extract readable methods.

Bad:

```php
if ($booking->status === 'pending' && $booking->paid_at !== null && !$booking->cancelled_at) {}
```

Good:

```php
if ($booking->canBeConfirmed()) {}
```

---

# Magic Strings

Avoid magic strings.

Bad:

```php
if ($status === 'confirmed') {}
```

Good:

```php
if ($status === BookingStatus::Confirmed) {}
```

Use enums where possible.

---

# Imports

Remove unused imports.

Keep imports clean.

Do not use fully qualified class names inline unless necessary.

---

# Formatting

Always run formatting before commit.

Frontend:

```bash
npm run lint
npm run format
```

Backend:

```bash
composer lint
composer format
```

Use the actual project commands if different.

---

# Consistency

Before adding a new pattern, search the codebase.

Follow the existing pattern unless it is clearly wrong.

If an existing pattern is bad, improve it consistently.

---

# Final Rule

Code should look like it was written by one careful senior developer.

Not by multiple rushed developers.

Not by an AI.

Not by copy-paste.