# Security Guidelines

## Purpose

This document defines the security standards for the AdriaHoliday platform.

Security is not optional.

Every feature must be secure by default.

Never trade security for convenience.

---

# Core Principles

Always assume:

- requests are malicious
- users manipulate requests
- frontend can be modified
- APIs are publicly accessible
- uploaded files are untrusted

Never trust user input.

---

# Trust Boundary

Frontend is NEVER trusted.

Everything must be validated again by Laravel.

Never rely on:

- hidden buttons
- disabled inputs
- frontend validation
- frontend permissions

Backend is always authoritative.

---

# Authentication

Authentication is handled only by Laravel Sanctum.

Never implement custom authentication.

Never expose authentication tokens.

Never log tokens.

Never return tokens unnecessarily.

---

# Authorization

Every protected endpoint requires authorization.

Always use:

- Policies
- Gates
- Spatie Permission

Never trust the frontend.

Example

Wrong

User cannot see Delete button.

↓

Delete endpoint has no permission check.

Correct

Delete endpoint checks permission regardless of frontend.

---

# Validation

Every request must be validated.

Never use

```php
$request->all()
```

Always use

```php
$request->validated()
```

Validation belongs inside Form Requests.

---

# Mass Assignment

Never mass assign unknown fields.

Wrong

```php
Apartment::create($request->all());
```

Correct

```php
Apartment::create($request->validated());
```

Use fillable carefully.

Avoid

```php
protected $guarded = [];
```

---

# SQL Injection

Always use Eloquent or Query Builder.

Never concatenate SQL manually.

Wrong

```php
DB::select("SELECT * FROM users WHERE id = $id");
```

Correct

```php
User::find($id);
```

or

```php
DB::table('users')
    ->where('id', $id)
    ->first();
```

---

# XSS

Never trust HTML input.

Escape output.

Sanitize rich text if HTML is allowed.

Never use

```jsx
dangerouslySetInnerHTML
```

unless absolutely necessary.

---

# CSRF

All state-changing requests must be protected.

Do not disable CSRF protection.

---

# File Uploads

Treat every upload as malicious.

Validate:

- mime type
- extension
- file size

Never trust original filenames.

Rename uploaded files automatically.

Always use Spatie Media Library.

---

# Storage

Never expose storage paths.

Never expose private uploads publicly.

Public media should be intentionally published.

Private media should require authorization.

---

# Passwords

Never store plaintext passwords.

Never log passwords.

Never return passwords.

Always use Laravel hashing.

---

# Secrets

Never commit

- .env
- API keys
- secrets
- private keys
- certificates

If exposed,

Rotate immediately.

---

# Logging

Never log:

- passwords
- tokens
- API secrets
- cookies
- session IDs

Logs should contain only useful diagnostic information.

---

# Error Messages

Users should never see:

- SQL errors
- stack traces
- exception classes
- filesystem paths

Unexpected errors should be logged internally.

---

# API Responses

Never expose

- internal IDs unnecessarily
- hidden attributes
- sensitive configuration
- debug information

Always return Resources.

---

# Permissions

Permissions belong to backend.

Frontend permission checks improve UX only.

Backend must verify every action.

---

# Rate Limiting

Protect sensitive endpoints.

Examples

- login
- password reset
- upload
- search
- public APIs

Never allow unlimited requests.

---

# Brute Force

Authentication endpoints should support throttling.

Repeated failures should be limited.

---

# Session Security

Sessions should:

- expire appropriately
- regenerate after login
- invalidate after logout

---

# Cookies

Sensitive cookies should use:

- HttpOnly
- Secure
- SameSite

Never expose authentication cookies to JavaScript.

---

# HTTPS

Production always uses HTTPS.

Never hardcode HTTP URLs.

Redirect HTTP to HTTPS.

---

# CORS

Allow only trusted origins.

Never use

```
*
```

for authenticated APIs.

---

# Dependencies

Keep dependencies updated.

Avoid abandoned packages.

Review new packages before installation.

Never install packages without understanding their purpose.

---

# Third-Party APIs

Store credentials in environment variables.

Validate external responses.

Handle timeouts.

Handle failures gracefully.

---

# Database Security

Use least privilege.

Application database user should only have required permissions.

Never use root credentials.

---

# Soft Deletes

When appropriate,

prefer SoftDeletes.

Avoid irreversible deletion of business data.

---

# Backups

Sensitive backups must be protected.

Never expose SQL dumps publicly.

Never commit backups.

---

# Admin Features

Admin endpoints require authentication.

Admin endpoints require authorization.

Admin UI should never bypass backend validation.

---

# React Security

Never trust browser state.

Never store sensitive information in localStorage unless absolutely necessary.

Avoid exposing internal API details.

---

# Content Security

User-generated content should be sanitized.

Never assume uploaded content is safe.

---

# Security Headers

Production should enable:

- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy (where appropriate)

---

# Review Checklist

Before merging verify:

☐ Validation exists

☐ Authorization exists

☐ No mass assignment

☐ No SQL injection risk

☐ No XSS risk

☐ No sensitive logging

☐ HTTPS enforced

☐ File uploads validated

☐ Secrets not committed

☐ API responses sanitized

☐ Permissions enforced

☐ Dependencies reviewed

---

# Definition of Done

Security is complete only when:

✅ Every request is validated

✅ Every protected action is authorized

✅ Sensitive data is protected

✅ No obvious security risks remain

✅ Production defaults are secure