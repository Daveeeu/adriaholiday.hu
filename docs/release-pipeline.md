# Release pipeline

A release is a git tag. Pushing `vMAJOR.MINOR.PATCH` on a commit that is on
`main` runs `.github/workflows/release.yml`:

1. **verify**: the tag has the release format and its commit is on `main`.
2. **checks** (`.github/workflows/checks.yml`, which also runs on every pull
   request to `main`): `pint --test` and the full PHPUnit suite (PHP 8.4, SQLite
   in memory, ~30 minutes), and `npm ci`, lint, tests and build for the site and
   `adria-admin`.
3. **images**: `docker compose -f docker-compose.prod.yml build nginx app`, so the
   build arguments are the ones in the compose file, then pushes
   `ghcr.io/daveeeu/adriaholiday/{app,nginx}:<tag>` to GitHub Container Registry.
4. **deploy**: SSH to the VPS as `adriadeploy`. That key can only run
   `deploy <tag>`, which becomes `sudo adriaholiday-deploy <tag>`
   (`deploy/production/deploy.sh`):
   - takes a database dump (`adriaholiday-db-dump.service`);
   - checks out the tag in `/srv/apps/adriaholiday`, so the compose files and
     configuration match the images;
   - writes `APP_IMAGE_REPOSITORY` and `APP_IMAGE_TAG` into `.env.production`,
     pulls the images and runs `docker compose up -d --no-build` for the whole
     stack, scheduler and queue included (the entrypoint runs the migrations);
   - waits up to 5 minutes for healthy app and nginx containers and a `/health`
     with `"status":"ok"`. Otherwise it **rolls back** to the previous release
     and the job fails.
   - Finally the workflow checks `/health` through Traefik on the VPS.

Nothing is built on the VPS. A failed check stops the pipeline before anything is
deployed. GitHub emails a failed run to the repository owner; the site monitors in
Uptime Kuma (docs/operations.md) catch anything the checks miss.

## Making a release

```bash
git switch main && git pull
git tag v1.5.0 -m "Short description of the release"
git push origin v1.5.0
```

Versioning: PATCH for fixes, MINOR for features, MAJOR for changes that need
manual steps (data migrations to watch, new environment variables). The release
history is the list of tags and the VPS log in `/var/lib/adriaholiday-deploy/history`.

## Rollback or redeploy

GitHub → Actions → Release → Run workflow, with an existing tag. That run skips
the checks and the build and deploys the images already in GHCR. On the VPS the
same is `sudo adriaholiday-deploy v1.4.0`.

Database migrations are not rolled back. If a release changed the schema, restore
the dump the deploy took (`/srv/backups/adriaholiday/db/`, newest before the
deploy) before or after deploying the old tag, depending on the migration.

## One-time setup

1. **GHCR visibility.** After the first release, set both packages
   (`adriaholiday/app`, `adriaholiday/nginx`) to *public* under the repository's
   Packages. The images contain only the public repository's code and public
   build settings; runtime secrets live in `.env.production` on the server. If they
   stay private, log the VPS in once as root with a read-only token:
   `sudo docker login ghcr.io -u <github user>`.
2. **Deploy key.** Create a key used only by the workflow:

   ```bash
   ssh-keygen -t ed25519 -N "" -C github-release -f ~/.ssh/adriaholiday_github_deploy
   ```

3. **VPS** (after the DNS cutover, once this file is on the VPS checkout), from the Mac:

   ```bash
   ssh -i ~/.ssh/adriaholiday_vps jandldavid@217.144.53.32 \
     "DEPLOY_PUBLIC_KEY='$(cat ~/.ssh/adriaholiday_github_deploy.pub)' bash /srv/apps/adriaholiday/deploy/production/deploy-host.sh"
   ```

   It installs `adriaholiday-deploy`, creates `adriadeploy` with the forced
   command, allows it in sshd and prints the host key line.
4. **GitHub secrets** (Settings → Secrets and variables → Actions):
   - `VPS_SSH_KEY`: the private key `~/.ssh/adriaholiday_github_deploy`;
   - `VPS_KNOWN_HOSTS`: the line printed by `deploy-host.sh`
     (`217.144.53.32 ssh-ed25519 AAAA…`).

   Then delete the private key from the Mac or keep it in the password manager.
5. **Environment.** The deploy job uses the `production` environment. GitHub
   creates it on the first run; to require an approval before deploys, add a
   required reviewer to it later.

`bootstrap.sh` stays the tool for a first install and for infrastructure changes.
It builds locally; a release afterwards switches the stack back to the GHCR images.

## Security notes

- The deploy key cannot open a shell, forward ports or run any other command
  (`restrict` + forced command). The tag is validated by the wrapper and again by
  `adriaholiday-deploy`.
- `adriadeploy` may run only `/usr/local/sbin/adriaholiday-deploy` through sudo.
- Only tags whose commit is on `main` are deployed, and only after the tests pass.
- GitHub Actions sees the code and the deploy key, never production data.
