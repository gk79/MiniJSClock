# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: architecture
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: critically validate and approve the bootstrap capability/threat/quality gate, then create executable bootstrap work
- Selected stack profile / concrete stack: ADR-001 accepted: Vue 3.5.43 + TypeScript 7.0.2 + Vite 8.3.0 on Node 24.21.0 LTS/npm 11.19.0; no router/store/UI framework initially; plain CSS; Vitest 5.0.1 + Vue Test Utils 2.5.1 + Playwright 1.63.0
- Selected data profile / concrete data platform: `localStorage` typed/versioned configuration adapter plus static repository-versioned city catalog; GeoNames candidate source, IANA identifiers, approximately 400 cities
- Selected deployment profile / concrete target: ADR-002 accepted: GitHub Pages via manually triggered, verification-gated GitHub Actions deployment from `main`; actions pinned to full commit SHAs
- Repository baseline: bootstrapping
- Active task(s): none
- Latest completed task: critical capability review distinguished project tooling from agent/developer capabilities and identified Vue SFC editor support as one project-specific capability proposal
- Main known risks/blockers: browser audio/autoplay remains a verification concern; actual workstation Codex/profile mapping and Gitleaks/OSV availability are not verifiable from repository state; capability review awaits human approval
- Decisions currently pending: human approval of revised `docs/agentic/project-capabilities.md` including `Vue.volar`; Layer 0 validation evidence before the first routed bootstrap task
- Next recommended action: validate the current workstation Layer 0 (doctor/harness, Codex/profile mapping, Gitleaks, OSV-Scanner), then approve or revise the capability review

## Recent verification

| Date | Context | Command/evidence | Result |
|---|---|---|---|
| 2026-09-22 | ChatGPT repository startup | Read `docs/AI_WORKFLOW.md`, `docs/current-state.md`, and product templates from `main`; no active task exists | Repository operating contract loaded; discovery artifacts were still Starter templates before this update |
| 2026-09-22 | Product discovery | Human approval of desktop/browser support target | Current stable Chrome, Edge, and Firefox are required first-release targets; Safari and mobile/tablet are non-blocking |
| 2026-09-22 | Product discovery | Human approval of static city catalog approach | City data will be versioned in the repository and mapped to IANA time-zone identifiers; no runtime external city/time-zone API is required |
| 2026-09-22 | Product discovery | Human approval of city catalog source and scale | GeoNames approved for candidate cities, IANA identifiers for time zones, and the bundled catalog should contain approximately 400 curated cities |
| 2026-09-22 | Product discovery | Human approval of visual direction | First-release UI direction is a polished modern dashboard with card/panel-based clock presentation and clear information hierarchy |
| 2026-09-22 | Product discovery | Human approval of visual acceptance criteria | Visual acceptance covers hierarchy, coherence, digital/analog parity, 1-to-dozen-clock layouts, absence of placeholder/default-browser presentation, desktop polish, narrow-width basic usability, and final human visual approval |
| 2026-09-22 | Product discovery | Human approval of background alarm semantics | Active-tab alarms target the configured time; background-throttled alarms fire at the next execution opportunity based on actual current time, with no guaranteed maximum delay |
| 2026-09-22 | Architecture | Human approval of client-only static SPA baseline | No backend; static hosting; local browser persistence; bundled city catalog |
| 2026-09-22 | Architecture decision | Human approval of ADR-001 | Vue + TypeScript + Vite frontend stack accepted |
| 2026-09-22 | Architecture decision | Human approval of ADR-002 | GitHub Pages selected as first-release static hosting target |
| 2026-09-22 | Architecture/tooling baseline | Current-source compatibility and supply-chain review | Node/npm/dependency/action pinning baseline established; architecture has no remaining bootstrap blocker |
| 2026-09-22 | Architecture bootstrap gate | Initial threat/quality/capability review | Threat model and quality strategy tailored; initial capability decision left pending |
| 2026-09-22 | Architecture bootstrap gate | Critical capability review against actual repository harness and current workflow | Existing repo skills/reviewers/security command coverage verified; Layer 0 physical mappings/security CLI installation remain unverified externally; `Vue.volar` identified as the only additional project-specific capability proposal |

| 2026-09-22 | Layer 0 execution routing | Human confirmation that the workstation execution-profile mapping is filled and manually validated | Required cloud execution profiles are available; no Layer 0 prerequisite remains before bootstrap task creation |
