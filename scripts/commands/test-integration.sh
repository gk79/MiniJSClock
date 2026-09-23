#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
status_na test-integration "bootstrap shell has no meaningful integration boundary; browser smoke is covered by make test-e2e"
