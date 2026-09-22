# Architecture

## Context and scope

MiniJSClock is a single-user browser application. The system boundary is the client-side web application running in a supported desktop browser.

Inside the boundary:
- clock dashboard UI and interaction logic;
- local-time and world-time calculation using browser-supported IANA time-zone identifiers;
- alarm scheduling/evaluation while the application is open;
- local persistence of selected cities, global display preferences, and alarm definitions;
- bundled static city catalog generated from approved source data.

Outside the boundary:
- the browser/runtime and its timer, audio, storage, and internationalization capabilities;
- GitHub Pages, used only to serve built static assets;
- GeoNames and IANA source data used during catalog generation/maintenance, not as runtime services.

No project-operated backend, account system, server-side persistence, or runtime city/time-zone API is part of the approved first-release architecture.

## Chosen architecture

Use a client-only single-page web application delivered as static assets.

Primary responsibilities:
- **Presentation layer** — Vue components render the modern dashboard, digital/analog clocks, controls, city selection, and alarm UI.
- **Application/domain logic** — framework-independent TypeScript computes current times, evaluates alarm state from actual current time, applies one-time/daily alarm semantics, and coordinates configuration changes.
- **Local persistence adapter** — a typed adapter persists the small versioned configuration document in browser `localStorage`.
- **Static catalog module** — provides the bundled curated city-to-IANA-time-zone catalog. Catalog generation/update is a development-time concern, not a runtime network dependency.
- **Static deployment** — GitHub Actions builds the application and deploys the generated static artifact to GitHub Pages.

Dependency direction remains toward browser/platform abstractions and static data only; there is no server-side application tier. Vue owns presentation and reactive orchestration, while time/alarm/catalog/persistence semantics remain independently testable TypeScript modules where practical.

Frontend stack selection is accepted in ADR-001. Static hosting is accepted in ADR-002.

## Technology choices

| Concern | Choice | Version/pin | Why | Verification/source |
|---|---|---|---|---|
| UI framework | Vue | Stable 3.5.x; exact pin at bootstrap | Component/reactivity benefits materially reduce custom DOM/state code without requiring a larger application framework. | ADR-001 |
| Language | TypeScript | Current stable version supported by official Vue tooling; exact pin at bootstrap | Strong contracts for configuration, alarms, catalog data, and framework-independent domain logic. | ADR-001 |
| Build tool | Vite | Stable 8.x; exact pin at bootstrap | Official Vue scaffolding path and simple static production output. | ADR-001 |
| Web/API | No backend/API; static client application | N/A | Current requirements need no server-side state or runtime external service. | Approved product scope |
| Persistence | `localStorage` behind typed versioned adapter | Browser-provided | Configuration is tiny and only needs same-origin persistence across browser sessions. | ADR-001; FR-004; FR-010 |
| Time-zone handling | Browser `Intl` APIs with IANA identifiers | Browser-provided | Keeps runtime local and follows approved IANA-based catalog model. | FR-011; NFR-002 |
| City data | Bundled static generated catalog | GeoNames/IANA source snapshot TBD per generated artifact | Removes runtime service dependency while keeping provenance and reproducibility. | FR-011; FR-012 |
| Styling | Plain CSS, custom properties/design tokens, Vue scoped styles | N/A | Keeps visual system explicit without adding a utility/component framework. | ADR-001; NFR-001 |
| Unit/component tests | Vitest + Vue Test Utils where useful | Exact pins at bootstrap | Vite-native tests and official Vue component mounting utilities. | ADR-001 |
| Browser/E2E tests | Playwright | Exact pin at bootstrap | Supports automated browser-level scenarios across the required browser families. | ADR-001 |
| Deployment | GitHub Pages via GitHub Actions | Workflow pins TBD at bootstrap | Keeps hosting and deployment close to the repository with no backend requirement. | ADR-002 |

## Architectural invariants

- No project-operated backend is required for first-release functionality.
- Runtime city/time-zone lookup must not depend on an external service.
- User configuration remains browser-local.
- Time calculations and alarm interpretation use explicit IANA time-zone identifiers.
- Alarm scheduling must not assume browser timers execute exactly on schedule; overdue alarms are determined from actual current time when code runs.
- City catalog provenance and regeneration inputs remain versioned with the project.
- Vue components must not become the only place where time-zone, alarm, or persistence semantics can be verified.
- The first release does not add Router, Pinia, Tailwind, or a component framework unless a concrete need is demonstrated and the architecture decision is revisited.
- GitHub Pages deployment must publish only built static assets and must not introduce a runtime server dependency.
- UI implementation should keep clock/alarm/time-zone logic separable from rendering so correctness can be tested deterministically.

## Runtime and data flow

1. GitHub Pages serves the application bundle and bundled city catalog.
2. On startup, the application restores and validates the versioned configuration document from `localStorage`.
3. The browser clock provides the current instant.
4. For each displayed city, application logic formats that instant using the city's configured IANA time zone.
5. Alarm evaluation compares actual current time against persisted alarm definitions.
6. Vue renders the resulting state in the selected global digital/analog and 12h/24h presentation.
7. User changes are serialized through the persistence adapter back to `localStorage`.

No runtime request to a project backend is required for the normal product workflow.

## Failure modes

- **Browser storage unavailable/cleared/corrupted:** application falls back to validated defaults and reports/recoverably handles persistence failure rather than crashing.
- **Background timer throttling:** alarms may be delayed; when execution resumes, the application evaluates actual current time and triggers overdue alarms according to the approved semantics.
- **Browser audio restrictions:** audible alarm delivery may require prior user interaction or other browser-specific permission state; this remains an implementation/verification concern.
- **Invalid bundled catalog data:** treat as build/test failure; runtime should not silently invent time zones.
- **GitHub Pages deployment failure:** retain the previously deployed release; treat failed build/deploy verification as blocking a new release.
- **Incorrect Vite base path:** deployed assets may fail under the repository Pages sub-path; verify this in the deployment task.
- **Unsupported optional browser/device:** graceful degradation is preferred, but only the approved desktop browser target is release-blocking.

## Open architecture questions

- [ ] What exact Node/npm baseline and dependency pins should bootstrap use?
- [ ] What exact GitHub Actions workflow/action pins and release gate should be used for Pages deployment?
