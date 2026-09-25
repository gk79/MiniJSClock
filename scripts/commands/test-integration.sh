#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
node --test scripts/catalog.contract.mjs
node scripts/generate-catalog.mjs --check
status_pass test-integration "catalog rules and offline regeneration match committed output"
