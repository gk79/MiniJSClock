---
name: project-handoff
description: Persist a compact durable handoff for this repository by updating task/current-state artifacts with facts, evidence, decisions, deviations, risks, and one clear next action; use between sessions/tools.
---

Read `docs/AI_WORKFLOW.md`. Do not summarize the whole conversation.

1. Update the active task: status, important discoveries, files changed, commands/evidence, deviations, unresolved risks/follow-ups, and `Next handoff`. If risk/scope changed, record the escalation and adjust the recommended execution profile/reasoning target rather than silently widening work. A formal `REQUEST CHANGES` verdict keeps the task active. Use terminal `done` and move to `tasks/done/` only after required fresh-session independent review and final verification pass.
2. Update `docs/current-state.md` only when project-level state changed.
3. Store consequential architecture decisions as ADRs rather than handoff prose.
4. Point to canonical files instead of duplicating them.
5. State one clear next recommended action.
6. Avoid volatile durable prose such as “uncommitted worktree awaiting commit” or requiring the closing commit to name its own SHA. If handing off to a tool without live repo access or if local uncommitted state matters, run `make context` and pass the resulting snapshot.

A fresh agent should be able to resume without the previous transcript.

## Language policy

Write all durable repository output from this skill in English unless the output is explicitly localized product content.
