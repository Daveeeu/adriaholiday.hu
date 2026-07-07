# Code Review Guidelines

## Purpose

This document defines how every implementation must be reviewed before it is considered complete.

Writing working code is not enough.

Every implementation must be reviewed as if another senior engineer will approve it.

Claude should review every completed task before committing.

---

# Review Mindset

Always assume there is a better implementation.

Do not stop at the first working solution.

Ask yourself:

- Can this be simpler?
- Can this be reused?
- Is this maintainable?
- Is this production ready?

If not,

Improve it before finishing.

---

# Architecture Review

Verify:

- business logic is in the correct layer
- controllers remain thin
- components remain small
- services are reusable
- hooks are reusable
- responsibilities are separated

Never approve architecture that mixes concerns.

---

# Duplicate Code

Always search for duplication.

Examples:

- duplicated validation
- duplicated queries
- duplicated API calls
- duplicated UI
- duplicated utility functions

If duplicate code exists:

Extract it.

---

# Naming Review

Check every new name.

Good names describe intent.

Examples

Good

ApartmentGallery

BookingStatusBadge

MediaUploader

Bad

Component2

NewPanel

Utils

Data

Never approve vague names.

---

# Readability

Ask:

Would a new developer understand this immediately?

Prefer

clear code

over

short code.

---

# Complexity

Review every function.

If a function feels complicated,

Split it.

Avoid:

- nested if statements
- giant switch statements
- very long methods
- huge React components

---

# React Review

Verify:

- no unnecessary state
- no duplicated state
- proper hooks
- proper typing
- reusable components
- no direct fetch calls

Components should primarily render UI.

---

# Backend Review

Verify:

- controller is thin
- validation exists
- authorization exists
- service contains business logic
- resources are used
- transactions where needed

Never approve business logic inside controllers.

---

# TypeScript Review

Reject:

any

unless unavoidable.

Verify:

- interfaces
- generics
- return types
- typed API responses

---

# API Review

Check:

consistent responses

status codes

validation

authorization

pagination

sorting

filtering

Never introduce inconsistent endpoints.

---

# Database Review

Review:

queries

indexes

transactions

foreign keys

N+1 queries

Always inspect eager loading.

---

# Performance Review

Ask:

Can this trigger unnecessary renders?

Can this trigger unnecessary queries?

Can this load too much data?

Can this be cached?

Avoid premature optimization.

But identify obvious problems.

---

# Security Review

Verify:

request validation

authorization

mass assignment

XSS risks

CSRF

authentication

permissions

Never trust frontend input.

---

# Media Review

Verify:

validation

file size

file type

Spatie Media Library usage

cleanup

Never manually move uploaded files without reason.

---

# UI Review

Verify:

consistent spacing

typography

colors

responsive layout

loading state

empty state

error state

keyboard accessibility

UI should match existing admin pages.

---

# Error Handling

Check:

API errors

validation errors

network errors

unexpected exceptions

No silent failures.

---

# Logging

Review:

unexpected exceptions

activity logs

error logs

Avoid noisy logging.

---

# Git Review

Before commit inspect:

git diff

Check:

unrelated files

temporary code

commented code

debug code

Never commit accidental changes.

---

# Documentation Review

If architecture changed,

Update documentation.

If workflow changed,

Update documentation.

If patterns changed,

Update documentation.

---

# Testing Review

Verify:

feature works

existing functionality still works

tests pass

No broken builds.

---

# Self Review Workflow

For every completed task:

1.

Read your own code.

↓

2.

Find weaknesses.

↓

3.

Improve implementation.

↓

4.

Repeat until no obvious improvements remain.

↓

5.

Run formatting.

↓

6.

Run lint.

↓

7.

Run tests.

↓

8.

Review Git diff.

↓

9.

Commit.

---

# Review Checklist

Before approving any implementation verify:

Architecture

☐ Correct layer

☐ Reusable

☐ No duplication

Backend

☐ Validation

☐ Authorization

☐ Resources

☐ Transactions

Frontend

☐ Typed

☐ Responsive

☐ Loading state

☐ Error state

☐ Empty state

Performance

☐ No N+1

☐ No unnecessary renders

☐ Reasonable bundle impact

Security

☐ Safe input

☐ Safe output

☐ No secrets

Code Quality

☐ Clean naming

☐ Readable

☐ Consistent

☐ No dead code

Git

☐ Diff reviewed

☐ Commit message correct

☐ Ready for deployment

---

# Definition of Done

A task is complete only when:

✅ Code works

✅ Architecture is clean

✅ No obvious improvements remain

✅ Review completed

✅ Tests pass

✅ Git is clean

✅ Documentation updated if necessary

✅ Implementation is production ready