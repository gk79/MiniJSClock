# Agentic SDLC Starter v2.8

A technology-agnostic repository skeleton for AI-assisted / agentic software delivery.

> **v2.6 practical-baseline update.** The baseline now distinguishes advisory subagent review from formal independent review, adds a deliberately small local SSDLC baseline (Gitleaks + OSV-Scanner), standardizes human-readable PASS/WARN/N/A/FAIL output, and removes remote CI/GitHub services from the mandatory local workflow. The experimental durable-state Markdown checker from validation was **not** promoted because it did not pass independent review.

## Design principle

The repository is the durable project memory. Chats and agent sessions are temporary workspaces.
The starter separates reusable concerns into four composable layers:

1. **Global workstation layer** — tools, cross-surface user skills, shared MCP configuration, Codex safety defaults, and workstation model mappings used across projects.
2. **Tech-agnostic repository base** — project rules, documentation contracts, task state, canonical commands, CI entry point, reviewer agents, and learning loop.
3. **Stack / data / deployment profiles** — technology-specific toolchains and command implementations selected after architecture decisions.
4. **Project-specific knowledge** — problem, requirements, architecture, ADRs, threat model, deployment decisions, active tasks, evidence, and learned constraints.

See `docs/agentic/layers.md` and `profiles/README.md`.

Task contracts use portable logical execution profiles rather than physical model names. Each workstation's Layer 0 configuration maps the core cloud profiles (`cloud-efficient`, `cloud-standard`, `cloud-deep`) to current Codex models/reasoning settings. `local-fast` is optional: enable it only where an ergonomic, validated local-model-capable harness exists; otherwise route that class of work to `cloud-efficient`.

## Artifact and instruction map

Use each artifact for one purpose; avoid copying the same policy into multiple places.

| Artifact | Primary reader | Role | How it is discovered/used |
|---|---|---|---|
| Agentic SDLC Handbook (separate companion document) | Human | Conceptual manual and rationale | Read when learning/designing the process; not loaded into every agent session |
| `workstation/codex/AGENTS.md.example` | Codex on every workstation | Canonical portable template for global `~/.codex/AGENTS.md` working agreements | Copy to each workstation during Layer 0 setup; change the template first when evolving global policy |
| `AGENTS.md` | Codex | Small stable repository rules | Codex discovers it automatically before work |
| `docs/AI_WORKFLOW.md` | ChatGPT + Codex + optional local executor + human | Canonical shared AI operating contract | `AGENTS.md` requires Codex to read it; ChatGPT Project Instructions point to it |
| `docs/agentic/chatgpt-project.md` | Human configuring ChatGPT | Exact Project Instructions and ChatGPT setup procedure | Copy the canonical instructions into ChatGPT Project settings once the repository exists |\n| `docs/agentic/METHOD_GUIDE_EN.md` / `METHOD_GUIDE_PL.md` | Human using the Method Guide | Equivalent invocation prompts for step-by-step Method navigation; EN is the canonical semantic source | Keep one long-running Guide chat for your own work across Method phases by default; choose the conversational language you prefer |
| `tasks/active/TASK-*.md` | Current executor/reviewer | Bounded work, logical execution profile, reasoning target, acceptance, evidence, handoff | Read at task start and update before handoff |
| `docs/current-state.md` | All participants | Compact project-level state/index | Read when project status matters; keep concise |
| `docs/agentic/*` | Human/agents as needed | Detailed process policies | Load only when relevant; `AI_WORKFLOW.md` routes to them |
| `workstation/execution-profile-mapping.md.example` | Human configuring Layer 0 | Template for resolving portable execution profiles to physical models on one computer | Fill separately on each workstation; do not turn the filled machine mapping into project policy |

The Handbook explains **why**. The Starter implements **how**. `docs/AI_WORKFLOW.md` tells all AI participants **how to cooperate on this repository**.

## Language policy

Keep the durable engineering corpus in English, even when planning conversations happen in another language. This applies to repository names and paths, code identifiers/comments, documentation, ADRs, tasks, agent instructions, skills, scripts and messages, CI/CD configuration, commit messages, and pull-request text. Localized product/UI content may use the target user language when required. Explicitly maintained localized variants of human-facing invocation prompts are also allowed when a canonical English semantic source is identified and equivalence is maintained; this exception does not generalize to ordinary engineering artifacts or operational agent policy.

## Recommended global setup

Install universal workstation tools separately from the repo. See `docs/agentic/global-setup.md`. During Layer 0 setup, install `workstation/codex/AGENTS.md.example` as the canonical global `~/.codex/AGENTS.md` on each development workstation.

For generic engineering workflows that must be available in both Codex CLI and the VS Code IDE extension, install reviewed skills at user scope under `~/.agents/skills`. The recommended baseline is a pinned/reviewed clone of Addy Osmani's `agent-skills` exposed through symlinked skill directories. See `docs/agentic/global-setup.md` and `docs/agentic/skills-policy.md`.

Configure Context7 as a **global MCP**, not as a plugin, when both CLI and IDE need current framework/library documentation:

```bash
codex mcp add context7 --url https://mcp.context7.com/mcp/oauth
codex mcp login context7
```

Codex plugins remain useful on supported surfaces, but the IDE extension does not support them, so plugin-only capabilities are not part of this cross-surface baseline.

Keep repository-local skills only for workflows that depend on this repository's conventions:

- `repo-bootstrap`
- `project-handoff`
- `harness-retrospective`

## New project sequence

1. Keep a loose idea in an ordinary ChatGPT chat if that is sufficient. Once you decide to seriously explore it as a potential software project, create a dedicated ChatGPT Project and, if you use the Method Guide, start one long-running Guide chat for your work using `docs/agentic/METHOD_GUIDE_EN.md` or the equivalent `METHOD_GUIDE_PL.md`.
2. Once the problem is concrete enough that important requirements, decisions, and their evolution deserve version history, create a repository from this base template, configure the ChatGPT Project with `docs/agentic/chatgpt-project.md`, connect authorized repository access when available, and continue your Guide chat against repository state. Other contributors may use their own chats; no chat is shared project memory. From this point use `docs/AI_WORKFLOW.md` as the shared AI operating contract.
3. Write and approve `docs/product/problem.md` and `docs/product/requirements.md`.
4. Evaluate architecture options; capture consequential decisions as ADRs.
5. Select stack, data, and deployment profiles from `profiles/` and adapt them to the approved architecture.
6. Bootstrap the real toolchain and implement the canonical command contract behind `Makefile`.
7. Configure a shared remote repository and live coordination surface before multiple humans begin concurrent implementation; hosted CI remains optional, but if enabled it should run `make ci` in a clean environment. Local correctness must not depend on a particular hosted CI service.
8. Decompose implementation in `docs/delivery/implementation-plan.md`. When multiple humans will work concurrently, make blocking dependencies and unsafe collisions explicit as a simple task DAG; for simple solo or naturally linear work, an explicit DAG is optional.
9. Create bounded executable task contracts under `tasks/active/` as work becomes ready and assign logical execution profiles/reasoning targets using `docs/agentic/model-routing.md`. Keep live assignee/status coordination on the shared collaboration surface rather than duplicating it into task Markdown.
10. Resolve each task profile through the current workstation's Layer 0 mapping and implement it in one primary session in the assigned harness by default: baseline -> change -> verification -> formal independent review when required -> handoff. For concurrent work, isolate task changes, integrate through the shared remote target, and re-verify against the current integration candidate before merge. Cloud profiles use Codex; optional `local-fast` uses the validated local harness if one exists.
11. Deploy through staging/acceptance gates and an explicit production approval when the project has a deployment target.
12. Capture recurring problems as learning candidates and promote only verified lessons into executable controls.

## Canonical command contract

Agents should not have to remember stack-specific commands. They use this stable interface:

```bash
make doctor
make bootstrap
make format-check
make lint
make typecheck
make test
make test-integration
make test-e2e
make security
make build
make verify
make ci
make run
make context
make learn TITLE="short-description"
```

The implementations live under `scripts/commands/`. Most are stack-specific after profile selection; `make security` provides a small cross-stack baseline using local, free tools. After bootstrap, every canonical target should have deterministic behavior. Human-facing output should use PASS/WARN/N/A/FAIL labels; color is presentation only and must not replace exit codes. If a capability genuinely does not apply to the selected architecture (for example browser E2E tests for a pure CLI library), implement an explicit successful `N/A` adapter and record the rationale in `docs/quality/quality-strategy.md`. Do not leave ambiguous placeholder failures in a materialized project.

## Agent roles

- **ChatGPT** — problem discovery, requirements, architectural trade-offs, research, plan critique, risk analysis, and decision support.
- **Codex/cloud models** — repository-aware implementation using `cloud-efficient`, `cloud-standard`, or `cloud-deep` according to task routing. Implementer-spawned reviewer subagents are advisory; a formal `independent-*` gate uses a fresh top-level session.
- **Optional local-model executor** — `local-fast` only when Layer 0 provides an ergonomic, validated local harness; otherwise use `cloud-efficient`. The local harness is secondary and must follow the same repository/task/verification contract.
- **Humans** — own intent, architecture/risk acceptance, merge/release decisions, and promotion of cross-project harness rules; the Method does not prescribe how a team distributes those decisions internally.

## Source of truth

The core operating rule is simple: **persist important state in versioned artifacts, not in chat history**.

Use `scripts/context-snapshot.sh` only as a compact transfer packet when an external chat cannot directly retrieve the relevant repository state or when uncommitted local state matters.
