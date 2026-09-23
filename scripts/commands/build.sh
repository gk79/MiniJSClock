#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
npm run build
status_pass build "static production assets written to dist/"
