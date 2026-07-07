# Architecture

## Purpose

This document defines the architecture of the AdriaHoliday platform.

Every implementation must respect these rules.

Never introduce architectural inconsistencies.

If an existing implementation violates these rules, improve it whenever possible.

---

# Repository Structure

The repository contains three independent applications.

```
Repository
│
├── backend
│      Laravel API
│
├── adria-admin
│      React Administration Panel
│
├── src
│      Public Website
│
└── docs
```

These applications have different responsibilities.

Never mix their responsibilities.

---

# Applications

## Public Website

Location

```
/src
```

Purpose

Marketing website.

Contains

- Landing pages
- Apartment pages
- Blog
- SEO
- Contact pages

The public website must never contain administration logic.

---

## Administration Panel

Location

```
/adria-admin
```

Purpose

Internal management system.

Contains

- CRUD interfaces
- Dashboards
- Media management
- Booking management
- Apartment management
- Blog management
- Homepage management
- User administration

The admin panel communicates only through the backend API.

It never accesses the database directly.

---

## Backend API

Location

```
/backend
```

Purpose

Single source of truth.

Responsibilities

- Authentication
- Authorization
- Validation
- Business Logic
- Database
- Media
- Activity Log
- Permissions

No frontend-specific logic belongs here.

---

# Communication

Architecture flow

```
Browser

↓

React

↓

HTTP

↓

Laravel API

↓

Services

↓

Repositories / Models

↓

Database
```

Never bypass layers.

---

# Layer Responsibilities

## Controllers

Controllers should remain extremely small.

Responsibilities

- Receive request
- Validate request
- Authorize request
- Call Service
- Return Response

Controllers should never contain business logic.

---

## Requests

Validation belongs here.

Never duplicate validation.

Never validate inside controllers.

---

## Services

Business logic belongs here.

Examples

ApartmentService

BookingService

HomepageService

TourService

MediaService

UserService

Services should be reusable.

---

## Models

Models represent database entities.

Models should not become service classes.

Keep business logic outside models whenever possible.

---

## Resources

Every API response should use Resources.

Never expose models directly.

Never leak hidden attributes.

---

# Business Logic

Business logic should exist only once.

Never duplicate calculations.

Never duplicate booking logic.

Never duplicate pricing logic.

Never duplicate permission checks.

Reuse services.

---

# React Architecture

Pages

↓

Components

↓

Hooks

↓

API Client

↓

Laravel API

Components should never know how data is stored.

Components should never call fetch directly.

Always use the centralized API layer.

---

# Folder Responsibilities

Example

```
components/
```

Reusable UI.

---

```
pages/
```

Route-level pages.

---

```
hooks/
```

Reusable logic.

---

```
services/
```

HTTP communication.

---

```
types/
```

TypeScript types.

---

```
utils/
```

Pure utility functions.

---

```
constants/
```

Application constants.

---

Never mix responsibilities.

---

# API Rules

Every endpoint should

- validate
- authorize
- log if necessary
- return Resources
- return proper status codes

Never return raw exceptions.

Never return HTML.

Never return inconsistent JSON.

---

# Authentication

Authentication belongs only to Laravel.

Frontend stores authentication state.

Permissions are always validated by backend.

Frontend permission checks exist only for UI.

Backend remains authoritative.

---

# Authorization

Never trust frontend permissions.

Always validate permissions on backend.

Every protected action requires authorization.

---

# Media

All uploaded media should be handled through the Media Library.

Never manually manipulate upload folders.

Never create duplicate upload logic.

---

# Database

Database is owned by Laravel.

Frontend never knows database structure.

Frontend works only with DTOs / API Resources.

---

# State Management

Server state

↓

React Query

UI State

↓

React

Never duplicate server state.

Avoid unnecessary global state.

---

# Reusability

Before creating

- component
- service
- hook
- helper
- validation

Always search for an existing implementation.

Reuse whenever possible.

---

# Scalability

Every implementation should support future growth.

Avoid assumptions like

"There will only be one."

"There are only three."

"It will never change."

Design for extension.

---

# Error Handling

Errors should be

Predictable

Structured

Actionable

Never expose stack traces.

Never expose SQL.

Never expose internal implementation.

---

# Logging

Unexpected failures should be logged.

Expected validation errors should not.

Activity logging belongs only where business value exists.

---

# Dependencies

Business logic

↓

never depends on

React

UI

Presentation

Presentation depends on Business Logic.

Never the opposite.

---

# SOLID Principles

Follow

Single Responsibility

Open / Closed

Liskov

Interface Segregation

Dependency Inversion

Whenever reasonable.

---

# Clean Architecture

Prefer dependency direction

```
UI

↓

Application

↓

Domain

↓

Infrastructure
```

Infrastructure should never dictate business logic.

---

# Feature Development Workflow

Before implementation

Understand architecture.

↓

Locate existing implementation.

↓

Reuse.

↓

Plan.

↓

Implement.

↓

Review.

↓

Refactor.

↓

Test.

↓

Commit.

---

# Architecture Review Checklist

Before considering a feature complete ask:

- Does this duplicate existing logic?
- Can this be reused?
- Is business logic in the correct layer?
- Is the controller thin?
- Is validation centralized?
- Is authorization enforced?
- Are components reusable?
- Is the API consistent?
- Is naming consistent?
- Does this increase technical debt?
- Can another developer understand this in six months?

If any answer is "No",

improve the implementation before finishing.