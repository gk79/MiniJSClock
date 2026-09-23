# Project Capability Review

Complete and approve this review after architecture, stack, deployment, and threat-model decisions are sufficiently known and before bootstrap materializes project capabilities. Start with recurring engineering, verification, deployment, and operations needs; check Layer 0, repository commands, and official tools before adding an integration.

Decision: Adopt one project-specific developer capability: the official VS Code `Vue - Official` extension (`Vue.volar`). No additional project-specific MCP server, repository-specific AI skill, custom agent, browser MCP, paid service, or hosted analysis integration is currently required.

Approval: approved by the product owner. Layer 0 workstation validation is complete for the bootstrap gate.

## Scope distinction

This review distinguishes three different things:

1. **Project dependencies/tooling** — Node/npm, Vue, TypeScript, Vite, Vitest, Vue Test Utils, Playwright, project scripts, lockfiles, and generated/static application data. These belong to the repository/bootstrap and are not agent-environment capabilities merely because agents execute them.
2. **Layer 0 / agent-developer capabilities** — Codex access and execution-profile mapping, reusable user skills/MCPs, workstation security CLIs, editor language support, Git/GitHub access, and other workstation-level facilities.
3. **Remote project infrastructure** — GitHub Actions/Pages and source-data endpoints. These are not agent capabilities unless a separate integration is needed to operate them.

Do not count a documented recommendation or repository template as proof that the corresponding Layer 0 capability is actually installed and usable on a workstation.

## Coverage review

| Recurring need | Classification | Existing coverage | Verified evidence | Gap / decision |
|---|---|---|---|---|
| Repository-aware implementation and command execution | Layer 0 | Codex is the primary executor by Method policy; repository exposes `AGENTS.md`, `docs/AI_WORKFLOW.md`, task contracts, and canonical `make` commands | Repository-side contract is present. This repository contains only `workstation/execution-profile-mapping.md.example`; no actual machine mapping is versioned here. | **Layer 0 availability is not verified from the repository.** Validate Codex availability and the physical mappings for `cloud-efficient`, `cloud-standard`, and `cloud-deep` on the workstation before the first routed task. This is a workstation prerequisite, not a new project capability. |
| Formal independent review | Layer 0 + repository harness | Logical independent-review levels are defined; read-only `reviewer` and `security_reviewer` agents exist for advisory use; formal review uses a fresh top-level session | Reviewer TOMLs and review policy are present in the repository | The fresh-session physical cloud mapping is unverified until Layer 0 validation. Do not treat advisory subagents as satisfying formal review. No new project reviewer/agent is needed. |
| Repository-specific bootstrap/handoff/learning workflow | Repository-local agent capability | `repo-bootstrap`, `project-handoff`, and `harness-retrospective` skills | Skill files exist under `.agents/skills/` and are wired to the repository contract | Covered. Do not add duplicate project-local skills. |
| Current framework/tool documentation research | Cross-project analysis capability | ChatGPT current-source web research is available in the current project workflow; repository also defines a read-only `docs_researcher` agent; Context7 is recommended as a global Layer 0 MCP, not a project dependency | ChatGPT web + live GitHub access were exercised during architecture research; `docs_researcher` exists. Actual workstation Context7 configuration is not observable from this repository. | No project-specific documentation MCP is required. If Codex cannot access authoritative docs for a version-sensitive issue, route research through `chatgpt-analysis` or validate Layer 0 Context7 rather than adding a project MCP. |
| Vue Single-File Component editing, template TypeScript diagnostics, navigation, and refactoring in the project's primary VS Code workflow | Developer/editor capability | Current `.vscode/extensions.json` contains only EditorConfig, Markdownlint, and YAML support | Official Vue documentation recommends VS Code with `Vue - Official`; current project recommendations do not include it | **Concrete project-specific gap.** Approve `Vue.volar` as a project-recommended VS Code extension during bootstrap. It adds language-service support only; it does not become a build/runtime dependency. |
| Deterministic type/lint/test/build verification | Project tooling | Planned Vue/TypeScript/Vite/Vitest/Vue Test Utils stack behind canonical `make` targets | Canonical Make interface exists; stack-specific adapters are intentionally still placeholders before bootstrap | Covered by bootstrap work, not by an MCP/skill. The fact that adapters currently fail with `NOT CONFIGURED` is expected pre-bootstrap state. |
| Browser automation and E2E verification | Project tooling | `@playwright/test` is an approved project dependency; `make test-e2e` will invoke deterministic browser tests after bootstrap | Playwright is in ADR-001/toolchain baseline; current adapter is intentionally a placeholder until materialization | No Playwright MCP or Chrome DevTools MCP is required for the baseline. Add one later only if a repeated debugging/inspection need cannot be met by Playwright CLI/tests/traces plus human browser checks. |
| Human visual acceptance and browser audio/background-throttling evidence | Human + runtime environment | Quality strategy explicitly requires human visual approval and targeted supported-browser evidence | Product/quality requirements define the human gate; no agent tool can guarantee real browser scheduling/audio policy | No agent capability should replace this gate. Browser installations/audio environment are release/test prerequisites, not MCP requirements. |
| Local secret and dependency vulnerability scanning | Layer 0 CLI + repository harness | `make security` is fully implemented and requires Gitleaks; once dependency metadata exists it also requires OSV-Scanner | `scripts/commands/security.sh` enforces both checks; `scripts/doctor.sh` only warns when the executables are missing | **Actual workstation availability is not verified from the repository.** Before bootstrap verification, confirm both CLIs are installed. If missing, install them as the universal Layer 0 baseline described in `docs/agentic/global-setup.md`; do not add a project-specific security service. |
| Git/GitHub repository synchronization, PRs, and Pages deployment | Layer 0 + remote infrastructure | Git is a hard `make doctor` prerequisite; `gh` is optional; GitHub Actions/Pages are the approved deployment path; this ChatGPT project currently has working GitHub repository access | Repository operations in this Method Guide session have successfully read, written, opened, and merged GitHub PRs. This proves ChatGPT-side GitHub connectivity only, not the developer workstation's `gh` installation. | No additional GitHub MCP is required. Local Git plus repository-hosted Actions is sufficient; `gh` remains convenience tooling unless a concrete workflow later requires it. |
| GeoNames/IANA catalog acquisition and regeneration | Project tooling + ordinary network retrieval | Static generation is a development-time workflow; `curl` is a hard Layer 0 prerequisite and catalog generation will be encoded in repository scripts/tests | `make doctor` requires `curl`; architecture forbids a runtime data-service dependency | No GeoNames/IANA MCP or persistent integration is required. Network/source availability is a generation-time prerequisite and provenance must be recorded in the repository. |
| Release decision | Human-only | Method requires an explicit human release verdict; Pages deployment is manually triggered from `main` | Architecture/toolchain baseline records manual verification-gated release semantics | Covered by human authority. No automation/integration should bypass it. |

## Layer 0 validation evidence

The product owner supplied local workstation evidence before bootstrap planning:

- `make doctor`: PASS; required tools and optional GitHub/Codex/security tools are available.
- `make harness-check`: PASS; repository harness baseline is consistent.
- Codex CLI: available (`codex-cli 0.154.0` at validation time).
- Gitleaks: available (`8.30.1` at validation time).
- OSV-Scanner: available (`2.6.0` at validation time).
- GitHub CLI: authenticated for the repository owner account using SSH for Git operations.
- Context7 MCP: enabled with OAuth.
- workstation execution-profile mapping: filled and manually validated for the required cloud profiles.
- `Vue.volar`: not installed at validation time; this is expected because it is the approved project-specific editor capability to materialize during bootstrap.

No Layer 0 prerequisite currently blocks the first routed bootstrap task. `local-fast` remains optional.

## Adopted capability

| Need/purpose | Type (skill, MCP, CLI/tool, reviewer/agent, other) | Existing coverage | Decision and rationale | Source/maintainer | Scope and access | Validation | Version/pin, if relevant | Revisit/removal trigger |
|---|---|---|---|---|---|---|---|---|
| Vue SFC language support in the primary VS Code workflow | VS Code extension | No Vue-specific language extension is currently recommended by the project | **Adopt `Vue.volar` (Vue - Official).** Vue's official tooling guidance recommends it for syntax highlighting, TypeScript support, template expressions/props IntelliSense, diagnostics, navigation, and refactoring in Vue SFCs. | Vue project / official VS Code Marketplace publisher | Developer editor only; no runtime, repository-write, production, or secret access is required by the project | Open a representative `.vue` SFC after bootstrap and confirm template/script TypeScript diagnostics, completion, and navigation using the workspace TypeScript version | Follow the current stable marketplace release; do not hard-pin an editor extension in application dependency manifests | Remove/revisit if Vue is replaced, the primary editor changes, or equivalent SFC language support becomes built in |

## Capabilities explicitly not added

- **Playwright MCP / Chrome DevTools MCP** — project Playwright tests/CLI plus human runtime checks cover the approved baseline.
- **Additional GitHub MCP** — Git/`gh`, GitHub Actions/Pages, and existing repository integrations cover the approved workflow.
- **Project-specific documentation MCP** — current-source research is already available through the analysis workflow; Context7 belongs at global Layer 0 when desired.
- **New project-local AI skills or reviewer agents** — the existing repository-local skills and reviewer definitions cover bootstrap, handoff, learning, advisory review, security review, and documentation research.
- **Hosted security products** — local Gitleaks + OSV-Scanner remain the approved minimal baseline.

Prefer trustworthy, inspectable sources and the least access needed. Keep build, test, security, and release correctness in deterministic repository commands. Propose any newly discovered capability need for approval before installation or materialization.
