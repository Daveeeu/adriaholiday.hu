# Git Workflow

## Purpose

This document defines the Git workflow for the AdriaHoliday repository.

Every commit should improve the project.

Git history should remain clean, meaningful and easy to understand.

The repository should always be in a deployable state.

---

# Core Principles

Git history is documentation.

Every commit should explain a meaningful change.

Never create commits just because files changed.

Think before committing.

---

# Repository Status

Before starting any work always check:

```bash
git status
```

Review:

- modified files
- deleted files
- untracked files
- current branch

Never start coding without understanding the repository state.

---

# Before Editing

Before modifying code:

- understand the task
- inspect related files
- inspect existing implementation
- search for reusable code
- create an implementation plan

Do not randomly edit files.

---

# Branch Strategy

Main branches

```
main
```

Production-ready code.

```
develop
```

Integration branch.

Feature branches

```
feature/apartment-gallery

feature/blog-editor

feature/homepage-redesign
```

Bug fixes

```
bugfix/image-upload

bugfix/booking-validation
```

Critical fixes

```
hotfix/login-error
```

Never commit large unrelated changes into one branch.

---

# Commit Frequency

Prefer several logical commits instead of one huge commit.

Each commit should represent one logical change.

Bad:

```
Changed everything
```

Good:

```
feat(admin): add apartment gallery management

fix(api): validate booking date range

refactor(blog): extract seo service
```

---

# Conventional Commits

Use conventional commit messages.

Examples

Feature

```
feat(admin): add apartment sorting
```

Fix

```
fix(api): prevent duplicate bookings
```

Refactor

```
refactor(media): simplify upload pipeline
```

Performance

```
perf(api): optimize apartment queries
```

Documentation

```
docs: update deployment guide
```

Testing

```
test(api): add booking service tests
```

Build

```
build: update docker configuration
```

CI

```
ci: improve deployment workflow
```

Never use:

```
update

changes

new

fix2

temp

final

asdf
```

---

# Before Every Commit

Review changes carefully.

Run:

```bash
git diff
```

Check every modified file.

Ask yourself:

- Is this intentional?
- Is anything missing?
- Is anything unrelated?
- Can this be simplified?

Never commit blindly.

---

# Code Review

Before committing verify:

- naming
- architecture
- duplication
- readability
- validation
- authorization
- formatting
- lint
- tests

Only commit clean code.

---

# Formatting

Before commit:

Frontend

```bash
npm run lint
npm run format
```

Backend

```bash
composer lint
composer format
```

Use the project's actual commands.

Never commit unformatted code.

---

# Testing

Before committing run appropriate tests.

Frontend

```bash
npm test
```

Backend

```bash
php artisan test
```

If tests fail:

Fix them.

Do not ignore failures.

---

# Build Verification

If frontend changed:

Verify build succeeds.

If backend changed:

Verify application boots correctly.

Never commit code that cannot build.

---

# Sensitive Files

Never commit:

```
.env

.env.local

.env.production

storage/logs

vendor

node_modules

dist

coverage

.idea

.vscode/settings.json
```

Check `.gitignore` before committing.

---

# Secrets

Never commit:

- API keys
- passwords
- private certificates
- tokens
- SSH keys
- production credentials

If a secret is accidentally committed:

Rotate it immediately.

---

# Large Files

Avoid committing:

- videos
- backups
- SQL dumps
- ZIP archives
- temporary exports

Use proper storage instead.

---

# Pull Requests

Every PR should:

- solve one problem
- have clear title
- explain reasoning
- mention breaking changes
- remain focused

Avoid giant pull requests.

---

# Conflict Resolution

When resolving merge conflicts:

Understand both implementations.

Never randomly accept one side.

Ensure the final code compiles.

Review affected files after resolution.

---

# Cleanup

Before committing remove:

- debug logs
- commented code
- unused imports
- unused variables
- temporary files
- experimental code

Repository should remain clean.

---

# Reviewing Your Own Work

Before commit ask:

Can this be simpler?

Can this be reused?

Is naming consistent?

Does it follow architecture?

Would another developer understand this in six months?

If not,

Improve it.

---

# Push Rules

Only push after:

✅ formatting passes

✅ lint passes

✅ tests pass

✅ build succeeds

✅ git diff reviewed

✅ commit created

Never push broken code.

---

# Repository Discipline

The repository should always be:

- buildable
- readable
- consistent
- deployable

Never leave half-finished work committed.

If work is incomplete:

Use a feature branch.

Do not pollute the main branch.

---

# Claude Workflow

For every completed task Claude should follow:

1.

Understand the task

↓

2.

Inspect related files

↓

3.

Create implementation plan

↓

4.

Implement

↓

5.

Run formatting

↓

6.

Run lint

↓

7.

Run tests

↓

8.

Review git diff

↓

9.

Improve implementation if needed

↓

10.

Create meaningful commit

↓

11.

Push to current branch (unless instructed otherwise)

---

# Definition of Done

A Git task is complete only when:

✅ Repository builds

✅ Formatting passes

✅ Lint passes

✅ Tests pass

✅ Git diff reviewed

✅ Commit message is meaningful

✅ No unrelated files are included

✅ Repository is ready for deployment