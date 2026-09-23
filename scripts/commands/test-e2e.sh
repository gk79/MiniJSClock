#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
npm run test:e2e
status_pass test-e2e "Playwright browser smoke passed"
