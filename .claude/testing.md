# Testing Guidelines

## Purpose

This document defines the testing standards for the AdriaHoliday platform.

Every feature should be verifiable.

A feature is not complete because it compiles.

A feature is complete only when it has been validated.

---

# Core Philosophy

Testing exists to prevent regressions.

Always verify changes before committing.

Never assume code works because it looks correct.

Always verify.

---

# Testing Strategy

Testing should happen on multiple levels.

Development

↓

Static Analysis

↓

Formatting

↓

Linting

↓

Unit Tests

↓

Integration Tests

↓

Manual Verification

↓

Git Review

↓

Commit

---

# Before Every Commit

Always execute the project validation pipeline.

Never skip validation.

---

# Frontend Validation

Verify:

- project builds
- TypeScript passes
- ESLint passes
- formatting passes

Typical commands

```bash
npm install

npm run lint

npm run build
```

If tests exist

```bash
npm test
```

Never commit a frontend that does not build.

---

# Backend Validation

Verify:

- dependencies installed
- migrations valid
- routes valid
- application boots
- tests pass

Typical commands

```bash
composer install

php artisan optimize:clear

php artisan test
```

If static analysis exists

```bash
vendor/bin/phpstan analyse
```

If formatting exists

```bash
vendor/bin/pint
```

Never ignore backend failures.

---

# Backend Test Suite Rules

The full PHPUnit suite runs in about 5 minutes, locally and in CI
(`.github/workflows/checks.yml`). Keep it that way:

- **Own database file.** The tests use `backend/database/testing.sqlite`
  (`phpunit.xml`, created by `tests/bootstrap.php`, gitignored), never the
  development database. `RefreshDatabase` migrates it once per run and wraps
  each test in a transaction. Do not switch back to `:memory:`: it re-runs all
  migrations before every test.
- **No network.** `Tests\TestCase` calls `Http::preventStrayRequests()`: fake
  every HTTP call with `Http::fake()`. Code that fetches with
  `file_get_contents()` or curl bypasses the fake, so use the `Http` client.
  The demo seeders' photos (`SeedsMediaFromUrl`) are generated during tests,
  never downloaded.
- **No secrets from the machine.** A test must pass in a fresh checkout: no
  `storage/oauth-*.key`, no `.env` values. Generate what it needs (see
  `McpServerTest::passportKeys()`).
- **Deterministic factories.** Factory flags (`featured`, `active`,
  `cancelled`, …) have fixed defaults; a test that needs another value sets it.
  A random flag makes every test that forgets it flaky.

---

# Manual Verification

Always manually verify the implemented feature.

Examples

Apartment CRUD

Verify

- create
- update
- delete
- validation
- media upload
- search
- pagination

Do not only verify the happy path.

---

# CRUD Testing Checklist

Every CRUD should verify:

Create

Read

Update

Delete

Validation

Authorization

Pagination

Search

Sorting

Media

Permissions

---

# API Testing

Verify

Correct status codes

Validation errors

Authorization

Pagination

Sorting

Filtering

Resources

Error responses

---

# Authentication Testing

Verify

Login

Logout

Session expiration

Permission checks

Unauthorized access

Never assume authentication still works.

---

# Authorization Testing

Verify

Correct permission

Missing permission

Role changes

Unauthorized requests

Never test only administrator accounts.

---

# Media Testing

Verify

Upload

Preview

Replace

Delete

Validation

Large files

Invalid files

Broken uploads

---

# Frontend Testing

Verify

Loading state

Empty state

Error state

Responsive layout

Keyboard navigation

Dark mode if supported

---

# Forms

Every form should verify

Valid input

Required fields

Invalid input

Large values

Special characters

Repeated submission

Cancel action

---

# Tables

Verify

Pagination

Sorting

Filtering

Searching

Empty results

Large datasets

---

# Performance Testing

Verify

No duplicate API calls

No unnecessary rerenders

No obvious delays

No huge payloads

---

# Browser Testing

Minimum verification

Chrome

Latest stable

If major UI changes

Also verify

Safari

Firefox

Edge

where appropriate.

---

# Mobile Testing

Admin is desktop-first.

Still verify

tablet

small laptop

basic mobile layout

Nothing should completely break.

---

# Regression Testing

Whenever changing existing functionality,

verify related features.

Example

Changing apartment API

↓

Verify

Apartment list

Apartment form

Homepage offers

Media

Filters

Public website

---

# Error Handling

Verify

Network failure

Server error

Validation error

Unauthorized

Forbidden

404

Unexpected exception

Users should always receive a meaningful message.

---

# Logging Verification

Verify

Unexpected errors are logged.

Expected validation errors are not noisy.

No sensitive information is logged.

---

# Database Verification

Verify

Relationships

Transactions

Rollback safety

Soft deletes

Cascade behavior

Indexes still work

---

# Queue Testing

If queues are affected verify

Job dispatch

Job execution

Retries

Failure handling

---

# Deployment Verification

Before deployment verify

Website

Admin

API

Authentication

Scheduler

Queues

Media

Database

Logs

---

# Self Review

Before finishing every task ask

Did I actually verify this?

Or

Do I only think it works?

If unsure,

Test it.

---

# Final Validation Pipeline

Claude should perform

1.

Implementation

↓

2.

Formatting

↓

3.

Lint

↓

4.

Static analysis

↓

5.

Unit tests

↓

6.

Integration tests

↓

7.

Manual verification

↓

8.

Git diff review

↓

9.

Commit

↓

10.

Push

---

# Definition of Done

A feature is complete only when

✅ Project builds

✅ Formatting passes

✅ Lint passes

✅ Static analysis passes

✅ Tests pass

✅ Manual verification completed

✅ Git diff reviewed

✅ No regressions found

✅ Ready for production