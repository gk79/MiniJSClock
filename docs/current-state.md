# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: architecture
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: finalize bootstrap/runtime pins and deployment workflow details before implementation planning
- Selected stack profile / concrete stack: ADR-001 accepted: Vue 3.5.x + TypeScript + Vite 8.x; no router/store/UI framework initially; plain CSS; Vitest + Vue Test Utils + Playwright
- Selected data profile / concrete data platform: `localStorage` typed/versioned configuration adapter plus static repository-versioned city catalog; GeoNames candidate source, IANA identifiers, approximately 400 cities
- Selected deployment profile / concrete target: ADR-002 accepted: GitHub Pages deployed via GitHub Actions
- Repository baseline: bootstrapping
- Active task(s): none
- Latest completed task: GitHub Pages selected as the static hosting target
- Main known risks/blockers: browser audio/autoplay constraints remain an implementation/verification concern; exact bootstrap runtime/dependency pins and Pages workflow details remain undecided
- Decisions currently pending: exact Node/npm and dependency pins; exact GitHub Actions Pages workflow/action pins and release gate
- Next recommended action: define the bootstrap runtime/toolchain baseline, then prepare implementation planning and routed tasks

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
| 2026-09-22 | Architecture | Human approval of client-only static SPA baseline | No backend; static hosting; local browser persistence; bundled city catalog; framework remains optional pending justified trade-off |
| 2026-09-22 | Architecture decision | Human approval of ADR-001 | Vue 3 + TypeScript + Vite frontend stack accepted; typed `localStorage`, Vitest/Vue Test Utils, and Playwright included in the approved stack |
| 2026-09-22 | Architecture decision | Human approval of GitHub Pages hosting | GitHub Pages selected as first-release static hosting target, deployed through GitHub Actions |
