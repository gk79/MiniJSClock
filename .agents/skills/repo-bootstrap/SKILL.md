---
name: repo-bootstrap
description: Materialize an approved technology/data/deployment choice into this starter's canonical command contract, reproducible toolchain, baseline CI, and runnable smoke-tested repository before feature work.
---

Read `docs/AI_WORKFLOW.md`, approved requirements, architecture/ADRs, quality strategy, deployment design, and selected `profiles/` guidance first. Require an explicitly approved technical Project identifier in `docs/current-state.md` and an approved `docs/agentic/project-capabilities.md` before materialization. The Product/display name may remain `TBD`. Do not infer durable project, package, namespace, executable, service, artifact, or product names from examples, repository/directory names, placeholders, or chat; surface a missing identity decision.

1. Pin runtimes/package managers/toolchain versions and produce lockfiles where supported. Separately provision required tools persistently and activate the intended executables in the documented developer environment; pinning alone proves neither provisioning nor activation.
2. Configure native formatter/linter/type/test/build tooling for the chosen stack; keep security minimal by wiring the local Gitleaks + OSV-Scanner baseline and add stronger stack-specific checks only when the threat model requires them.
3. Implement the adapters under `scripts/commands/` while preserving the Make target interface. Every target must become deterministic after bootstrap; when a capability is genuinely not applicable, implement an explicit successful `NOT APPLICABLE: <reason>` adapter and document why in the quality strategy.
4. Create the smallest runnable vertical skeleton plus a smoke test.
5. Materialize only capabilities approved by the Project Capability Review, including project-relevant VS Code extensions and MCP/tool access. Propose newly discovered needs for review rather than installing them opportunistically.
6. If the project uses hosted CI, configure it to run `make ci` in a clean environment. Hosted CI is optional; the local canonical gates remain authoritative.
7. Run `make doctor`, `make harness-check`, clean bootstrap, `make verify`, and the smallest runtime smoke path. Re-run at least `make doctor` and `make verify` from a fresh ordinary developer environment; check command resolution and approved identifier consistency.
8. Record exact tool versions, commands, evidence, remaining environment prerequisites, and deviations in project docs/current state. State executor/sandbox limitations honestly and leave unobserved acceptance evidence open.

Do not begin feature implementation until the baseline repo can prove its own health.

## Language policy

Write all durable repository output from this skill in English unless the output is explicitly localized product content.
