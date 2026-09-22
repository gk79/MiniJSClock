# Model routing and execution profiles

Use model strength according to ambiguity, risk, complexity, and verifiability—not according to which UI happens to be open.

The repository stores **logical execution profiles**, not physical model names. Each workstation's Layer 0 configuration maps those stable profiles to the currently appropriate runtime/model and to the closest supported reasoning setting.

This keeps project task contracts portable across different computers, agent harnesses, and future model generations.

## 1. Stable execution profiles

### `chatgpt-analysis`

Use for high-ambiguity/high-leverage reasoning that should produce or update durable project artifacts before implementation:

- problem discovery and requirements;
- NFR analysis;
- architecture/technology trade-offs;
- threat modelling;
- implementation-plan critique;
- difficult incident/root-cause reasoning;
- consequential decision review.

This is not a Codex implementation profile.

### `local-fast` — optional

Use only when the workstation has an **ergonomic, validated local-model-capable harness** for low-risk bounded work where deterministic checks are strong:

- mechanical edits;
- simple scripts;
- small isolated code changes;
- documentation updates grounded in repository facts;
- straightforward test additions.

`local-fast` does **not** imply Codex + Ollama. The local executor may be another harness, provided it follows the same repository/task/verification contract. If no convenient local path exists on the workstation, mark this profile unavailable and route suitable work to `cloud-efficient` instead.

Do not make this profile the sole decision-maker for authentication, authorization, cryptography, destructive data changes, production permissions, security boundaries, consequential migrations, or difficult architectural choices.

### `cloud-efficient`

Use an efficient cloud Codex configuration for clear, bounded implementation work that is easy to verify and does not need the strongest reasoning available.

Typical examples:

- small features that follow an established pattern;
- localized bug fixes with a known cause;
- routine test additions;
- bounded repository maintenance.

### `cloud-standard`

Default profile for normal repository-aware engineering:

- multi-file feature implementation;
- ordinary debugging;
- API/UI changes with clear acceptance criteria;
- integration work;
- non-trivial refactoring protected by tests.

### `cloud-deep`

Use the strongest appropriate cloud Codex configuration when the work has high complexity, high uncertainty, high blast radius, or expensive failure modes:

- difficult debugging and concurrency problems;
- security-sensitive implementation;
- non-trivial migrations;
- complex CI/CD or infrastructure work;
- changes crossing multiple architectural boundaries;
- tasks where verifying a confident but wrong result would be expensive.

### `human-only`

Use when the required action or decision should not be delegated to an AI executor, for example a consequential risk acceptance, production approval, or an external action that policy reserves for a person.

## 2. Reasoning target

Each ready task also carries a logical `Reasoning target`:

- `n/a` — no Codex reasoning setting applies;
- `low` — clear and bounded work;
- `medium` — normal engineering default;
- `high` — difficult or uncertain work;
- `maximum` — reserve the strongest supported reasoning setting for exceptional tasks where extra compute is justified.

Layer 0 maps this target to the nearest reasoning-effort setting supported by the selected runtime/model. Do not assume every model or harness exposes the same labels.

Default pairings are:

| Execution profile | Default reasoning target |
|---|---|
| `chatgpt-analysis` | `n/a` |
| `local-fast` | `low` |
| `cloud-efficient` | `low` |
| `cloud-standard` | `medium` |
| `cloud-deep` | `high` |
| `human-only` | `n/a` |

A planner may override the default when the task warrants it.

## 3. Routing rubric

Choose a profile by considering four factors together:

1. **Risk** — cost/blast radius of being wrong.
2. **Complexity** — intrinsic implementation difficulty and number of interacting parts.
3. **Uncertainty** — how much discovery or reasoning is still required before implementation is clear.
4. **Verifiability** — how cheaply and deterministically correctness can be checked.

Useful tendencies:

- low risk + low uncertainty + high verifiability -> `cloud-efficient`, or `local-fast` only when the workstation provides a validated local path;
- normal product work with clear acceptance criteria -> `cloud-standard`;
- high uncertainty, complex interactions, security boundaries, migrations, or expensive failure -> `cloud-deep`;
- unresolved product/architecture ambiguity -> `chatgpt-analysis` before implementation;
- non-delegable approval/action -> `human-only`.

Do not route on line count alone. A 15-line authorization change can deserve `cloud-deep`; a large mechanical transformation with excellent tests may be suitable for `cloud-efficient` or an enabled `local-fast` path.

## 4. When routing happens

Routing is part of planning, not an ad-hoc question asked from scratch before every coding session.

1. During implementation planning, ChatGPT/planner creates bounded tasks and proposes `Risk`, `Execution profile`, `Reasoning target`, and `Required review` using this rubric.
2. Before implementation, the executor validates that the assigned profile is compatible with the current task state and the workstation's Layer 0 mapping.
3. If `local-fast` is assigned but unavailable on the current workstation, re-route to `cloud-efficient` before editing rather than improvising an inconvenient local runtime.
4. If assumptions change during work, use the escalation rule rather than silently broadening scope.

For unusual or ambiguous routing decisions, ask ChatGPT/human to reassess. Simple routing should remain rule-based.

## 5. One task, one primary implementation session

For an implementation task, default to **one task -> one primary implementation session in the assigned harness**.

For the core cloud profiles, that session is a Codex session. For optional `local-fast`, use the workstation's validated local harness.

Within that primary session:

- select the physical runtime/model and reasoning setting from the task's logical profile before implementation starts;
- keep the physical model stable for the session where the harness permits it;
- normally keep the reasoning setting stable as well;
- if the same model remains appropriate but the task proves harder, increasing reasoning may be acceptable when the runtime supports it;
- allow advisory reviewer subagents inside the implementation loop, but do not treat them as satisfying a formal independent-review requirement; formal independent review defaults to a fresh top-level session.

This improves context coherence and may also improve cache reuse in runtimes that support prompt-prefix caching, but caching is a secondary benefit—not the reason for the policy.

If the task grows beyond its original boundary or requires a stronger execution profile, do not force the original session to continue. Persist discoveries/evidence in the task, end the session, and start a fresh session using the escalated profile.

If a task repeatedly cannot fit a coherent implementation session, treat that as a signal that the task may need to be decomposed.

## 6. Encode routing in the task

Each ready task should declare:

- `Risk`;
- `Execution profile`;
- `Reasoning target`;
- `Required review` (`none`, `independent-cloud-standard`, `independent-cloud-deep`, or `human`);
- `Security impact` (`none` or `material`) plus a short rationale;
- `Next handoff`.

For `Security impact: material`, re-check the threat model and make the formal independent review explicitly security-focused. Default to `independent-cloud-deep` when the change affects authentication/authorization, secrets, sensitive data, trust boundaries, cryptography, production permissions, or similarly expensive failure modes.

The task is the durable routing contract; chat history and workstation-specific model names are not.

Do **not** normally write concrete model version names into project task files. Model availability changes faster than project intent. Resolve the logical profile through Layer 0 on the machine doing the work.

## 7. Escalation rule

The assigned profile may proceed only while the task's assumptions, scope, and risk remain valid. If work exposes materially greater ambiguity, blast radius, or risk, stop instead of silently broadening scope.

Escalate when you discover, for example:

- an unapproved architecture decision;
- authentication/authorization or other security-boundary work;
- a destructive/non-trivial data migration;
- an unapproved public contract change;
- production IAM, secrets, network, or infrastructure changes;
- a consequential new production dependency;
- verification that cannot be made sufficiently deterministic.

Record the discovery in the active task, set the task to `blocked` or otherwise flag the decision, and recommend the next execution profile/reviewer. Typical escalation is `local-fast`/`cloud-efficient` -> `cloud-standard` or `cloud-deep`; design ambiguity may instead require `chatgpt-analysis` or a human decision first.

## 8. Workstation mapping belongs to Layer 0

The mapping from logical profiles to physical runtimes/models is intentionally workstation-specific.

Cloud mappings may differ as model availability evolves. `local-fast` may be enabled on one computer and unavailable on another. The project contract remains stable because the task expresses required capability, not a specific model binary.

Use `workstation/execution-profile-mapping.md.example` when configuring a machine. The filled mapping should live in that workstation's Layer 0 configuration, not as project-specific source of truth.

## 9. Optional local execution

Local inference is an optimization, not a requirement of the SDLC.

Enable `local-fast` only when all of the following are true:

- the local path is easy enough to select that it will actually be used;
- its tool/edit behavior is reliable for the intended tasks;
- it can consume the repository's durable task and verification contract;
- representative benchmarks show worthwhile privacy/cost/latency benefits;
- deterministic verification remains strong.

Do not force a local model through Codex CLI merely because `--oss` exists if the primary VS Code workflow makes that path inconvenient. A separate VS Code local-agent harness backed by Ollama can be valid, but it should remain a secondary worker and must not create a parallel SDLC policy.
