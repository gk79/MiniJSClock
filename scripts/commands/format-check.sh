#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
npm run format:check
status_pass format-check "Prettier found no formatting differences"
