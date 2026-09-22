#!/usr/bin/env bash
set -euo pipefail

title="${1:-}"
if [[ -z "$title" ]]; then
  echo 'Usage: scripts/record-learning.sh "short description"' >&2
  exit 2
fi

stamp=$(date +%Y%m%d-%H%M%S)
slug=$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g' | cut -c1-60)
[[ -n "$slug" ]] || slug="learning"
id="LEARN-${stamp}"
out="docs/agentic/learnings/candidates/${id}-${slug}.md"
mkdir -p "$(dirname "$out")"

python3 - "$out" "$id" "$title" <<'PY2'
from pathlib import Path
import sys
out, ident, title = sys.argv[1:]
template = Path('docs/agentic/learnings/TEMPLATE.md').read_text()
template = template.replace('# Learning candidate: <title>', f'# Learning candidate: {title}', 1)
template = template.replace('LEARN-<timestamp>', ident, 1)
Path(out).write_text(template)
PY2

echo "$out"
