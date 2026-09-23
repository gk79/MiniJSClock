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

Bootstrap versions below are the approved compatibility baseline as of 2026-09-23. They are exact starting pins, not a promise to stay on those versions indefinitely. Revalidate them before bootstrap if implementation is materially delayed or a relevant security/advisory issue appears.

| Concern | Choice | Version/pin | Why | Verification/source |
|---|---|---|---|---|
| Node.js | LTS | 24.21.0 | Stable LTS baseline compatible with the selected Vite/Vitest/Playwright stack. | Node.js release status; current-source review 2026-09-22 |
| npm | npm bundled with the Node baseline | 11.19.0 | Matches Node 24.21.0 and keeps one package manager across local/CI usage. | Node.js 24.21.0 distribution |
| UI framework | Vue | 3.5.43 | Accepted Vue 3.5 line; stable current release at bootstrap baseline. | ADR-001; registry snapshot 2026-09-22 |
| Language | TypeScript | 6.0.3 | Latest stable TypeScript 6 patch selected because the approved Vue type-check and TypeScript-ESLint stack does not yet support TypeScript 7 end to end. | ADR-001; TASK-0001 compatibility reassessment 2026-09-23 |
| Build tool | Vite | 8.3.0 | Accepted Vite 8 line with static production output. | ADR-001; registry snapshot 2026-09-22 |
| Vue Vite plugin | `@vitejs/plugin-vue` | 6.0.9 | Official Vue integration for Vite. | Official package; registry snapshot 2026-09-22 |
| Vue type checker | `vue-tsc` | 3.3.11 | Vite transpiles TypeScript but does not perform full Vue SFC type checking. | Vue TypeScript guidance; registry snapshot 2026-09-22 |
| Web/API | No backend/API; static client application | N/A | Current requirements need no server-side state or runtime external service. | Approved product scope |
| Persistence | `localStorage` behind typed versioned adapter | Browser-provided | Configuration is tiny and only needs same-origin persistence across browser sessions. | ADR-001; FR-004; FR-010 |
| Time-zone handling | Browser `Intl` APIs with IANA identifiers | Browser-provided | Keeps runtime local and follows approved IANA-based catalog model. | FR-011; NFR-002 |
| City data | Bundled static generated catalog | GeoNames/IANA source snapshot TBD per generated artifact | Removes runtime service dependency while keeping provenance and reproducibility. | FR-011; FR-012 |
| Styling | Plain CSS, custom properties/design tokens, Vue scoped styles | N/A | Keeps visual system explicit without adding a utility/component framework. | ADR-001; NFR-001 |
| Lint core | ESLint | 10.10.0 | Exact version materialized by the approved create-vue reference scaffold; compatible with the selected Vue TypeScript lint config. | TASK-0001 handoff; compatibility reassessment 2026-09-23 |
| Vue TypeScript lint config | `@vue/eslint-config-typescript` | 14.9.0 | Official Vue 3 + TypeScript flat-config integration; peers allow ESLint 10 and its TypeScript-ESLint dependency line supports TypeScript 6.0.x. | TASK-0001 handoff; official package metadata |
| Vue lint plugin | `eslint-plugin-vue` | 10.11.0 | Official Vue SFC ESLint rules; satisfies the selected Vue TypeScript lint config peer range. | TASK-0001 handoff; official package metadata |
| Unit/component tests | Vitest + Vue Test Utils where useful | 5.0.1 + 2.5.1 | Vite-native tests plus Vue component mounting only where needed. | ADR-001; registry snapshots 2026-09-22 |
| Browser/E2E tests | Playwright | 1.63.0 | Cross-browser browser-level scenarios on the selected Node LTS line. | ADR-001; Playwright system requirements; registry snapshot 2026-09-22 |
| Deployment | GitHub Pages via GitHub Actions | Actions pinned by full commit SHA | Keeps hosting and deployment close to the repository with no backend requirement. | ADR-002; GitHub Actions secure-use guidance |

The official `create-vue` scaffolder may be used at bootstrap at version 3.24.0. It is a one-time bootstrap tool, not a runtime dependency.

## Bootstrap and reproducibility baseline

- Use Node **24.21.0** locally and in CI. Record it in `.nvmrc`; configure CI with the same exact version.
- Record `"packageManager": "npm@11.19.0"` and a Node 24 engine constraint in `package.json`.
- Commit `package-lock.json`.
- Direct application/dev dependencies are installed at exact versions (no `^` or `~` in the initial bootstrap).
- CI and release builds use `npm ci`, never an unconstrained install.
- The bootstrap should provide explicit scripts for at least: type-check, unit tests, build, E2E tests, and the repository's canonical verification entry points.
- Vite production base must account for the GitHub Pages repository sub-path `/MiniJSClock/`.
- If bootstrap occurs after a material delay, version-sensitive pins are revalidated before changing repository files.

Initial direct toolchain pins:
- `vue@3.5.43`
- `typescript@6.0.3`
- `vite@8.3.0`
- `@vitejs/plugin-vue@6.0.9`
- `vue-tsc@3.3.11`
- `vitest@5.0.1`
- `@vue/test-utils@2.5.1`
- `@playwright/test@1.63.0`
- `eslint@10.10.0`
- `@vue/eslint-config-typescript@14.9.0`
- `eslint-plugin-vue@10.11.0`

`@vue/eslint-config-typescript@14.9.0` depends on the TypeScript-ESLint 8.x line. The lockfile may resolve the exact transitive 8.x patch, but it must remain within a release whose declared TypeScript support includes 6.0.3. Do not add a direct `typescript-eslint` dependency solely to force a transitive patch, and do not use peer overrides or ignored peer conflicts to force TypeScript 7.

Additional scaffold-generated direct dependencies are allowed only when required for the selected features and must be reviewed, explicitly pinned, and captured by the lockfile.

## GitHub Actions baseline

GitHub-hosted actions must be pinned to full commit SHAs. Keep the corresponding release tag in a comment for maintainability.

Approved bootstrap pins as of 2026-09-22:

- `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1` — v7.0.1
- `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020` — v7.0.0
- `actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d` — v6.0.0
- `actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9` — v5.0.0
- `actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346` — v5.0.1

The Pages release workflow must:
1. be manually initiated as the human release action rather than deploy every merge automatically;
2. operate on `main` only;
3. run the required verification/build gates before deployment;
4. upload only the built static artifact;
5. use the `github-pages` environment;
6. grant only the required deployment permissions (`contents: read`, `pages: write`, `id-token: write`);
7. prevent an unverified build artifact from being deployed.

Routine CI may run automatically for pull requests and pushes; CI success is evidence, not itself a production release verdict.

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
- Dependency installation for verification/release uses the committed lockfile.
- External GitHub Actions used by project workflows are pinned to reviewed full commit SHAs.
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
- **Dependency/toolchain drift:** `npm ci`, exact direct pins, lockfile review, and a fixed Node baseline prevent silent bootstrap/CI drift; upgrades are explicit repository changes. Do not adopt TypeScript 7 until both the Vue type-check path and TypeScript-ESLint path have compatible passing evidence.
- **GitHub Action tag movement or supply-chain drift:** workflow references use reviewed full SHAs rather than movable tags.
- **GitHub Pages deployment failure:** retain the previously deployed release; treat failed build/deploy verification as blocking a new release.
- **Incorrect Vite base path:** deployed assets may fail under the repository Pages sub-path; verify this in the deployment task.
- **Unsupported optional browser/device:** graceful degradation is preferred, but only the approved desktop browser target is release-blocking.

## Open architecture questions

No architecture question currently blocks bootstrap. Version-sensitive pins must be revalidated if bootstrap is materially delayed.
