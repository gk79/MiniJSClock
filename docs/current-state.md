# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: architecture
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: resolve the approved TypeScript toolchain incompatibility blocking the first repository bootstrap task
- Selected stack profile / concrete stack: ADR-001 accepted: Vue 3.5.43 + TypeScript 7.0.2 + Vite 8.3.0 on Node 24.21.0 LTS/npm 11.19.0; no router/store/UI framework initially; plain CSS; Vitest 5.0.1 + Vue Test Utils 2.5.1 + Playwright 1.63.0
- Selected data profile / concrete data platform: `localStorage` typed/versioned configuration adapter plus static repository-versioned city catalog; GeoNames candidate source, IANA identifiers, approximately 400 cities
- Selected deployment profile / concrete target: ADR-002 accepted: GitHub Pages via manually triggered, verification-gated GitHub Actions deployment from `main`; actions pinned to full commit SHAs
- Repository baseline: bootstrap blocked during toolchain materialization
- Active task(s): TASK-0001 — blocked; approved TypeScript 7.0.2 is incompatible with the approved lint/type-check toolchain
- Latest completed task: capability/threat/quality gate approved and Layer 0 workstation validation completed
- Main known risks/blockers: `@vue/eslint-config-typescript@14.9.0` rejects TypeScript 7.0 and `vue-tsc@3.3.11` cannot load the TypeScript 7 compiler API; browser audio/autoplay remains a later implementation/verification concern
- Decisions currently pending: reassess the approved TypeScript/lint/type-check version set for TASK-0001; GitHub Pages workflow remains intentionally deferred to a separate security-sensitive task
- Next recommended action: use `chatgpt-analysis` to approve a mutually compatible TypeScript, Vue type-check, and lint toolchain, then revise TASK-0001 before resuming implementation in a fresh primary session

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
| 2026-09-23 | TASK-0001 bootstrap preflight | Exact-pin lockfile restore followed by `npm run lint` and `npm run type-check` | BLOCKED: TypeScript 7.0.2 is rejected by TypeScript-ESLint and cannot be loaded by vue-tsc 3.3.11; architecture/toolchain reassessment required |
