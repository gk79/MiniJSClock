# Implementation plan

**Status: ACTIVE — post-release M8.** Milestones M1 through M7 remain complete;
their implementation, release acceptance, and human production release verdict
are satisfied. M8 is the approved post-release FR-013 increment.

## Strategy

Proceed as a single-human, naturally linear implementation stream, including M8. No dependency DAG is needed unless the implementation model changes to concurrent human contribution.

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
| M7 — Release acceptance | Supported browsers, representative layouts, visual quality, narrow-width behavior, and release artifact are accepted | NFR-001, NFR-004, NFR-005, NFR-007; human visual approval; Chrome/Edge/Firefox smoke; explicit human release verdict satisfied |
| M8 — Persistent world-clock ordering | Visible keyboard-operable controls reorder selected city clocks by one position and persist the order | TASK-0012; FR-013 and FR-004; targeted component/E2E and canonical verification; fresh independent review |

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
| TASK-0011 | Stabilize deterministic browser-local clock smoke; unblock TASK-0007 hosted integration verification before TASK-0008 | `cloud-standard`, medium reasoning, `independent-cloud-standard` review; Security impact: none |
| TASK-0008 | Add audible alarm runtime orchestration and browser/background evidence | `cloud-deep`, high reasoning, `independent-cloud-deep` review; Security impact: none |
| TASK-0009 | Cross-browser, visual, responsive, and release-acceptance hardening | mixed: implementation under `cloud-standard`; final visual/release verdicts remain human-controlled |
| TASK-0012 | Add persistent manual world-clock ordering with visible `Move earlier` / `Move later` controls | `cloud-standard`, medium reasoning, `independent-cloud-standard` review; Security impact: none |

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

## First GitHub Pages deployment gate

The first Pages deployment completed during TASK-0009; see the [deployment and acceptance evidence](../../tasks/done/TASK-0009.md). TASK-0008 planning and implementation did not trigger Pages. The first actual deployment followed this ordered human-controlled gate:

1. TASK-0008 fresh formal `independent-cloud-deep` review PASS.
2. Human-controlled integration into `main`.
3. Push-triggered hosted CI PASS for the exact integrated `main` commit.
4. Manually trigger the first actual GitHub Pages deployment from that exact verified `main`.
5. Smoke the real hosted site before final TASK-0009 release acceptance.

Hosted smoke covers app/assets/base path; city picker and persistence; Digital/Analog; 12h/24h; alarm create/edit/remove; alarm sound enable/test; active-tab due delivery; background/resume overdue delivery; reload/session behavior; current stable Chrome, Edge and Firefox where available; and console/network sanity. Record actual browser/version evidence and leave unavailable-browser or real-audio checks open rather than inferring PASS.

TASK-0008 deterministic automation and available Chromium evidence support implementation/formal review. Real-browser audio and background acceptance remain a human post-integration gate. No maximum background latency or closed-app delivery is promised.

TASK-0009 owned final cross-browser hardening, layout/visual acceptance, and release acceptance. The human production-release verdict is now satisfied. The first hosted smoke was deployment verification, not a production-release verdict. This plan did not create TASK-0009 or authorize deployment during TASK-0008.

## M8 post-review pilot integration gate

After TASK-0012 implementation passes its targeted and canonical checks and a fresh top-level `independent-cloud-standard` formal review returns PASS:

1. Close TASK-0012 under the normal task lifecycle.
2. Require an explicit human decision before integration.
3. If approved, integrate the reviewed TASK-0012 lineage only into `experiment/m-020-post-release-pilot`.
4. Verify the exact integrated pilot head with the canonical repository verification contract, including `make ci`.
5. Record the pilot acceptance and evidence needed to evaluate the post-release Method experiment.

This M8 pilot does not authorize integration into production `main`, a production GitHub Pages deployment, or a new production release verdict. The production release baseline remains `6a34009893cc4f54909a62a66358852fe5ea378a`.

Any future decision to promote the FR-013 product change and/or M-020 Method changes from the experimental lineage into production is a separate human-controlled decision and must establish an appropriate non-experimental integration/release path before execution.
