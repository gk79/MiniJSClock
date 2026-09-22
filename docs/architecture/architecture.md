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
- static file hosting used only to deliver the application;
- GeoNames and IANA source data used during catalog generation/maintenance, not as runtime services.

No project-operated backend, account system, server-side persistence, or runtime city/time-zone API is part of the approved first-release architecture.

## Chosen architecture

Use a client-only single-page web application delivered as static assets.

Primary responsibilities:
- **Presentation layer** — renders the modern dashboard, digital/analog clocks, controls, city selection, and alarm UI.
- **Application/domain logic** — computes current times, evaluates alarm state from actual current time, applies one-time/daily alarm semantics, and coordinates configuration changes.
- **Local persistence adapter** — stores and restores user configuration in the browser. The concrete browser storage mechanism is not yet selected.
- **Static catalog module** — provides the bundled curated city-to-IANA-time-zone catalog. Catalog generation/update is a development-time concern, not a runtime network dependency.
- **Static deployment** — serves the built application files. The concrete hosting target is not yet selected.

Dependency direction should remain toward browser/platform abstractions and static data only; there is no server-side application tier.

A frontend framework is not required by this architecture. Prefer the simplest implementation that can meet the approved visual-quality, maintainability, and verification requirements. React, Vue, Svelte, or another framework may be selected later only if the trade-off is materially better than a framework-free implementation.

## Technology choices

| Concern | Choice | Version/pin | Why | Verification/source |
|---|---|---|---|---|
| Runtime | Modern browser JavaScript/TypeScript-capable frontend | TBD | Product is client-only and targets current stable desktop Chrome, Edge, and Firefox. | Product requirements and supported-browser baseline |
| Web/API | No backend/API; static client application | N/A | Current requirements need no server-side state or runtime external service. | Approved product scope |
| Persistence | Browser-local persistence | TBD | Configuration must survive reload/restart only in the same browser profile. | FR-004, FR-010 |
| Time-zone handling | Browser internationalization APIs with IANA identifiers | Browser-provided | Keeps runtime local and follows approved IANA-based catalog model. | FR-011, NFR-002 |
| City data | Bundled static generated catalog | GeoNames/IANA source snapshot TBD per generated artifact | Removes runtime service dependency while keeping provenance and reproducibility. | FR-011, FR-012 |
| Test stack | TBD | TBD | Select after implementation stack decision. | Pending architecture decision |
| Deployment | Static asset hosting | TBD | No backend is required. | Approved architecture baseline |

## Architectural invariants

- No project-operated backend is required for first-release functionality.
- Runtime city/time-zone lookup must not depend on an external service.
- User configuration remains browser-local.
- Time calculations and alarm interpretation use explicit IANA time-zone identifiers.
- Alarm scheduling must not assume browser timers execute exactly on schedule; overdue alarms are determined from actual current time when code runs.
- City catalog provenance and regeneration inputs remain versioned with the project.
- Framework selection must not introduce a server dependency or otherwise broaden product scope without an explicit architecture decision.
- UI implementation should keep clock/alarm/time-zone logic separable from rendering so correctness can be tested deterministically.

## Runtime and data flow

1. Static hosting delivers the application bundle and bundled city catalog.
2. On startup, the application restores local configuration from browser persistence.
3. The browser clock provides the current instant.
4. For each displayed city, application logic formats that instant using the city's configured IANA time zone.
5. Alarm evaluation compares actual current time against persisted alarm definitions.
6. UI renders the resulting state in the selected global digital/analog and 12h/24h presentation.
7. User changes are written back to local browser persistence.

No runtime request to a project backend is required for the normal product workflow.

## Failure modes

- **Browser storage unavailable/cleared:** application falls back to default configuration; persistence cannot be guaranteed when the user/browser removes site data.
- **Background timer throttling:** alarms may be delayed; when execution resumes, the application evaluates actual current time and triggers overdue alarms according to the approved semantics.
- **Browser audio restrictions:** audible alarm delivery may require prior user interaction or other browser-specific permission state; this remains an implementation/verification concern.
- **Invalid bundled catalog data:** treat as build/test failure; runtime should not silently invent time zones.
- **Unsupported optional browser/device:** graceful degradation is preferred, but only the approved desktop browser target is release-blocking.

## Open architecture questions

- [ ] Should the implementation use framework-free DOM/CSS/JavaScript/TypeScript or a lightweight frontend framework?
- [ ] Which browser-local persistence mechanism should be used?
- [ ] Which build/tooling approach should be used?
- [ ] Which static hosting target should be used?
- [ ] Which test stack best verifies time-zone, alarm, persistence, and visual/UI behavior?
