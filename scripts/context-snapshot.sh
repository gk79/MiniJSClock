#!/usr/bin/env bash
set -euo pipefail

out="${1:-.agent-scratch/context-snapshot.md}"
mkdir -p "$(dirname "$out")"
{
  echo "# Context snapshot"
  echo
  echo "Generated: $(date -Iseconds)"
  echo
  echo "## Git"
  echo '```text'
  git status --short --branch
  echo '```'
  echo
  echo "## Recent commits"
  echo '```text'
  git log -5 --oneline --decorate || true
  echo '```'
  echo
  echo "## Current project state"
  cat docs/current-state.md
  echo
  echo "## Active tasks"
  shopt -s nullglob
  for f in tasks/active/*.md; do
    echo
    echo "### $f"
    cat "$f"
  done
  echo
  echo "## Architecture decisions index"
  for f in docs/architecture/decisions/ADR-*.md; do
    [[ -e "$f" ]] || continue
    title=$(grep -m1 '^# ' "$f" || true)
    printf -- '- %s: %s\n' "$f" "${title#\# }"
  done
} > "$out"

echo "$out"
