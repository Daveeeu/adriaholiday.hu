#!/usr/bin/env bash
#
# Prepares a fresh Ubuntu VPS to run adriaholiday.hu on its own (see
# docs/production-server.md): security updates, firewall, fail2ban, key-only
# SSH, Docker and the Traefik edge proxy. Run it once as the admin user with
# passwordless sudo, after that user's SSH key works:
#
#   bash deploy/production/provision-host.sh
#
# It is safe to run again. Afterwards deploy the app with bootstrap.sh
# (DATABASE_STACK=mariadb).
#
# Optional environment: ADMIN_USER (default: the user running the script),
# ACME_EMAIL (Let's Encrypt account, default info@jandldavid.hu).

set -euo pipefail

ADMIN_USER=${ADMIN_USER:-$(id -un)}
ACME_EMAIL=${ACME_EMAIL:-info@jandldavid.hu}
TRAEFIK_DIR=/srv/apps/traefik
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

sudo -n true 2>/dev/null || fail "${ADMIN_USER} needs passwordless sudo."
[ -s "/home/${ADMIN_USER}/.ssh/authorized_keys" ] || fail "${ADMIN_USER} has no SSH key: key-only SSH would lock everyone out."

export DEBIAN_FRONTEND=noninteractive

log "Packages and security updates"
sudo timedatectl set-timezone Europe/Budapest
sudo apt-get update -q
sudo -E apt-get -y -q -o Dpkg::Options::=--force-confold full-upgrade
sudo -E apt-get -y -q install ca-certificates curl git jq htop ufw fail2ban unattended-upgrades restic \
    docker.io docker-compose-v2 docker-buildx

log "Automatic security updates (reboot at 04:30 when a kernel update needs it)"
sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
sudo tee /etc/apt/apt.conf.d/52adriaholiday-unattended >/dev/null <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:30";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

log "SSH: keys only, no root login"
# Keep the users backup-host.sh and deploy-host.sh added on an earlier run.
ALLOW_USERS=$(sudo sed -n 's/^AllowUsers //p' /etc/ssh/sshd_config.d/01-hardening.conf 2>/dev/null || true)
case " ${ALLOW_USERS} " in *" ${ADMIN_USER} "*) ;; *) ALLOW_USERS="${ADMIN_USER} ${ALLOW_USERS}" ;; esac
sudo tee /etc/ssh/sshd_config.d/01-hardening.conf >/dev/null <<EOF
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
AllowUsers ${ALLOW_USERS% }
EOF
sudo sshd -t
sudo systemctl reload ssh

# SSH is allowed without ufw's rate limit: it rejects the 6th connection in 30
# seconds, which breaks scripted deploys; fail2ban bans brute force instead.
log "Firewall: SSH, HTTP, HTTPS"
sudo ufw default deny incoming >/dev/null
sudo ufw default allow outgoing >/dev/null
sudo ufw delete limit 22/tcp >/dev/null 2>&1 || true
sudo ufw allow 22/tcp >/dev/null
sudo ufw allow 80/tcp >/dev/null
sudo ufw allow 443/tcp >/dev/null
sudo ufw --force enable >/dev/null
sudo ufw status verbose

log "fail2ban for SSH"
sudo tee /etc/fail2ban/jail.d/sshd.local >/dev/null <<'EOF'
[sshd]
enabled = true
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
EOF
sudo systemctl enable --now fail2ban >/dev/null
sudo systemctl restart fail2ban

log "Kernel: less swapping"
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/90-adriaholiday.conf >/dev/null
sudo sysctl -q --system

log "Docker (log rotation, containers keep running while the daemon restarts)"
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
EOF
sudo systemctl enable docker >/dev/null
sudo systemctl restart docker
sudo usermod -aG docker "${ADMIN_USER}"

log "Directories /srv/apps and /srv/data"
sudo mkdir -p /srv/apps /srv/data/traefik "${TRAEFIK_DIR}/dynamic"
sudo chown "${ADMIN_USER}:${ADMIN_USER}" /srv/apps /srv/data "${TRAEFIK_DIR}" "${TRAEFIK_DIR}/dynamic"

log "Traefik edge proxy on the platform network"
sudo docker network inspect platform >/dev/null 2>&1 || sudo docker network create platform >/dev/null
sed "s/__ACME_EMAIL__/${ACME_EMAIL}/" "${SCRIPT_DIR}/traefik/compose.yml" >"${TRAEFIK_DIR}/compose.yml"
sudo docker compose --project-name traefik -f "${TRAEFIK_DIR}/compose.yml" up -d --remove-orphans

log "Done"
echo "Log in again so the docker group applies, then deploy the app with deploy/production/bootstrap.sh."
