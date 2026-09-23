# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: implementation planning
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: bootstrap integrated; establish the post-bootstrap implementation sequence and prepare the next executable task
- Selected stack profile / concrete stack: ADR-001 accepted: Vue 3.5.43 + TypeScript 6.0.3 + Vite 8.3.0 on Node 24.21.0 LTS/npm 11.19.0; `vue-tsc` 3.3.11; lint baseline ESLint 10.10.0 + `@vue/eslint-config-typescript` 14.9.0 + `eslint-plugin-vue` 10.11.0; no router/store/UI framework initially; plain CSS; Vitest 5.0.1 + Vue Test Utils 2.5.1 + Playwright 1.63.0
- Selected data profile / concrete data platform: `localStorage` typed/versioned configuration adapter plus static repository-versioned city catalog; GeoNames candidate source, IANA identifiers, approximately 400 cities
- Selected deployment profile / concrete target: ADR-002 accepted: GitHub Pages via manually triggered, verification-gated GitHub Actions deployment from `main`; actions pinned to full commit SHAs
- Repository baseline: Vue/Vite/TypeScript bootstrap integrated into `main`; local verification harness, Chromium smoke, and CI command composition pass
- Active task(s): none
- Latest completed task: TASK-0001 — independently reviewed bootstrap integrated into `main`
- Main known risks/blockers: no blocker prevents implementation planning; GitHub Pages workflow is intentionally security-sensitive; browser audio/autoplay remains a later runtime verification concern
- Decisions currently pending: none at architecture level; next executable task is the approved delivery-path materialization unless readiness analysis finds a concrete blocker
- Next recommended action: approve/integrate the post-bootstrap implementation plan, then create TASK-0002 for routine CI plus manually triggered GitHub Pages deployment

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

| 2026-09-23 | TASK-0001 compatibility reassessment | Synchronized handoff branch `codex/task-0001-blocked-handoff` plus current official TypeScript-ESLint/Vue tool metadata | TypeScript 6.0.3 approved with vue-tsc 3.3.11 and the already-materialized Vue/ESLint lint stack; TASK-0001 ready for fresh-session resume |
| 2026-09-23 | TASK-0001 fresh bootstrap implementation | Clean exact-pin restore plus `make verify`, runtime base-path request, and static artifact inspection | Vue/Vite shell and non-browser command contract pass with TypeScript 6.0.3; production output is static and `/MiniJSClock/` responds successfully |
| 2026-09-23 | TASK-0001 Playwright verification | `make test-e2e`, debug browser launch, and `npx playwright install-deps chromium` | BLOCKED: downloaded Chromium cannot load `libnspr4.so`; official dependency installer requires an interactive sudo password unavailable to this session |
| 2026-09-23 | TASK-0001 resumed verification after human dependency provisioning | `make bootstrap`, `make test-e2e`, and `make ci` | PASS: clean lockfile restore, Chromium production-base-path smoke, and full CI composition completed successfully; TASK-0001 is ready for formal independent review |
| 2026-09-23 | TASK-0001 formal independent review | Actual `origin/main...origin/codex/task-0001-implementation` diff at `3a01ee19479bb8d087f99cbdad933d284b582669`; clean bootstrap; canonical verify/security/E2E/CI gates; dependency and static artifact inspection | PASS: no blocking findings; task moved to `tasks/done/` for human integration decision |

| 2026-09-23 | TASK-0001 integration | Human-approved PR #16 merged after formal independent review PASS | Bootstrap baseline integrated into `main`; project may proceed to implementation planning |
