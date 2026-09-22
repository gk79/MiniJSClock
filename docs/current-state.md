# Current project state

Keep this short. It is a durable project-level handoff index, not a duplicate project history or session transcript. Link to canonical detail instead of copying it.

- Lifecycle phase: discovery
- Project identifier: MiniJSClock
- Product/display name: MiniJSClock
- Current milestone: initial product requirements baseline complete; evaluate transition to architecture
- Selected stack profile / concrete stack: not selected
- Selected data profile / concrete data platform: local browser persistence plus a static repository-versioned city catalog; GeoNames approved as the candidate-city source, IANA identifiers approved for time-zone mapping, target catalog size approximately 400 cities; concrete persistence mechanism not yet selected
- Selected deployment profile / concrete target: browser application; concrete hosting/deployment target not selected
- Repository baseline: bootstrapping
- Active task(s): none
- Latest completed task: alarm behavior under background-tab throttling approved; initial product requirements baseline is complete
- Main known risks/blockers: browser audio/autoplay constraints remain an implementation/verification concern; no product-level blocker remains
- Decisions currently pending: architecture/stack, browser persistence mechanism, hosting/deployment target, and implementation approach
- Next recommended action: validate architecture-phase entry criteria and choose the smallest architecture that satisfies the approved requirements

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
