#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
npm run lint
status_pass lint "ESLint completed successfully"
