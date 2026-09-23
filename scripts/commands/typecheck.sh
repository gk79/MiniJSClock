#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
npm run type-check
status_pass typecheck "Vue and TypeScript checks passed"
