# ADR-001: Frontend implementation stack

- Status: Accepted
- Date: 2026-09-22
- Owners: Product owner / repository owner

## Context

MiniJSClock is an approved client-only static single-page application with no backend. It needs a polished modern dashboard, repeated clock-card components, shared global display settings, local alarms, a searchable city picker, browser-local persistence, and deterministic tests for time-zone/alarm logic.

The project explicitly prefers the smallest maintainable stack. A frontend framework is justified only if it materially reduces custom UI/state/DOM machinery without broadening the architecture.

Current official ecosystem state reviewed on 2026-09-22:
- React current major is 19 (19.3 current at review time).
- Vue current stable line is 3.5 (3.5.43 current; 3.6 is still release-candidate at review time).
- Svelte current major is 5.
- Vite current stable line is 8 (8.1 current at review time).

## Decision

Adopt the following first-release frontend stack:

- **Vue 3.5.x**, using Single-File Components and the Composition API.
- **TypeScript**, using the current stable version supported by the official Vue toolchain at bootstrap time; exact versions are pinned in the lockfile.
- **Vite 8.x** using the official `create-vue` / `@vitejs/plugin-vue` path.
- **No Vue Router** for the first release unless navigation requirements appear.
- **No Pinia or other global state library** initially. Use Vue reactivity/composables for the small application state.
- **Plain CSS with CSS custom properties/design tokens and Vue scoped styles**. Do not add Tailwind or a component framework initially.
- **`localStorage` behind a small typed persistence adapter**, storing one versioned JSON configuration document with validation/default recovery. The bundled city catalog is static application data and is not copied into browser persistence.
- **Native browser `Intl` APIs with IANA time-zone identifiers** for time rendering and interpretation.
- **Vitest** for pure logic/unit tests and selected Vue component tests, with **Vue Test Utils** where component mounting is useful.
- **Playwright** for browser-level end-to-end coverage and cross-browser verification. Human visual approval remains the release gate for visual quality.
- **npm with a committed lockfile** unless a later repository-wide tooling decision chooses another package manager.

The application-domain modules for time calculation, alarm evaluation, catalog access, and persisted configuration must remain framework-independent TypeScript wherever practical. Vue should own presentation/reactive orchestration rather than core clock semantics.

## Alternatives considered

### Framework-free TypeScript + DOM APIs

Smallest runtime dependency surface and fully standard browser APIs. Rejected as the default because MiniJSClock already has repeated dynamic clock cards, modal/picker interactions, shared settings, alarm state, two presentation modes, responsive layout, and strong visual-quality requirements. Implementing these directly would move component lifecycle, DOM synchronization, and reactive state management into project-specific code.

### React

Mature ecosystem, strong tooling, and broad contributor familiarity. React 19 is current and can be paired with Vite for a client-only SPA. Not selected because its component/update model and common hooks/JSX patterns add more ceremony than this small app needs, while many of the broader React-framework capabilities are irrelevant to a local static dashboard.

### Svelte

Very concise component syntax and compile-time approach; a strong technical fit for a small static UI. Not selected because Svelte 5 introduced a newer runes/reactivity model and a more framework-specific compile-time programming model. The gain in concision is not large enough here to outweigh Vue's more established incremental model, tooling maturity, and explicit reactivity for a long-lived small project.

### Vue 3

Selected because it provides a component model, explicit reactivity, scoped component styles, first-class TypeScript support, and an official Vite-based scaffold while allowing the app to remain small: no router, store, SSR framework, backend, or UI kit is required.

## Consequences

Positive:
- substantially less custom DOM/reactivity code than framework-free TypeScript;
- smaller conceptual/tooling surface than a typical React application;
- natural component boundaries for digital/analog clocks, clock cards, city picker, settings, and alarm editor;
- easy separation of framework-independent time/alarm logic from Vue presentation;
- official Vue/Vite/TypeScript and test-tool integration;
- static build output remains compatible with the approved no-backend architecture.

Negative / trade-offs:
- Vue becomes a runtime/build dependency and introduces framework-specific component syntax;
- contributors need Vue 3 Composition API knowledge;
- upgrades of Vue/Vite/tooling require normal dependency maintenance;
- `localStorage` is synchronous, so it must remain limited to the very small configuration payload; it is not a general-purpose data store.

Operational/security:
- no server, authentication, secrets, or new network trust boundary is introduced;
- persistence remains origin-local and should gracefully handle storage being unavailable, corrupted, or cleared;
- dependency scanning and secret scanning remain part of the standard repository verification baseline.

## Verification / revisit trigger

Verify the decision during bootstrap and first vertical slice by confirming:
- a production build emits only static deployable assets;
- clock/time-zone and alarm-domain tests can run independently of Vue components;
- selected-city/settings/alarm persistence works through the typed `localStorage` adapter;
- the UI can render representative 1, several, and roughly 12-clock dashboards without needing an additional state-management or component framework;
- Vitest and Playwright cover the intended test layers without duplicate complex configuration.

Revisit this ADR if:
- application navigation grows enough to justify routing;
- shared application state becomes complex enough that composables are no longer understandable;
- persisted data becomes large/query-heavy enough that synchronous Web Storage is inappropriate;
- accessibility requirements require a well-vetted headless component dependency;
- a major Vue/Vite/toolchain change materially alters the maintenance trade-off;
- implementation evidence shows the selected stack cannot meet the approved visual-quality or browser-support requirements without disproportionate complexity.
