# adriaholiday.jandldavid.hu deploy (Debian 12 + Traefik file provider)

This repo builds a static Vite site and serves it via an `nginx` container on the shared Docker host.

## Prereqs (server-side)

1. DNS: create an **A record** for `adriaholiday.jandldavid.hu` -> `217.144.53.91`.
2. Server access: SSH as `deploy@217.144.53.91`.

## One-time server setup

```bash
ssh -i ~/.ssh/marrygallery_actions deploy@217.144.53.91
mkdir -p /srv/apps/adriaholiday
```

## Deploy (build on server)

From your machine, sync the repo to the server app dir (excluding `node_modules`, `dist`, `.git`):

```bash
rsync -az --delete \
  --exclude node_modules --exclude dist --exclude .git --exclude .DS_Store \
  ./ deploy@217.144.53.91:/srv/apps/adriaholiday/
```

On the server:

```bash
cd /srv/apps/adriaholiday
docker compose -f docker-compose.prod.yml up -d --build
```

## Traefik route

Create `/srv/apps/traefik/dynamic/adriaholiday.jandldavid.hu.yml`:

```yml
http:
  routers:
    adriaholiday:
      rule: Host(`adriaholiday.jandldavid.hu`)
      entryPoints:
        - websecure
      service: adriaholiday
      tls:
        certResolver: letsencrypt
  services:
    adriaholiday:
      loadBalancer:
        servers:
          - url: http://adriaholiday-web:80
```

Traefik will hot-reload it (no restart required).

## Quick checks

```bash
curl -I https://adriaholiday.jandldavid.hu
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

