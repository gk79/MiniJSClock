#!/usr/bin/env bash
# Shared human-readable status output. Exit codes remain authoritative.

_output_use_color=0
if [[ -z "${NO_COLOR:-}" ]] && { [[ -t 1 ]] || [[ "${FORCE_COLOR:-0}" == "1" ]]; }; then
  _output_use_color=1
fi

if (( _output_use_color )); then
  _C_GREEN=$'\033[32m'
  _C_YELLOW=$'\033[33m'
  _C_RED=$'\033[31m'
  _C_CYAN=$'\033[36m'
  _C_RESET=$'\033[0m'
else
  _C_GREEN=''
  _C_YELLOW=''
  _C_RED=''
  _C_CYAN=''
  _C_RESET=''
fi

_status_line() {
  local level="$1" color="$2" subject="$3" message="${4:-}"
  if [[ -n "$message" ]]; then
    printf '%b%-4s%b  %-18s %s\n' "$color" "$level" "$_C_RESET" "$subject" "$message"
  else
    printf '%b%-4s%b  %s\n' "$color" "$level" "$_C_RESET" "$subject"
  fi
}

status_pass() { _status_line PASS "$_C_GREEN" "$1" "${2:-}"; }
status_warn() { _status_line WARN "$_C_YELLOW" "$1" "${2:-}"; }
status_na()   { _status_line N/A  "$_C_YELLOW" "$1" "${2:-}"; }
status_info() { _status_line INFO "$_C_CYAN" "$1" "${2:-}"; }
status_fail() { _status_line FAIL "$_C_RED" "$1" "${2:-}" >&2; }
