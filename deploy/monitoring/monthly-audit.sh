#!/usr/bin/env bash
#
# Monthly security audit of adriaholiday.hu, run on server1 (see docs/operations.md):
#
#   0 7 1 * *  $HOME/bin/adriaholiday-monthly-audit
#
# Everything runs in throwaway containers, so server1 needs only Docker, git, jq
# and curl. It writes ${REPORT_DIR}/YYYY-MM-security.md (with the raw tool output
# next to it) and reports to the "Havi biztonsági audit" Uptime Kuma push monitor:
# down with a summary when there are HIGH/CRITICAL findings or a step failed.
#
# 1. Dependencies: composer audit (backend), npm audit (site and adria-admin) on
#    the lock files of origin/main.
# 2. Images: the Trivy report the VPS writes on the 1st (deploy/production/image-scan.sh).
# 3. External surface of the VPS: TLS (testssl.sh), security headers, open ports
#    (nmap, port 22 skipped so fail2ban never sees it), Mozilla HTTP Observatory.
#
# Configuration: ~/.config/adriaholiday/monitoring.env (AUDIT_PUSH_TOKEN,
# KUMA_PUSH_BASE); optional REPO_URL, REPO_DIR, REPORT_DIR, VPS, KEY, TARGET_IP.

set -uo pipefail

CONFIG=${CONFIG:-$HOME/.config/adriaholiday/monitoring.env}
# shellcheck source=/dev/null
[ -r "${CONFIG}" ] && . "${CONFIG}"

REPO_URL=${REPO_URL:-https://github.com/Daveeeu/adriaholiday.hu.git}
REPO_DIR=${REPO_DIR:-$HOME/ops/adriaholiday/repo}
REPORT_DIR=${REPORT_DIR:-$HOME/ops/adriaholiday/reports}
VPS=${VPS:-adriabackup@217.144.53.32}
KEY=${KEY:-$HOME/.ssh/adriaholiday_backup}
PUBLIC_HOST=${PUBLIC_HOST:-adriaholiday.hu}
TARGET_IP=${TARGET_IP:-217.144.53.32}
EXPECTED_PORTS=${EXPECTED_PORTS:-"80 443"}
KUMA_PUSH_BASE=${KUMA_PUSH_BASE:-http://127.0.0.1:3012/api/push}
AUDIT_PUSH_TOKEN=${AUDIT_PUSH_TOKEN:-}

month=$(date +%Y-%m)
raw=${REPORT_DIR}/${month}-raw
report=${REPORT_DIR}/${month}-security.md
mkdir -p "${raw}"

findings=()   # HIGH/CRITICAL or failed steps: these turn the Kuma monitor red
notes=()      # worth a look, not urgent

section() { printf '\n## %s\n\n' "$1" >>"${report}"; }
line() { printf '%s\n' "$*" >>"${report}"; }

cat >"${report}" <<EOF
# adriaholiday.hu – havi biztonsági audit, ${month}

Futtatva: $(date '+%Y-%m-%d %H:%M') (server1, deploy/monitoring/monthly-audit.sh).
Nyers kimenetek: \`${raw}\`.
EOF

# --- 1. Dependencies ---------------------------------------------------------

if [ -d "${REPO_DIR}/.git" ]; then
    git -C "${REPO_DIR}" fetch --quiet origin main && git -C "${REPO_DIR}" reset --quiet --hard origin/main
else
    git clone --quiet --depth 1 --branch main "${REPO_URL}" "${REPO_DIR}"
fi || findings+=("git: nem sikerült frissíteni a repót")
commit=$(git -C "${REPO_DIR}" rev-parse --short HEAD 2>/dev/null || echo "?")

section "1. Függőségek (main @ ${commit})"

docker run --rm -v "${REPO_DIR}/backend:/app:ro" -w /app composer:2.8 \
    audit --locked --no-interaction --format=json >"${raw}/composer-audit.json" 2>"${raw}/composer-audit.err"
if jq -e .advisories "${raw}/composer-audit.json" >/dev/null 2>&1; then
    read -r total severe <<<"$(jq -r '[.advisories[][]] | "\(length) \(map(select(.severity == "high" or .severity == "critical")) | length)"' "${raw}/composer-audit.json")"
    abandoned=$(jq -r '.abandoned // {} | length' "${raw}/composer-audit.json")
    line "- **composer (backend):** ${total} advisory, ebből high/critical: ${severe}; elhagyott csomag: ${abandoned}"
    [ "${severe}" -eq 0 ] || findings+=("composer: ${severe} high/critical")
    [ "${total}" -eq "${severe}" ] || notes+=("composer: $((total - severe)) alacsonyabb súlyú advisory")
    jq -r '.advisories[][] | "  - \(.packageName): \(.title) (\(.severity // "?"), \(.cve // .advisoryId))"' \
        "${raw}/composer-audit.json" >>"${report}"
else
    line "- **composer (backend):** hiba, lásd composer-audit.err"
    findings+=("composer audit nem futott le")
fi

for dir in . adria-admin; do
    name=$([ "${dir}" = . ] && echo "site" || echo "${dir}")
    out=${raw}/npm-audit-${name}.json
    docker run --rm -v "${REPO_DIR}:/w:ro" -w "/w/${dir}" node:22-alpine \
        npm audit --package-lock-only --json >"${out}" 2>/dev/null
    if jq -e .metadata.vulnerabilities "${out}" >/dev/null 2>&1; then
        read -r critical high moderate low <<<"$(jq -r '.metadata.vulnerabilities | "\(.critical) \(.high) \(.moderate) \(.low)"' "${out}")"
        line "- **npm (${name}):** critical ${critical}, high ${high}, moderate ${moderate}, low ${low}"
        [ $((critical + high)) -eq 0 ] || findings+=("npm ${name}: ${critical} critical, ${high} high")
        [ $((moderate + low)) -eq 0 ] || notes+=("npm ${name}: ${moderate} moderate, ${low} low")
        jq -r '.vulnerabilities | to_entries[] | select(.value.severity == "high" or .value.severity == "critical")
            | "  - \(.key) (\(.value.severity)), javítás: \(if .value.fixAvailable then "elérhető" else "nincs" end)"' "${out}" >>"${report}"
    else
        line "- **npm (${name}):** hiba"
        findings+=("npm audit (${name}) nem futott le")
    fi
done

# --- 2. Container images -----------------------------------------------------

section "2. Konténer image-ek (Trivy, a VPS-en)"

ssh_opts="ssh -i ${KEY} -o BatchMode=yes -o ConnectTimeout=20"
if rsync -q -e "${ssh_opts}" "${VPS}:health/image-scan.summary" "${VPS}:health/image-scan.txt" "${raw}/" 2>/dev/null; then
    line "Riport: $(head -1 "${raw}/image-scan.txt")"
    line ""
    while read -r image counts; do
        line "- \`${image}\`: ${counts}"
        critical=$(sed -n 's/.*critical=\([0-9]*\).*/\1/p' <<<"${counts}")
        high=$(sed -n 's/.*high=\([0-9]*\).*/\1/p' <<<"${counts}")
        fixable=$(sed -n 's/.*fixable=\([0-9]*\).*/\1/p' <<<"${counts}")
        if [ -z "${critical}" ]; then
            findings+=("trivy: ${image} szkennelése hibás")
        elif [ "${fixable:-0}" -gt 0 ]; then
            findings+=("trivy ${image}: ${fixable} javítható high/critical (image újraépítés kell)")
        elif [ $((critical + high)) -gt 0 ]; then
            notes+=("trivy ${image}: ${critical} critical, ${high} high, még nincs javítás")
        fi
    done <"${raw}/image-scan.summary"
    age_days=$(( ($(date +%s) - $(stat -c %Y "${raw}/image-scan.txt")) / 86400 ))
    [ "${age_days}" -le 35 ] || findings+=("trivy riport ${age_days} napos: az image-scan timer nem fut")
else
    line "- A VPS image-scan riportja nem érhető el."
    findings+=("trivy riport nem érhető el a VPS-ről")
fi

# --- 3. External surface -----------------------------------------------------

section "3. Külső felület (${PUBLIC_HOST} @ ${TARGET_IP})"

headers=$(curl -sS -m 20 -o /dev/null -D - --resolve "${PUBLIC_HOST}:443:${TARGET_IP}" "https://${PUBLIC_HOST}/" | tr -d '\r')
for header in strict-transport-security content-security-policy x-content-type-options x-frame-options referrer-policy permissions-policy; do
    if grep -qi "^${header}:" <<<"${headers}"; then
        line "- ${header}: van"
    else
        line "- ${header}: **hiányzik**"
        notes+=("hiányzó header: ${header}")
    fi
done
server=$(grep -i '^server:' <<<"${headers}" | cut -d' ' -f2-)
if grep -q '[0-9]' <<<"${server}"; then
    line "- Server header verziót mutat: \`${server}\`"
    notes+=("a Server header verziót árul el (${server})")
fi

docker run --rm instrumentisto/nmap:7.98 -Pn -sT --top-ports 1000 --exclude-ports 22 --open -oG - "${TARGET_IP}" \
    >"${raw}/nmap.txt" 2>&1
open_ports=$(grep -o '[0-9]*/open' "${raw}/nmap.txt" | cut -d/ -f1 | sort -n | tr '\n' ' ')
line "- Nyitott portok (top 1000, a 22 kihagyva): ${open_ports:-nincs adat}"
for port in ${open_ports}; do
    grep -qw "${port}" <<<"${EXPECTED_PORTS}" || findings+=("váratlan nyitott port: ${port}")
done

rm -f "${raw}/testssl.json"
docker run --rm --user "$(id -u):$(id -g)" -v "${raw}:/out" drwetter/testssl.sh:3.2 --quiet --color 0 \
    --warnings off --ip "${TARGET_IP}" --protocols --server-defaults --vulnerable \
    --jsonfile /out/testssl.json "${PUBLIC_HOST}" >"${raw}/testssl.txt" 2>&1
if jq -e 'type == "array"' "${raw}/testssl.json" >/dev/null 2>&1; then
    tls_issues=$(jq -r '[.[] | select(.severity == "HIGH" or .severity == "CRITICAL") | .id] | unique | join(" ")' "${raw}/testssl.json")
    tls_medium=$(jq -r '[.[] | select(.severity == "MEDIUM")] | length' "${raw}/testssl.json")
    line "- TLS (testssl.sh): high/critical: ${tls_issues:-nincs}; medium: ${tls_medium}"
    [ "${tls_medium}" -eq 0 ] || notes+=("TLS: ${tls_medium} medium megjegyzés (testssl.json)")
else
    tls_issues="testssl.sh nem futott le"
    line "- TLS (testssl.sh): hiba, lásd testssl.txt"
fi
[ -z "${tls_issues}" ] || findings+=("TLS: ${tls_issues}")

observatory=$(curl -sS -m 60 -X POST "https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${PUBLIC_HOST}")
grade=$(jq -r '.grade // "?"' <<<"${observatory}" 2>/dev/null)
line "- Mozilla HTTP Observatory (a publikus DNS szerinti szerver): ${grade:-?} ($(jq -r '.score // "?"' <<<"${observatory}" 2>/dev/null) pont)"

# --- Summary -----------------------------------------------------------------

section "Összegzés"
if [ ${#findings[@]} -eq 0 ]; then
    line "Nincs sürgős (high/critical) teendő."
else
    line "**Teendő:**"
    printf -- '- %s\n' "${findings[@]}" >>"${report}"
fi
if [ ${#notes[@]} -gt 0 ]; then
    line ""
    line "Megjegyzések:"
    printf -- '- %s\n' "${notes[@]}" >>"${report}"
fi

if [ -n "${AUDIT_PUSH_TOKEN}" ]; then
    if [ ${#findings[@]} -eq 0 ]; then
        state=up msg="${month}: nincs high/critical, ${#notes[@]} megjegyzés"
    else
        state=down msg="${month}: $(IFS=';'; echo "${findings[*]}")"
    fi
    curl -fsS -m 10 -G "${KUMA_PUSH_BASE}/${AUDIT_PUSH_TOKEN}" \
        --data-urlencode "status=${state}" --data-urlencode "msg=${msg:0:250}" >/dev/null \
        || echo "Kuma push failed." >&2
fi

echo "Report: ${report}"
