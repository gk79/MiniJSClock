#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"
status_info run "starting Vite development server"
exec npm run dev -- "$@"
