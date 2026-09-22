# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: architecture
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: architecture baseline complete; prepare executable bootstrap work
- Selected stack profile / concrete stack: ADR-001 accepted: Vue 3.5.43 + TypeScript 7.0.2 + Vite 8.3.0 on Node 24.21.0 LTS/npm 11.19.0; no router/store/UI framework initially; plain CSS; Vitest 5.0.1 + Vue Test Utils 2.5.1 + Playwright 1.63.0
- Selected data profile / concrete data platform: `localStorage` typed/versioned configuration adapter plus static repository-versioned city catalog; GeoNames candidate source, IANA identifiers, approximately 400 cities
- Selected deployment profile / concrete target: ADR-002 accepted: GitHub Pages via manually triggered, verification-gated GitHub Actions deployment from `main`; actions pinned to full commit SHAs
- Repository baseline: bootstrapping
- Active task(s): none
- Latest completed task: Node/npm, dependency pinning, and GitHub Actions reproducibility baseline defined
- Main known risks/blockers: browser audio/autoplay constraints remain an implementation/verification concern; no architecture blocker currently prevents bootstrap
- Decisions currently pending: bootstrap implementation details that do not alter the approved architecture
- Next recommended action: read model-routing/workflow guidance and create the first ready bootstrap task with execution profile, verification evidence, review requirement, and security impact

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
| 2026-09-22 | Architecture decision | Human approval of ADR-001 | Vue + TypeScript + Vite frontend stack accepted; typed `localStorage`, Vitest/Vue Test Utils, and Playwright included in the approved stack |
| 2026-09-22 | Architecture decision | Human approval of ADR-002 | GitHub Pages selected as first-release static hosting target, deployed through GitHub Actions |
| 2026-09-22 | Architecture/tooling baseline | Current-source compatibility and supply-chain review | Node 24.21.0 LTS/npm 11.19.0 selected; direct dependencies exactly pinned with lockfile; GitHub Actions use reviewed full commit SHAs; Pages release remains a manual human action |
