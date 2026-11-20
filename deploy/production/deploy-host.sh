#!/usr/bin/env bash
#
# Prepares the VPS for releases from the GitHub release workflow
# (see docs/release-pipeline.md):
#
# - /usr/local/sbin/adriaholiday-deploy (deploy/production/deploy.sh);
# - an "adriadeploy" user whose only SSH key may run nothing but
#   "deploy vX.Y.Z", which becomes "sudo adriaholiday-deploy vX.Y.Z".
#
#   DEPLOY_PUBLIC_KEY="ssh-ed25519 AAAA... github-release" bash deploy/production/deploy-host.sh
#
# Safe to run again. Run after bootstrap.sh and backup-host.sh.

set -euo pipefail

APP_NAME=adriaholiday
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
DEPLOY_USER=adriadeploy
SSHD_HARDENING=/etc/ssh/sshd_config.d/01-hardening.conf

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

[ -n "${DEPLOY_PUBLIC_KEY:-}" ] || fail "Set DEPLOY_PUBLIC_KEY to the release workflow's public key."
sudo -n true 2>/dev/null || fail "$(id -un) needs passwordless sudo."
sudo test -f /srv/apps/${APP_NAME}/.env.production || fail "Run bootstrap.sh first."

log "Deploy script"
sudo install -m 750 "${SCRIPT_DIR}/deploy.sh" /usr/local/sbin/${APP_NAME}-deploy

log "Deploy user (one command, key only)"
id "${DEPLOY_USER}" >/dev/null 2>&1 || sudo useradd --system --create-home --shell /bin/sh "${DEPLOY_USER}"

# The forced command: the only thing the key can do.
sudo tee /usr/local/bin/${APP_NAME}-deploy-ssh >/dev/null <<EOF
#!/bin/sh
# Written by deploy/production/deploy-host.sh. Forced command of ${DEPLOY_USER}'s key.
set -eu
case "\${SSH_ORIGINAL_COMMAND:-}" in
    "deploy v"*) tag=\${SSH_ORIGINAL_COMMAND#deploy } ;;
    *) echo "Only 'deploy vX.Y.Z' is allowed." >&2; exit 2 ;;
esac
exec sudo -n /usr/local/sbin/${APP_NAME}-deploy "\${tag}"
EOF
sudo chmod 755 /usr/local/bin/${APP_NAME}-deploy-ssh

echo "${DEPLOY_USER} ALL=(root) NOPASSWD: /usr/local/sbin/${APP_NAME}-deploy" \
    | sudo tee /etc/sudoers.d/${APP_NAME}-deploy >/dev/null
sudo chmod 440 /etc/sudoers.d/${APP_NAME}-deploy
sudo visudo -cf /etc/sudoers.d/${APP_NAME}-deploy >/dev/null

sudo install -d -m 700 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
echo "restrict,command=\"/usr/local/bin/${APP_NAME}-deploy-ssh\" ${DEPLOY_PUBLIC_KEY}" \
    | sudo tee "/home/${DEPLOY_USER}/.ssh/authorized_keys" >/dev/null
sudo chown "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh/authorized_keys"
sudo chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"

log "SSH access"
if ! sudo grep -qE "^AllowUsers .*\b${DEPLOY_USER}\b" "${SSHD_HARDENING}"; then
    sudo sed -i "s/^AllowUsers .*/& ${DEPLOY_USER}/" "${SSHD_HARDENING}"
fi
sudo sshd -t
sudo systemctl reload ssh

log "Done"
sudo grep '^AllowUsers' "${SSHD_HARDENING}"
echo "VPS_KNOWN_HOSTS secret:"
awk '{print "217.144.53.32", $1, $2}' /etc/ssh/ssh_host_ed25519_key.pub
