#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
npm run test:unit
status_pass test "Vitest unit/component suite passed"
