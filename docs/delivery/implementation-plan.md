# Implementation plan

## Strategy

Proceed as a single-human, naturally linear implementation stream. Do not create a dependency DAG unless the implementation model changes to concurrent human contribution.

Build vertical slices that leave the repository in a verifiable state after each integration. Keep product/domain logic framework-independent where practical and add browser/E2E coverage as behavior becomes user-visible.

Risk ordering:
1. close the approved GitHub delivery path early so release-path assumptions are exercised before substantial product implementation;
2. establish deterministic time/domain primitives before UI complexity;
3. add static city data and persistence before broader dashboard behavior;
4. add global presentation modes;
5. add alarms only after time-zone and persistence semantics are established;
6. finish with supported-browser, visual, and release acceptance.

## Milestones

| Milestone | Outcome | Exit evidence |
|---|---|---|
| M1 — Bootstrap baseline | Vue/Vite/TypeScript scaffold and local verification harness are integrated | TASK-0001 done; clean bootstrap, verify, security, Chromium E2E, and CI-contract evidence |
| M2 — Delivery baseline | Routine CI and manually triggered GitHub Pages deployment path are implemented with approved permissions/pins and verified base-path artifact handling | CI executes canonical repository contract; Pages workflow is security-reviewed; deployment remains human-triggered |
| M3 — Local clock/domain foundation | App opens with a running local clock backed by deterministic framework-independent time formatting primitives | FR-001; NFR-002 domain tests; browser smoke |
| M4 — City catalog, world clocks, persistence | Versioned ~400-city catalog can be regenerated; user can add/remove city clocks and retain configuration across reloads | FR-002, FR-003, FR-004, FR-011, FR-012; provenance and deterministic generation evidence; persistence/E2E tests |
| M5 — Global presentation settings | Digital/analog and 12h/24h settings apply consistently across all clocks and persist | FR-005, FR-006; component/E2E evidence |
| M6 — City-local alarms | One-time and daily alarms use each clock's local civil time, persist, and detect overdue execution | FR-007 through FR-010; deterministic domain tests plus browser/audio evidence |
| M7 — Release acceptance | Supported browsers, representative layouts, visual quality, narrow-width behavior, and release artifact are accepted | NFR-001, NFR-004, NFR-005, NFR-007; human visual approval; Chrome/Edge/Firefox smoke; explicit human release verdict |

## Planned task sequence

This is a planning topology, not a live status board. Create executable task contracts only when the next item is ready to enter the task lifecycle.

| Planned task | Outcome | Expected routing |
|---|---|---|
| TASK-0002 | Add routine CI and approved manual GitHub Pages deployment workflow | `cloud-deep`, high reasoning, security-focused `independent-cloud-deep` review, Security impact: material |
| TASK-0003 | Implement deterministic time formatting/domain primitives and running local clock | `cloud-standard`, medium reasoning, independent review as selected in the ready task |
| TASK-0004 | Build deterministic GeoNames/IANA city catalog generation, provenance, and validation | `cloud-standard`, medium reasoning |
| TASK-0005 | Add/remove world clocks with typed versioned local persistence and recovery | `cloud-standard`, medium reasoning |
| TASK-0010 | Replace the separate city search + select controls with one searchable combobox and live filtering | `cloud-standard`, medium reasoning; execute before TASK-0006 |
| TASK-0006 | Add global digital/analog and 12h/24h settings with persistence | `cloud-standard`, medium reasoning |
| TASK-0007 | Implement city-local one-time/daily alarm domain logic and persistence | `cloud-deep`, high reasoning because time-zone/DST/overdue semantics are correctness-sensitive |
| TASK-0008 | Add audible alarm runtime orchestration and browser/background evidence | `cloud-standard` or `cloud-deep` depending browser-policy uncertainty at readiness |
| TASK-0009 | Cross-browser, visual, responsive, and release-acceptance hardening | mixed: implementation under `cloud-standard`; final visual/release verdicts remain human-controlled |

## Task-boundary rules

- Do not combine GitHub Pages permissions/deployment configuration with unrelated product features.
- Do not combine catalog generation/provenance with alarm behavior.
- Keep pure time/alarm/persistence logic independently testable from Vue presentation where practical.
- A planned task may be split if readiness analysis finds materially different risk or verification needs.
- If an implementation discovery invalidates architecture, requirements, or this sequence, stop the smallest affected downstream work and replan before continuing.
- Since there is currently one human implementer, no explicit execution DAG is required. If concurrent human implementation begins later, reassess dependencies and unsafe collisions before parallel work starts.

## Verification progression

Every implementation task retains the canonical baseline:
- `make harness-check`;
- relevant targeted tests;
- `make security`;
- `make verify`;
- browser/E2E checks when user-visible behavior or deployment is involved.

Add evidence progressively rather than deferring system-level verification to the end:
- deployment/base-path verification in M2;
- deterministic time-zone cases in M3;
- catalog/provenance and persistence recovery in M4;
- searchable city-combobox usability refinement in M4 before starting M5;
- settings propagation in M5;
- DST/overdue alarms in M6;
- supported-browser and visual acceptance in M7.
