# Project agent instructions

## Mission

Work as a careful software engineer. Optimize for correctness, security, simplicity, maintainability, and verifiable outcomes rather than speed or code volume.

## Source of truth

1. Executable behavior: code, tests, schemas, infrastructure-as-code, CI configuration.
2. Product intent: `docs/product/`.
3. Architecture and decisions: `docs/architecture/` and ADRs.
4. Quality constraints: `docs/quality/`.
5. Delivery/operations: `docs/delivery/`, `docs/operations/`.
6. Current project state: `docs/current-state.md`.
7. Current task contract: `tasks/active/`.

If sources conflict, stop and surface the conflict instead of guessing.

## Shared AI operating contract

Before substantive planning, implementation, review, debugging, delivery, or harness work, read `docs/AI_WORKFLOW.md`. It defines how ChatGPT, Codex with cloud models, Codex with local models, and humans coordinate through this repository.

Do not assume that another AI participant has access to the current chat or session. Persist decisions, discoveries, evidence, and handoffs in the repository artifacts defined by `docs/AI_WORKFLOW.md`. Read deeper files under `docs/agentic/` only when they are relevant to the current task.

## Language policy

Use English for all durable repository artifacts, regardless of the language used in chat or task discussion. This includes file and directory names, source identifiers where applicable, code comments, documentation, ADRs, task files, agent instructions, skills, scripts, CI configuration and messages, commit messages, and pull-request text.

Product-facing content may use another language only when localization or a specific user requirement calls for it. Explicitly maintained localized variants of human-facing invocation prompts are also allowed when they identify a canonical English semantic source and are kept equivalent. This does not permit localized duplicates of ordinary engineering documentation, task contracts, ADRs, code, or operational agent policy. Keep the engineering source of truth and canonical identifiers in English.

## Before changing code

- Read the current task and relevant documentation. Confirm that the current executor/workstation can satisfy its `Execution profile` and `Reasoning target`; if not, hand off or escalate instead of implementing.
- Inspect the real implementation and existing tests; do not infer APIs from names alone.
- Run the smallest canonical baseline command that proves the starting state is healthy.
- Identify scope, risks, relevant acceptance criteria, and the task's `Security impact`. If it is `material`, read/re-check the threat model before implementation.
- For implementation tasks, treat one task as one primary implementation session by default. Keep the physical model stable for that session; if a stronger execution profile becomes necessary, persist the handoff and start a fresh session rather than silently switching scope/model mid-task.
- Do not add production dependencies, change public interfaces, alter database schemas, or modify deployment/security boundaries unless the task explicitly permits it.

## Implementation discipline

- Prefer the smallest coherent change that satisfies the task.
- Follow existing patterns unless an ADR or explicit task changes them.
- Keep modules cohesive and dependencies directional.
- Validate data at trust boundaries.
- Never commit secrets or credentials.
- Do not weaken tests, linting, security checks, or CI to make a change pass.
- Keep unrelated formatting/refactoring out of feature changes unless required for correctness.

## Verification

Use repository-provided commands. At minimum, run the checks relevant to changed behavior. For non-trivial changes, run `make verify` before declaring completion.

Implementer-spawned reviewer subagents are advisory inner-loop sensors. When the task requires `independent-*` review, use a fresh top-level review session at the logical review level specified by the task.

Completion requires evidence, not a statement that the code "looks correct". Record commands run and outcomes in the task file or handoff.

## Documentation and handoff

Update documentation when behavior, interfaces, architecture, deployment, operations, or user-visible behavior changes. Update active task state and `docs/current-state.md` when project-level state changes. Keep rejected/rework tasks under `tasks/active/`; move a task to `tasks/done/` only after required formal review and final verification pass.

Before handing off non-trivial work, run a harness retrospective: if the task exposed a recurring failure, undocumented environmental fact, missing quality gate, or reviewer finding that should be prevented next time, create a learning candidate with `make learn TITLE="..."` and fill in its evidence.

Do not silently rewrite `AGENTS.md`, CI policy, security policy, or global skills from a single incident. Promote learning candidates only after review; prefer executable controls (tests, static checks, scripts, CI) over prose rules.

## Git and deployment

- Keep changes reviewable and scoped to one task.
- Do not rewrite shared history unless explicitly instructed.
- Do not merge or deploy to production unless explicitly authorized.
