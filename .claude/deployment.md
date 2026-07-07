# Deployment Guidelines

## Purpose

This document defines deployment, infrastructure and production rules for the AdriaHoliday platform.

Production stability is more important than development speed.

Never make production changes without understanding their impact.

---

# Infrastructure

Current stack

- Debian Linux
- Docker
- Docker Compose
- Nginx
- PHP-FPM
- Laravel
- MySQL
- Redis (if enabled)

Applications

```
Portfolio Website
↓

React

↓

Nginx


Admin Panel

↓

React

↓

Nginx


Backend API

↓

Laravel

↓

PHP-FPM

↓

MySQL
```

---

# Environment Separation

Always distinguish between environments.

Development

```
localhost
```

Staging

```
staging.example.com
```

Production

```
production domain
```

Never assume commands should run on production.

Always verify the environment first.

---

# Environment Variables

Never hardcode

- API keys
- passwords
- tokens
- database credentials
- domains
- storage paths

Everything belongs in:

```
.env
```

Laravel configuration should access values through config files.

Avoid calling env() outside configuration files.

---

# Docker

Containers should be treated as disposable.

Never manually edit files inside running containers.

Always modify source code.

Rebuild containers when necessary.

---

# Docker Compose

Use Docker Compose for local development.

Never manually recreate services that are already managed by Compose.

Before restarting containers verify:

- configuration
- mounted volumes
- environment variables

---

# Production Containers

Production containers should always:

- restart automatically
- expose only required ports
- use named volumes
- log correctly

Never expose unnecessary internal services.

---

# Build Process

Frontend

Typical workflow:

```
npm install

↓

npm run build
```

Backend

Typical workflow:

```
composer install

↓

php artisan optimize
```

Never skip dependency installation after changes requiring it.

---

# Composer

Production installs should use:

```
composer install --no-dev --optimize-autoloader
```

Never install development packages on production.

---

# Node

Production builds should generate optimized assets.

Never deploy development builds.

Always verify successful build before deployment.

---

# Laravel Cache

After configuration changes consider refreshing:

```
config cache

route cache

view cache

event cache
```

Never clear caches blindly on a live system without understanding the impact.

---

# Database Migrations

Always inspect migrations before running them.

Checklist:

- reversible
- indexes included
- foreign keys correct
- safe for existing data

Never modify existing production migrations.

Create new migrations instead.

---

# Production Migrations

Migration workflow

```
Backup

↓

Review

↓

Deploy code

↓

Run migration

↓

Verify

↓

Monitor logs
```

Never skip verification.

---

# Rollback Strategy

Every deployment should have a rollback plan.

Before deployment know:

- previous image
- previous commit
- previous migration state

Never deploy irreversible changes without approval.

---

# Git Workflow

Deployment should always originate from Git.

Never edit production code manually.

Workflow

```
Local Development

↓

Commit

↓

Push

↓

Deploy
```

Production must always match Git history.

---

# Branch Strategy

Recommended branches

```
main

production-ready code

develop

active development

feature/*

new features

bugfix/*

bug fixes

hotfix/*

critical production fixes
```

Never develop directly on main.

---

# Logging

Monitor

- Laravel logs
- PHP errors
- Docker logs
- Nginx logs

Unexpected failures should be investigated.

Never ignore repeated warnings.

---

# Monitoring

After deployment verify:

- homepage
- admin login
- API health
- database connection
- image uploads
- authentication
- important CRUD operations

Deployment is not finished until verification succeeds.

---

# Backups

Production should have backups for:

- database
- uploaded media
- environment files

Backups should be tested periodically.

A backup is only useful if it can be restored.

---

# Storage

User uploads should never be stored inside ephemeral containers.

Persistent files belong in mounted volumes.

Never delete storage folders manually.

---

# Secrets

Never commit:

- .env
- API keys
- private certificates
- SSH keys
- access tokens

If a secret is exposed:

Rotate it immediately.

---

# Security

Production should run with:

APP_DEBUG=false

Never enable debug mode publicly.

Never expose stack traces.

Never expose Laravel debug pages.

---

# HTTPS

Production must always use HTTPS.

Redirect HTTP to HTTPS.

Keep TLS certificates valid.

Never hardcode HTTP URLs.

---

# Performance

Enable:

- optimized autoloader
- OPcache
- asset compression
- browser caching
- image optimization

Measure performance before optimizing.

---

# Health Checks

Applications should expose a health endpoint when appropriate.

Verify:

- database connectivity
- application boot
- storage access

---

# Scheduled Tasks

Laravel scheduler should be managed centrally.

Use:

```
php artisan schedule:run
```

Do not duplicate cron jobs.

Verify scheduled tasks after deployment.

---

# Queues

Queue workers should restart gracefully after deployments.

Never kill workers without ensuring jobs are safe.

Monitor failed jobs.

---

# Failed Jobs

Never ignore failed jobs.

Investigate:

- cause
- retries
- data consistency

Only retry when the root cause is resolved.

---

# File Permissions

Avoid permission fixes with:

```
chmod -R 777
```

Use least privilege.

Verify ownership and correct user permissions.

---

# Zero Downtime

Whenever possible:

- deploy new version
- warm caches
- restart gracefully
- verify
- switch traffic

Avoid visible downtime.

---

# Validation After Deployment

Minimum checklist:

- Website loads
- Admin loads
- Login works
- CRUD works
- Media upload works
- Images display correctly
- API responds
- Logs are clean
- Scheduler is running
- Queues are healthy

Only then is deployment considered successful.

---

# Production Safety Rules

Never:

- edit code directly on production
- disable authentication
- disable authorization
- skip backups before risky operations
- expose secrets
- force database changes without review

Always:

- verify
- document
- monitor
- rollback if necessary

---

# Definition of Successful Deployment

Deployment is complete only when:

✅ Containers are healthy

✅ Logs contain no unexpected errors

✅ Website works

✅ Admin panel works

✅ API works

✅ Authentication works

✅ Database migrations succeeded

✅ Media uploads work

✅ Scheduler is running

✅ Queue workers are healthy

✅ Monitoring shows no regressions