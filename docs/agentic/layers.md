# Harness layers

The starter deliberately separates what should be stable across projects from what should change after architecture decisions.

## Layer 0 — global workstation

Lives outside the repository, usually under the user's WSL home directory.

Typical core contents:

- Git, GitHub CLI, Bash, curl, jq, ripgrep, Make.
- Codex CLI and VS Code Codex extension.
- Linux sandbox prerequisites such as `bubblewrap` when required by Codex.
- Reusable user-level skills under `~/.agents/skills` so CLI and IDE extension see the same workflows.
- A small set of broadly useful read-only MCP/documentation tools such as Context7 in `~/.codex/config.toml`.
- Canonical `~/.codex/AGENTS.md` copied from `workstation/codex/AGENTS.md.example`.
- Safe global Codex defaults such as approval/sandbox policy.
- The workstation-specific mapping from portable cloud execution profiles (`cloud-efficient`, `cloud-standard`, `cloud-deep`) and reasoning targets to actual available models/runtime settings.

Optional Layer 0 additions:

- Ollama/local models and a local-model-capable harness for `local-fast`, only when the workflow is ergonomic and benchmarked.
- Codex plugins for surfaces that support them. Do not rely on a plugin when the IDE extension must receive the same capability; the IDE extension does not support plugins.

Do not put project architecture or stack-specific rules here. Do not put physical model version names into project task contracts when a logical profile is sufficient.

## Layer 1 — technology-agnostic repository base

Versioned in every project:

- `AGENTS.md` for Codex-native instruction discovery
- `docs/AI_WORKFLOW.md` as the shared AI operating contract
- canonical ChatGPT Project setup/instructions under `docs/agentic/chatgpt-project.md`
- product/architecture/quality/delivery documentation templates
- task contract and current state
- canonical Make interface
- CI entry point
- Codex reviewer agents
- context export and harness-learning mechanism

This layer defines **how work is controlled**, not which framework is used.

## Layer 2 — stack/data/deployment profiles

Chosen after requirements and architecture are sufficiently understood. Examples live in `profiles/`.

A profile defines:

- runtime/toolchain versions and pinning mechanism
- package manager and lockfile
- formatter/linter/type checker/test runner
- project layout
- stack-specific VS Code extensions
- exact implementations behind canonical `make` targets
- data migration/testing strategy
- deployment packaging and environment needs

Profiles are guidance/overlays, not a second source of truth. Once selected and adapted, the resulting concrete config in the project is authoritative.

## Layer 3 — project-specific knowledge

Everything that exists because of this product:

- problem and users
- functional and non-functional requirements
- architecture and ADRs
- threat model
- deployment topology
- active implementation plan/tasks
- operations/runbook
- verification evidence
- accepted harness learnings

## Why this split

It prevents two common failures:

1. A giant universal template that forces irrelevant tools and assumptions into every project.
2. A blank repository that makes every new project rediscover the same agentic operating model.
