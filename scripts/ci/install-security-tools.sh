#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
  echo "The pinned security artifacts require Linux x86_64" >&2
  exit 1
fi

: "${RUNNER_TEMP:?RUNNER_TEMP must be set by GitHub Actions}"
: "${GITHUB_PATH:?GITHUB_PATH must be set by GitHub Actions}"

install_dir="$(mktemp -d "${RUNNER_TEMP}/security-tools.XXXXXXXX")"

curl --fail --location --retry 3 --silent --show-error \
  --output "${install_dir}/gitleaks.tar.gz" \
  https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz
printf '%s  %s\n' \
  '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' \
  "${install_dir}/gitleaks.tar.gz" | sha256sum --check --status
tar -xzf "${install_dir}/gitleaks.tar.gz" -C "${install_dir}" gitleaks

curl --fail --location --retry 3 --silent --show-error \
  --output "${install_dir}/osv-scanner" \
  https://github.com/google/osv-scanner/releases/download/v2.6.0/osv-scanner_linux_amd64
printf '%s  %s\n' \
  'ca69b3d3cd08f889a49dc0a383122f71cc528b83803671df5fd874d97485b108' \
  "${install_dir}/osv-scanner" | sha256sum --check --status
chmod +x "${install_dir}/osv-scanner"

printf '%s\n' "${install_dir}" >> "${GITHUB_PATH}"
echo 'Installed checksum-verified Gitleaks 8.30.1 and OSV-Scanner 2.6.0'
