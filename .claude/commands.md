# Commands

## Purpose

This document defines the common commands for the AdriaHoliday repository.

Claude should use these commands when working on the project.

Always verify the actual `package.json`, `composer.json`, `docker-compose.yml` and project files before running commands.

Never invent commands if the project already defines scripts.

---

# Repository Structure

```txt
/
├── src/              # Public portfolio website
├── adria-admin/      # React admin frontend
├── backend/          # Laravel API
├── docker-compose.yml
├── docker-compose.prod.yml
└── CLAUDE.md
```

---

# General Rule

Before running commands, identify the target app:

```txt
Portfolio website  -> repository root
Admin frontend     -> /adria-admin
Backend API        -> /backend
```

Never run frontend commands in the backend folder.

Never run Laravel commands in the frontend folders.

---

# Git

Check status:

```bash
git status
```

Review changes:

```bash
git diff
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "feat(admin): add booking management"
```

Push:

```bash
git push
```

---

# Portfolio Website

Location:

```bash
cd .
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Preview build:

```bash
npm run preview
```

---

# Admin Frontend

Location:

```bash
cd adria-admin
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Preview build:

```bash
npm run preview
```

---

# Backend API

Location:

```bash
cd backend
```

Install dependencies:

```bash
composer install
```

Run Laravel development server:

```bash
php artisan serve
```

Run migrations:

```bash
php artisan migrate
```

Run fresh migrations with seeders:

```bash
php artisan migrate:fresh --seed
```

Run tests:

```bash
php artisan test
```

Clear cache:

```bash
php artisan optimize:clear
```

Cache production config:

```bash
php artisan optimize
```

Generate app key:

```bash
php artisan key:generate
```

Storage link:

```bash
php artisan storage:link
```

---

# Docker

Start containers:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down
```

View containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Rebuild:

```bash
docker compose up -d --build
```

---

# Docker Backend Commands

Run Artisan inside backend container:

```bash
docker compose exec backend php artisan migrate
```

Run tests inside backend container:

```bash
docker compose exec backend php artisan test
```

Clear Laravel cache:

```bash
docker compose exec backend php artisan optimize:clear
```

Install Composer dependencies:

```bash
docker compose exec backend composer install
```

---

# Docker Frontend Commands

Admin frontend install:

```bash
docker compose exec adria-admin npm install
```

Admin frontend build:

```bash
docker compose exec adria-admin npm run build
```

Portfolio install:

```bash
docker compose exec portfolio npm install
```

Portfolio build:

```bash
docker compose exec portfolio npm run build
```

Only use these if the container names match the actual Docker Compose file.

Always inspect `docker-compose.yml` first.

---

# Production Build

Portfolio:

```bash
npm run build
```

Admin:

```bash
cd adria-admin
npm run build
```

Backend:

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan optimize
```

---

# Laravel Production Checklist

After deployment:

```bash
php artisan migrate --force
php artisan storage:link
php artisan optimize
php artisan queue:restart
```

Only run production migrations after backup and review.

---

# Logs

Docker logs:

```bash
docker compose logs -f
```

Backend logs:

```bash
tail -f backend/storage/logs/laravel.log
```

Nginx logs depend on server configuration.

---

# Database

Run migrations:

```bash
php artisan migrate
```

Rollback last migration:

```bash
php artisan migrate:rollback
```

Seed database:

```bash
php artisan db:seed
```

Fresh database:

```bash
php artisan migrate:fresh --seed
```

Never run `migrate:fresh` on production.

---

# Queue

Run queue worker:

```bash
php artisan queue:work
```

Restart queue workers:

```bash
php artisan queue:restart
```

Failed jobs:

```bash
php artisan queue:failed
```

Retry failed jobs:

```bash
php artisan queue:retry all
```

---

# Scheduler

Run scheduler manually:

```bash
php artisan schedule:run
```

List scheduled commands:

```bash
php artisan schedule:list
```

---

# Cache

Clear everything:

```bash
php artisan optimize:clear
```

Cache for production:

```bash
php artisan optimize
```

Clear config:

```bash
php artisan config:clear
```

Clear routes:

```bash
php artisan route:clear
```

Clear views:

```bash
php artisan view:clear
```

---

# Validation Workflow

Before finishing frontend work:

```bash
npm run lint
npm run build
```

Before finishing admin work:

```bash
cd adria-admin
npm run lint
npm run build
```

Before finishing backend work:

```bash
cd backend
php artisan test
php artisan optimize:clear
```

Before committing:

```bash
git status
git diff
```

---

# Safety Rules

Never run on production without explicit confirmation:

```bash
php artisan migrate:fresh
php artisan db:wipe
php artisan cache:clear
docker compose down -v
rm -rf
```

Never delete Docker volumes unless explicitly requested.

Never overwrite `.env`.

Never commit `.env`.

---

# Definition of Done

A task is complete only when:

✅ Correct app folder was used

✅ Correct commands were verified

✅ Build passes

✅ Tests pass when available

✅ Git diff reviewed

✅ Commit created

✅ Push completed unless instructed otherwise