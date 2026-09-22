# Codex custom agents

Codex already provides built-in `default`, `worker`, and `explorer` roles. Do not recreate them unless you need materially different behavior.

This starter adds only narrow read-only reviewers/researchers.

## `reviewer`

Use as an **inner-loop advisory reviewer** during implementation or as a helper when inspecting a diff. An implementer-spawned reviewer normally inherits the parent session's model/reasoning unless explicitly overridden, so it does **not** by itself satisfy a task's formal `Required review`.

A formal independent review is a fresh top-level Codex session with the physical model/reasoning selected from the task's required logical review level (`independent-cloud-standard` or `independent-cloud-deep`) through Layer 0.

Example advisory instruction:

```text
Have reviewer review the current branch against the active task and relevant ADRs. Re-run or request concrete evidence for blocking findings. Do not modify files.
```

## `security_reviewer`

Use when a change touches authentication/authorization, trust boundaries, user input, secrets, sensitive data, dependencies, database permissions, infrastructure, or deployment permissions.

Example:

```text
Have security_reviewer inspect TASK-0042 and this diff. Focus on exploitable behavior and boundary mistakes, not generic hardening advice.
```

## `docs_researcher`

Use for version-sensitive framework/API facts before implementation or during review.

Example:

```text
Have docs_researcher verify the current supported way to configure <framework capability>; return authoritative references and version assumptions only.
```

## `harness_reviewer`

Use when a learning candidate proposes changing tests, CI, skills, AGENTS, or other harness controls. It reviews whether the lesson is sufficiently general/evidenced and recommends the narrowest control.

## Model selection

The starter deliberately does not hardcode physical model names in `.codex/agents/*.toml`. Models change faster than project policy, and repository policy should stay portable. Implementer-spawned custom agents normally inherit the parent/default model/reasoning unless the runtime call or local configuration overrides it.

Therefore:

- delegated `reviewer` / `security_reviewer` subagents are useful **inner-loop sensors**;
- `Required review: independent-*` means a **fresh top-level session** by default;
- the formal review model/reasoning comes from the workstation Layer 0 mapping, not from repository TOML.
