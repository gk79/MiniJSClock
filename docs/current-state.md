# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: architecture
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: select the smallest concrete implementation stack and remaining architecture details
- Selected stack profile / concrete stack: client-only static single-page web application; framework/tooling not yet selected
- Selected data profile / concrete data platform: local browser persistence plus a static repository-versioned city catalog; GeoNames approved as the candidate-city source, IANA identifiers approved for time-zone mapping, target catalog size approximately 400 cities; concrete persistence mechanism not yet selected
- Selected deployment profile / concrete target: static asset hosting; concrete hosting target not yet selected
- Repository baseline: bootstrapping
- Active task(s): none
- Latest completed task: client-only static SPA architecture baseline approved
- Main known risks/blockers: browser audio/autoplay constraints remain an implementation/verification concern; framework/tooling, persistence mechanism, test stack, and hosting target remain undecided
- Decisions currently pending: framework-free vs justified frontend framework; browser persistence mechanism; build/test tooling; static hosting target
- Next recommended action: compare the smallest viable frontend implementation approaches and select the concrete stack only if a framework provides a material benefit

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
