#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/output.sh"

level="${1:-}"
subject="${2:-STATUS}"
message="${3:-}"
case "$level" in
  PASS) status_pass "$subject" "$message" ;;
  WARN) status_warn "$subject" "$message" ;;
  N/A)  status_na "$subject" "$message" ;;
  INFO) status_info "$subject" "$message" ;;
  FAIL) status_fail "$subject" "$message" ;;
  *) echo "Usage: $0 PASS|WARN|N/A|INFO|FAIL SUBJECT [MESSAGE]" >&2; exit 2 ;;
esac
