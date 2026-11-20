#!/usr/bin/env bash
#
# Monthly vulnerability scan of the adriaholiday images with Trivy (see
# docs/operations.md). Installed by deploy/production/monitor-host.sh as
# /usr/local/sbin/adriaholiday-image-scan and run as root by a systemd timer on the
# 1st of every month. The report lands next to the health status, where server1's
# monthly audit (deploy/monitoring/monthly-audit.sh) picks it up.

set -euo pipefail

APP_NAME=adriaholiday
TRIVY_IMAGE=${TRIVY_IMAGE:-aquasec/trivy:0.76.2}
# The images the stack actually runs (a GHCR release tag or a local build).
running=$(docker inspect -f '{{.Config.Image}}' "${APP_NAME}-app-1" "${APP_NAME}-nginx-1" 2>/dev/null | tr '\n' ' ' || true)
IMAGES=${IMAGES:-${running:-"${APP_NAME}/app:latest ${APP_NAME}/nginx:latest"}}
OUT_DIR=${OUT_DIR:-/srv/backups/${APP_NAME}/health}
CACHE_DIR=/var/cache/trivy

mkdir -p "${CACHE_DIR}"
report=$(mktemp "${OUT_DIR}/image-scan.txt.XXXXXX")
summary=$(mktemp "${OUT_DIR}/image-scan.summary.XXXXXX")

trivy() {
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock:ro -v "${CACHE_DIR}:/root/.cache" \
        "${TRIVY_IMAGE}" image --quiet --scanners vuln --severity HIGH,CRITICAL "$@"
}

{
    echo "Trivy image scan, $(date -Is), ${TRIVY_IMAGE}"
    echo "HIGH and CRITICAL only; 'fixed' means an update exists."
} >"${report}"

for image in ${IMAGES}; do
    echo "" >>"${report}"
    trivy --format table "${image}" >>"${report}" 2>&1 || echo "Scan failed for ${image}" >>"${report}"
    counts=$(trivy --format json "${image}" 2>/dev/null | jq -r '
        [.Results[]?.Vulnerabilities[]?] as $v
        | "\($v | map(select(.Severity == "CRITICAL")) | length) \($v | map(select(.Severity == "HIGH")) | length) \($v | map(select(.FixedVersion // "" | length > 0)) | length)"' \
        || echo "error error error")
    read -r critical high fixable <<<"${counts}"
    echo "${image} critical=${critical} high=${high} fixable=${fixable}" >>"${summary}"
done

chmod 640 "${report}" "${summary}"
mv "${report}" "${OUT_DIR}/image-scan.txt"
mv "${summary}" "${OUT_DIR}/image-scan.summary"
