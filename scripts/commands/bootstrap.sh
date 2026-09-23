#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"

expected_node="v24.21.0"
expected_npm="11.19.0"

if [[ "$(node --version)" != "$expected_node" ]]; then
  status_fail bootstrap "Node $expected_node is required; found $(node --version)"
  exit 1
fi

if [[ "$(npm --version)" != "$expected_npm" ]]; then
  status_fail bootstrap "npm $expected_npm is required; found $(npm --version)"
  exit 1
fi

npm ci
npx playwright install chromium
status_pass bootstrap "dependencies and Chromium restored from pinned project metadata"
