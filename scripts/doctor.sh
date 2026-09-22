#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/output.sh"

missing=0
warnings=0
required=(git make bash curl jq rg)
optional=(gh codex)
security_tools=(gitleaks osv-scanner)

for cmd in "${required[@]}"; do
  if command -v "$cmd" >/dev/null 2>&1; then
    status_pass "$cmd" "$(command -v "$cmd")"
  else
    status_fail "$cmd" "required tool not found"
    missing=1
  fi
done

for cmd in "${optional[@]}"; do
  if command -v "$cmd" >/dev/null 2>&1; then
    status_pass "$cmd" "$(command -v "$cmd")"
  else
    status_warn "$cmd" "optional tool not found"
    warnings=$((warnings + 1))
  fi
done

for cmd in "${security_tools[@]}"; do
  if command -v "$cmd" >/dev/null 2>&1; then
    status_pass "$cmd" "local SSDLC tool available"
  else
    status_warn "$cmd" "recommended for the v2.6 local security baseline"
    warnings=$((warnings + 1))
  fi
done

if (( missing )); then
  status_fail DOCTOR "required workstation prerequisites are missing"
  exit 1
elif (( warnings )); then
  status_warn DOCTOR "PASS with ${warnings} warning(s)"
else
  status_pass DOCTOR "all checked prerequisites available"
fi
