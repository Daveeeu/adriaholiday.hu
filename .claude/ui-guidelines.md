# UI Guidelines

## Purpose

This document defines the UI and UX standards for the AdriaHoliday Administration Panel.

The objective is to build an interface that is:

- consistent
- predictable
- fast
- simple
- accessible
- scalable

Users should immediately understand how every page works.

---

# Design Philosophy

The UI should never surprise the user.

Every page should behave similarly.

Every CRUD should look similar.

Every interaction should be predictable.

---

# General Layout

The admin uses a consistent layout.

```
Sidebar

↓

Page Header

↓

Toolbar

↓

Table / Cards

↓

Side Panel
```

Avoid changing this flow.

---

# Sidebar

The sidebar is the primary navigation.

Rules:

- collapsible groups
- icons for every main item
- active page highlighted
- consistent spacing

Never create duplicate navigation items.

---

# Page Header

Every page should have:

Title

Optional description

Primary action button

Example

```
Apartments

Manage all apartments.

[ + New Apartment ]
```

---

# Toolbar

Toolbar should contain:

- search
- filters
- sorting
- refresh
- bulk actions (if applicable)

Do not overload the toolbar.

---

# CRUD Pages

Every CRUD page should follow:

```
Header

↓

Toolbar

↓

Table

↓

Side Panel
```

Avoid completely different layouts.

---

# Side Panels

The project standard is side panels.

Prefer

```
Create

↓

Right Side Panel

↓

Save

↓

Refresh
```

Instead of

```
Modal

↓

Modal inside modal

↓

Confirmation modal
```

Avoid modal stacking.

---

# Forms

Forms should be divided into logical sections.

Example

Apartment

- General
- Location
- Images
- SEO
- Settings

Long forms should never be one huge block.

---

# Buttons

Primary

Main action.

Examples

- Save
- Create
- Publish

Secondary

Navigation.

Examples

- Cancel
- Close
- Back

Danger

Only destructive actions.

Examples

- Delete
- Remove

Never use danger colors for normal actions.

---

# Icons

Icons should clarify actions.

Never replace labels with icons.

Good

```
🗑 Delete

✏ Edit

➕ Add
```

Bad

Only icon with unknown meaning.

---

# Tables

Tables should support when appropriate:

- pagination
- sorting
- search
- loading state
- empty state
- row actions

Columns should remain readable.

Avoid horizontal scrolling whenever possible.

---

# Table Actions

Keep actions consistent.

Preferred order

- View
- Edit
- Duplicate
- Delete

Danger actions should be separated visually.

---

# Empty States

Every empty list should explain:

What happened.

What the user can do.

Example

```
No blog posts found.

Create your first blog post.
```

---

# Loading States

Never show blank pages.

Use

- Skeletons
- Loaders
- Disabled controls

Users should always know something is happening.

---

# Error States

Error messages should explain:

- what failed
- what can be done

Bad

```
Error
```

Good

```
Failed to load apartments.

Please try again.
```

---

# Confirmations

Ask confirmation only for destructive actions.

Examples

- Delete apartment
- Delete booking
- Remove image

Do not confirm harmless actions.

---

# Search

Search should be visible.

Debounce input when appropriate.

Do not reload the entire application.

---

# Filters

Filters should remain visible.

Support reset.

Keep filter layout consistent.

---

# Pagination

Always show:

Current page

Total items

Rows per page

Keep pagination location consistent.

---

# Media

Images should support:

- preview
- upload progress
- remove
- reorder (when applicable)

Avoid tiny previews.

---

# Colors

Follow the project's design system.

Do not invent random colors.

Success

Green

Warning

Yellow

Danger

Red

Information

Blue

---

# Typography

Keep typography consistent.

Heading hierarchy

H1

Page title

H2

Section title

H3

Subsection

Avoid inconsistent font sizes.

---

# Spacing

Reuse spacing throughout the application.

Avoid arbitrary spacing values.

Consistency is more important than perfection.

---

# Responsive Design

The admin should remain usable on:

Desktop

Laptop

Tablet

Mobile support is secondary but should not completely break.

---

# Accessibility

Support:

- keyboard navigation
- visible focus states
- labels
- aria attributes where needed

Never rely only on color.

---

# Notifications

Success

Green

Error

Red

Warning

Yellow

Info

Blue

Messages should be short.

---

# Deleting

Deleting should:

Ask confirmation.

Explain consequences.

Show progress.

Refresh automatically.

---

# Bulk Actions

Bulk actions should always display:

Selected item count.

Affected action.

Confirmation when destructive.

---

# Forms

Save button should remain visible.

Validation errors should appear near the field.

Avoid large validation summaries.

---

# Consistency

Before creating:

- page
- table
- form
- card
- sidebar
- modal

Look for an existing implementation.

Reuse patterns.

---

# UX Principles

Users should never think:

"Where is this?"

"How does this work?"

Everything should be discoverable.

---

# Review Checklist

Before completing UI work verify:

- consistent spacing
- consistent typography
- responsive
- loading state
- empty state
- error state
- accessible
- reusable
- follows existing admin patterns

---

# Definition of Done

UI work is complete only when:

✅ Matches the existing design language

✅ Uses reusable components

✅ Responsive

✅ Accessible

✅ Predictable

✅ Consistent with other admin pages

✅ Production ready