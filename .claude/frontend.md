# Frontend Guidelines

## Purpose

This document defines frontend development standards for the AdriaHoliday project.

It applies to:

```
/adria-admin
```

The goal is to build a clean, scalable, fast and maintainable React application.

The frontend should remain simple.

Complexity belongs in the backend whenever possible.

---

# Technology Stack

Frontend stack

- React
- TypeScript
- React Query
- React Router
- TailwindCSS
- Vite

Always follow the existing project architecture.

Do not introduce new frameworks without explicit approval.

---

# Core Principles

Always prioritize

1. Readability
2. Reusability
3. Maintainability
4. Consistency
5. Performance

Avoid clever code.

Avoid unnecessary abstractions.

---

# Folder Responsibilities

Example structure

```
src/

components/

pages/

hooks/

services/

types/

utils/

constants/

layouts/

routes/
```

Every folder should have one clear responsibility.

---

# Components

Components should be small.

Target size

100–250 lines

Maximum

400 lines

If a component grows too large:

Split it.

Never create 1000-line components.

---

# Component Responsibilities

Components should only:

- render UI
- receive props
- call hooks
- trigger actions

Components should NOT

- perform API requests directly
- contain business logic
- transform large datasets
- duplicate validation

---

# Hooks

Hooks contain reusable frontend logic.

Examples

```
useApartments()

useBookings()

usePagination()

useMediaUpload()

useSidebar()
```

Hooks should never render UI.

Hooks should be reusable.

---

# API Layer

Components never call fetch().

Components never call axios directly.

Instead

```
Component

↓

Hook

↓

Service

↓

API
```

Example

```
apartmentService.ts
```

```
bookingService.ts
```

```
blogService.ts
```

---

# React Query

Server state belongs inside React Query.

Never duplicate server state.

Use

- useQuery
- useMutation
- invalidateQueries

Do not manually refresh pages.

---

# Local State

Local UI state belongs in React.

Examples

- modal open
- sidebar open
- selected tab
- expanded rows

Do not store server state in useState.

---

# Forms

Forms should be isolated.

Separate

- form state
- validation
- submission
- API calls

Large forms should be split into sections.

Example

ApartmentForm

↓

General Section

↓

SEO Section

↓

Media Section

↓

Pricing Section

---

# Tables

Every table should support when appropriate

- pagination
- loading state
- empty state
- error state
- sorting
- searching

Avoid custom implementations if reusable components already exist.

---

# Side Panels

The admin uses side panels instead of excessive modals.

Prefer

```
List

↓

Open Side Panel

↓

Edit

↓

Save

↓

Refresh
```

Avoid nested modals.

---

# Loading States

Every async operation should display loading feedback.

Never leave users wondering.

Use

- skeletons
- loaders
- disabled buttons

---

# Empty States

Every list should support empty states.

Example

"No apartments found."

Provide useful actions whenever possible.

---

# Error Handling

Every API call should have proper error handling.

Never silently fail.

Display user-friendly messages.

Log unexpected errors if appropriate.

---

# Notifications

Use consistent notifications.

Success

```
Apartment created successfully.
```

Error

```
Failed to upload image.
```

Never expose backend exception messages.

---

# Routing

Use React Router.

Routes should remain organized.

Example

```
/apartments

/apartments/:id

/blog

/bookings
```

Avoid deeply nested routes unless necessary.

---

# TypeScript

Never use

```
any
```

Always type

- props
- responses
- hooks
- forms

Use interfaces for public contracts.

---

# Styling

Use TailwindCSS consistently.

Reuse spacing.

Reuse typography.

Reuse colors.

Avoid inline styles.

Avoid arbitrary values unless justified.

---

# Design Consistency

New pages should look like existing pages.

Reuse

- buttons
- cards
- tables
- inputs
- dialogs
- side panels

Never invent new UI patterns without reason.

---

# Accessibility

Every page should support

- keyboard navigation
- labels
- focus states
- semantic HTML

Use buttons as buttons.

Use links as links.

---

# Performance

Avoid unnecessary renders.

Use

- memo
- useMemo
- useCallback

only when profiling justifies it.

Do not optimize prematurely.

---

# File Uploads

Uploads should use reusable upload components.

Support

- progress
- preview
- validation
- error handling

Do not duplicate upload logic.

---

# Search

Searching should be debounced when appropriate.

Do not fire requests on every keystroke.

---

# Pagination

Pagination belongs to the API.

Frontend should request pages.

Never load thousands of records into memory.

---

# Sorting

Sorting should be handled by the backend whenever possible.

Frontend only displays sort state.

---

# Filtering

Filters should be reusable.

Prefer centralized filter components.

---

# Component Naming

Good

```
ApartmentCard

ApartmentFormPanel

ApartmentGallery

BookingTable
```

Bad

```
Card2

ComponentNew

PageX

Temp
```

---

# Reusability

Before creating

- component
- hook
- utility
- service

Search the project.

Reuse existing implementations whenever possible.

---

# Code Review Checklist

Before finishing frontend work verify

- no duplicated logic
- component size reasonable
- reusable hooks extracted
- proper typing
- loading states
- error states
- empty states
- responsive layout
- consistent UI
- no console.log
- no unused imports

---

# Definition of Done

Frontend work is complete only when

✅ Components are reusable

✅ Types are correct

✅ API integration works

✅ Loading states exist

✅ Error handling exists

✅ Empty states exist

✅ UI is consistent

✅ Responsive layout verified

✅ Lint passes

✅ Build succeeds

✅ Code is production ready