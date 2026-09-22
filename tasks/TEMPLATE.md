# TASK-XXXX: Short outcome title

- Status: ready | in-progress | blocked | review | done
- Risk: low | medium | high
- Execution profile: chatgpt-analysis | local-fast | cloud-efficient | cloud-standard | cloud-deep | human-only
- Reasoning target: n/a | low | medium | high | maximum
- Required review: none | independent-cloud-standard | independent-cloud-deep | human
- Security impact: none | material
- Security rationale: one short sentence
- Next handoff: none | chatgpt-analysis | local-fast | cloud-efficient | cloud-standard | cloud-deep | independent-review | human

`local-fast` is optional. Assign it only when the current workstation's Layer 0 mapping marks a validated local execution path as available; otherwise use `cloud-efficient`.

Lifecycle rule: `ready`, `in-progress`, `blocked`, and `review` tasks live under `tasks/active/`. Use `done` only after required formal independent review (if any) and final verification pass; move the task to `tasks/done/` in the same closure change. Avoid volatile prose such as “uncommitted worktree awaiting commit” or requiring a commit to name its own SHA.
- Related requirements: FR-..., NFR-...
- Related ADRs:

## Goal

One observable outcome.

## Non-goals

Explicitly state what must not be changed.

## Context

Only task-relevant context. Link to canonical docs rather than copying them.

## Allowed / expected scope

- Likely files/modules:
- Interfaces that may change:
- Production dependencies allowed? yes/no
- Schema/infra/security boundary changes allowed? yes/no

## Escalation triggers

List task-specific conditions that invalidate the assigned execution profile or approved scope. The general escalation rules in `docs/AI_WORKFLOW.md` always apply.

- Trigger:
- Required action/profile:

## Acceptance criteria

- [ ] Behavior ...
- [ ] Error/edge behavior ...
- [ ] Documentation/operations ...

## Verification plan

- Baseline command(s):
- Required automated checks:
- Runtime/manual scenario:
- Security/review checks:

## Implementation notes

Record important discoveries and deviations here. Do not paste long transcripts. If scope/risk changes, stop and use the escalation contract rather than silently widening the task.

## Evidence / completion

- Files changed:
- Commands run and outcomes:
- Runtime evidence:
- Reviewer verdict:
- Remaining risks/follow-ups:
- Handoff completed to:
