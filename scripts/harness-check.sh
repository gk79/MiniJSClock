#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/output.sh"

missing=0
required_files=(
  AGENTS.md
  Makefile
  docs/AI_WORKFLOW.md
  docs/agentic/chatgpt-project.md
  docs/agentic/model-routing.md
  workstation/codex/AGENTS.md.example
  workstation/execution-profile-mapping.md.example
  docs/product/problem.md
  docs/product/requirements.md
  docs/architecture/architecture.md
  docs/architecture/threat-model.md
  docs/quality/quality-strategy.md
  docs/delivery/deployment.md
  docs/current-state.md
  tasks/TEMPLATE.md
  docs/agentic/learning-loop.md
  scripts/lib/output.sh
  scripts/status.sh
)

for f in "${required_files[@]}"; do
  if [[ -f "$f" ]]; then
    status_pass file "$f"
  else
    status_fail file "missing: $f"
    missing=1
  fi
done

check_contains() {
  local file="$1" pattern="$2" label="$3"
  if grep -Eq "$pattern" "$file"; then
    status_pass policy "$label"
  else
    status_fail policy "$label"
    missing=1
  fi
}

check_contains AGENTS.md 'docs/AI_WORKFLOW\.md' 'AGENTS -> AI_WORKFLOW wiring'
check_contains docs/agentic/chatgpt-project.md 'docs/AI_WORKFLOW\.md' 'ChatGPT -> AI_WORKFLOW wiring'
check_contains workstation/codex/AGENTS.md.example 'repository as the durable source of truth' 'global repository-as-memory policy'
check_contains workstation/codex/AGENTS.md.example 'Stop and escalate' 'global escalation policy'
check_contains workstation/README.md 'canonical portable template' 'canonical global AGENTS template documented'
check_contains docs/agentic/global-setup.md '~/.agents/skills' 'cross-surface user skill policy'
check_contains docs/agentic/skills-policy.md 'IDE extension does.*not.*support.*plugins' 'IDE plugin limitation documented'
check_contains docs/agentic/global-setup.md 'codex mcp add context7' 'Context7 global MCP setup documented'
check_contains docs/agentic/global-setup.md 'shared between CLI and IDE' 'MCP CLI/IDE sharing documented'
check_contains docs/agentic/model-routing.md 'fresh top-level session' 'formal independent-review boundary documented'
check_contains docs/quality/quality-strategy.md 'Gitleaks' 'minimal local secret scanning documented'
check_contains docs/quality/quality-strategy.md 'OSV-Scanner' 'minimal local dependency scanning documented'

if grep -Rqs 'codex plugin add agent-skills@agent-skills' README.md docs workstation; then
  status_fail policy 'stale plugin-only agent-skills baseline detected'
  missing=1
fi
if grep -Rqs 'codex plugin add context7@context7-marketplace' README.md docs workstation; then
  status_fail policy 'stale plugin-only Context7 baseline detected'
  missing=1
fi

for field in 'Execution profile:' 'Reasoning target:' 'Required review:' 'Security impact:' 'Security rationale:' 'Next handoff:' 'Escalation triggers'; do
  if grep -q "$field" tasks/TEMPLATE.md; then
    status_pass task-contract "$field"
  else
    status_fail task-contract "missing field: $field"
    missing=1
  fi
done

bytes=$(wc -c < AGENTS.md)
status_info AGENTS.md "${bytes} bytes"
if (( bytes > 24576 )); then
  status_warn AGENTS.md 'getting large; move workflow/reference material into skills/docs'
fi

for f in scripts/commands/*.sh scripts/status.sh scripts/context-snapshot.sh scripts/record-learning.sh; do
  [[ -x "$f" ]] || status_warn executable "$f is not executable"
done

if [[ -f .codex/hooks.json && -f .codex/hooks.json.example ]]; then
  status_info hooks 'project hooks enabled; review with Codex /hooks after changes'
fi

if (( missing )); then
  status_fail HARNESS-CHECK 'one or more harness invariants failed'
  exit 1
fi
status_pass HARNESS-CHECK 'repository harness baseline is consistent'
