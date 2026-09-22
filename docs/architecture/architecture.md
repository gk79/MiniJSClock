# Architecture

## Context and scope

What is inside the system boundary? What external systems/users interact with it?

## Chosen architecture

Describe components, responsibilities, interfaces, and dependency direction. Prefer a small number of explicit boundaries.

## Technology choices

| Concern | Choice | Version/pin | Why | Verification/source |
|---|---|---|---|---|
| Runtime | ... | ... | ... | ... |
| Web/API | ... | ... | ... | ... |
| Persistence | ... | ... | ... | ... |
| Test stack | ... | ... | ... | ... |
| Deployment | ... | ... | ... | ... |

## Architectural invariants

List rules that should become mechanical checks where possible, for example:

- domain code does not depend on UI/infrastructure;
- external input is validated at boundaries;
- secrets never enter source control/logs;
- persistence access is behind explicit interfaces;
- dependencies between modules follow an allowed direction.

## Runtime and data flow

Use Mermaid or simple diagrams stored next to this file when helpful.

## Failure modes

Describe expected failure behavior, retries/timeouts, idempotency, degradation, and recovery.

## Open architecture questions

- [ ] ...
