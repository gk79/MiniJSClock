#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
status_fail "build" "NOT CONFIGURED: select/adapt a profile and replace scripts/commands/build.sh"
exit 2
