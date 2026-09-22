# Shared AI Operating Contract

This document is the canonical short operating contract for every AI participant working on this repository. It explains roles, durable state, routing, handoffs, escalation, session boundaries, and the minimum startup context. Detailed policies live under `docs/agentic/`.

## 1. Core rule

The repository is the durable project memory. Chat histories and agent sessions are temporary workspaces.

Do not assume that ChatGPT, a Codex cloud session, an optional local-model executor session, or a future session has access to another participant's conversation. Important decisions, discoveries, evidence, and state transitions must be written to versioned repository artifacts.

## 2. Roles

- **Humans** — own the outer loop: product intent, risk acceptance, consequential architecture decisions, merge/release policy, and promotion of reusable harness rules. In a multi-contributor project, the Method does not prescribe how the team distributes that authority internally.
- **ChatGPT** — reduces ambiguity: problem discovery, requirements, architecture/technology trade-offs, research, threat modelling, planning, routing proposals, and independent high-level review. It should turn important conclusions into proposed repository artifacts rather than leave them only in chat.
- **Codex with a cloud model** — primary repository-aware engineering executor for normal and difficult implementation, debugging, verification, CI/CD, infrastructure, migrations, and other work assigned a cloud execution profile.
- **Optional local-model executor** — secondary low-cost/private executor for `local-fast` only when Layer 0 provides an ergonomic, validated local harness. It does not have to be Codex, but it must follow the same repository/task/verification contract. If unavailable, route the task to `cloud-efficient`.
- **Specialized Codex reviewer/researcher subagents** — narrow advisory roles such as `reviewer`, `security_reviewer`, `docs_researcher`, and `harness_reviewer`. Reviewer subagents are optional sensors, used selectively for a concrete specialist need; they do not satisfy formal independent-review requirements.

Tasks use stable logical execution profiles (`chatgpt-analysis`, optional `local-fast`, `cloud-efficient`, `cloud-standard`, `cloud-deep`, `human-only`) rather than physical model version names. Layer 0 maps cloud profiles to current Codex models/reasoning settings and may optionally map `local-fast` to a separate local-model-capable harness.

See `docs/agentic/model-routing.md` and `docs/agentic/custom-agents.md`.

## 3. Minimum startup context

### Codex

Codex discovers `AGENTS.md` automatically. `AGENTS.md` requires this file to be read before substantive work. Then read only the smallest additional slice needed for the task:

1. active task under `tasks/active/`, if one exists;
2. linked requirements and ADRs;
3. `docs/current-state.md` when project-level status matters;
4. relevant code/tests/configuration;
5. deeper `docs/agentic/` policy only when the task needs it.

For implementation, verify that the current workstation/model can satisfy the task's `Execution profile` and `Reasoning target`. If not, hand off or escalate before editing files.

### ChatGPT

The ChatGPT Project Instructions must point to this file as the process entry point. When live repository access is available, the normal startup order is:

1. `docs/AI_WORKFLOW.md`;
2. `docs/current-state.md`;
3. active task, if relevant;
4. linked requirements/ADRs;
5. relevant code, diff, tests, and evidence.

Use `make context` only when live repository access is unavailable, relevant state is uncommitted, or a deliberately bounded transfer packet is desired.

See `docs/agentic/chatgpt-project.md`.

## 4. Durable artifact responsibilities

- `AGENTS.md` — small, stable project operating rules automatically discovered by Codex.
- `docs/AI_WORKFLOW.md` — this shared cross-tool operating contract.
- `docs/product/` — problem and approved product requirements.
- `docs/architecture/` and ADRs — architecture and consequential technical decisions.
- `docs/quality/` — quality/testing constraints.
- `docs/delivery/`, `docs/operations/` — delivery, deployment, operations, and the durable implementation topology when task dependencies matter.
- `tasks/active/TASK-xxxx.md` — bounded work contract, logical execution profile, reasoning target, acceptance criteria, evidence, and immediate handoff.
- `docs/current-state.md` — compact project-level state/index, not a session transcript.
- `.agents/skills/` — only repository-specific procedures.
- external/global skills — reusable general engineering procedures.

If sources conflict, surface the conflict instead of silently choosing one.

When multiple humans implement concurrently, keep durable dependency topology in `docs/delivery/implementation-plan.md` and live assignee/status coordination in one shared collaboration surface (for example GitHub or Azure DevOps). Do not turn `docs/current-state.md` or task Markdown into a duplicate live team board.

## 4.1 Task lifecycle and minimal security contract

- `ready`, `in-progress`, `blocked`, and `review` tasks belong under `tasks/active/`.
- `done` is terminal and belongs under `tasks/done/`. Use it only after required formal independent review and final verification have passed.
- A `REQUEST CHANGES` verdict keeps the task active; remediation is not terminal completion.
- Keep durable state factual but avoid volatile self-referential provenance such as requiring a commit to contain its own final SHA.
- Every task declares `Security impact: none | material` and a short rationale.
- For `material`, re-check `docs/architecture/threat-model.md` and make the required fresh independent review explicitly security-focused.
- `make security` is part of normal verification. The portable baseline is intentionally small: local Gitleaks for secret scanning and OSV-Scanner when supported dependency manifests exist.

## 5. Cross-tool handoff contract

### ChatGPT -> repository -> Codex

`chatgpt-analysis` is not an implementation handoff until the relevant conclusion is persisted or explicitly proposed as a repository artifact. Depending on the work, this may be:

- a requirement update;
- an ADR;
- an architecture/threat-model update;
- an implementation plan;
- a ready task contract including execution profile/reasoning target.

Codex should implement from repository state, not from an assumed transcript of a ChatGPT discussion.

### Codex -> repository -> ChatGPT

After implementation or investigation, Codex persists the information another participant needs:

- task status and evidence;
- important discoveries/deviations;
- project-level state changes in `docs/current-state.md` when appropriate;
- architecture/operations documentation or ADRs when the approved design changed.

ChatGPT should review this durable state and the actual diff/evidence rather than rely on an implementer's narrative.

### Cloud Codex <-> optional local executor

There is no separate conversational handoff protocol. When `local-fast` is enabled, both execution paths share:

- the same repository;
- the same `AGENTS.md`;
- this operating contract;
- the same task contract;
- the same canonical `make` commands;
- the same tests and evidence model.

The local harness may differ, but the durable contracts must not. If no validated local harness exists, use `cloud-efficient` rather than inventing an ad-hoc execution path.

## 6. Model routing, reasoning, and session boundary

Routing is decided during planning and stored in the task as a logical `Execution profile` plus `Reasoning target`. Route using risk, complexity, uncertainty, and strength of deterministic verification. Do not normally store physical model version names in project tasks.

Layer 0 on the machine doing the work resolves the logical profile to an actual runtime/model. `local-fast` is optional and may be unavailable on a workstation; in that case suitable tasks should be re-routed to `cloud-efficient` without changing the project policy.

For implementation tasks, default to **one task -> one primary Codex implementation session**. Select the physical model/reasoning configuration before implementation starts and keep the physical model stable for that primary session. Independent review should use a fresh reviewer/subagent context.

When multiple humans implement concurrently, use one current human assignee for primary implementation of each task. Parallel work should use isolated task changes and a shared remote integration target. A task whose blocking predecessors are not yet integrated is not ready to start implementation, even if its task contract is otherwise complete.

A task assignment is **not** permission to expand scope when assumptions change. Stop and escalate if execution uncovers a materially higher-risk or broader problem than the task permits. Typical escalation triggers include:

- authentication/authorization or another security boundary;
- destructive or non-trivial data migration;
- public API/contract change not already authorized;
- production IAM, secrets, network, or infrastructure changes;
- a new production dependency with material consequences;
- a consequential architecture decision;
- inability to produce the required verification evidence.

Do not infer a `PASS` for evidence the executor cannot observe; record the environment limit and leave the requirement open. When a material external absolute guarantee lacks an authoritative platform contract, stop for a human scope/risk decision. An implementer cannot accept residual risk or relax an application-enforceable requirement.

When escalating: record the discovery in the active task, mark it blocked or needing a decision, recommend the next execution profile/reviewer, and end the current implementation attempt rather than silently broadening it. Start a fresh session when a stronger profile is required. If the discovery invalidates a shared contract or task dependency assumption, stop affected concurrent work and replan the smallest necessary part of the implementation graph before continuing.

See `docs/agentic/model-routing.md`.

## 7. Work loop

`problem -> requirements -> architecture/ADRs -> bootstrap -> local verification baseline -> optional remote CI -> implementation plan + routed tasks -> primary task session(s) -> formal independent review when required -> handoff/integration -> release -> observe -> harness retrospective`

For each implementation task use:

`load -> validate routing -> baseline -> investigate -> implement -> verify -> review -> fix -> handoff -> PR/CI`

For concurrent human implementation, `docs/agentic/workflow.md` adds dependency-aware planning, shared live coordination, isolated task changes, and verification against the current integration target. These collaboration rules are conditional; simple solo work keeps the ordinary single-task path.

See `docs/agentic/workflow.md`.

## 8. Completion and learning

Completion requires evidence, not confidence. Medium/high-risk work requires independent review appropriate to the task. The fresh top-level reviewer owns the formal verdict; reviewer/security-reviewer subagents are selective advisory sensors. After `REQUEST CHANGES`, a required formal re-review remains fresh and top-level; bounded remediation may receive a finding-focused re-review covering prior blocking findings, the remediation diff, and plausible regressions while reusing still-valid evidence. Broaden review when remediation materially changes scope, architecture, security impact, dependencies, lifecycle semantics, or other assumptions or evidence relied on by the previous review. Only humans acting under the project's approved decision policy may durably change or waive a required review contract; an implementer may not self-waive it. Production release is a separate human-controlled verdict unless the project explicitly defines a different approved policy.

Repeated defects, repeated discovery, or reviewer findings should improve the harness through:

`capture -> review -> promote`

Prefer executable controls (tests, schemas/types, static checks, scripts, CI gates) over adding prose instructions. Do not let a single agent incident silently rewrite `AGENTS.md` or global policy.

See `docs/agentic/learning-loop.md`.
