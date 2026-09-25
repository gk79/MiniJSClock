# Learning candidate: Stabilize browser local-clock smoke timing

- ID: LEARN-20260925-155537
- Status: candidate
- Date: 2026-09-25
- Related task/PR: TASK-0004
- Ownership: project-local
- Confidence: medium

## Observation

The existing Playwright local-clock smoke intermittently failed its exact-second
comparison during full local `make ci`, while the catalog gates and isolated
browser smoke passed. No application runtime or browser test files changed in
TASK-0004.

## Evidence

Three plain `make ci` attempts failed at `e2e/app.spec.ts` line 23 or 26
(`expect.poll(matchesBrowserLocalTime).toBe(true)`). A standalone
`make test-e2e`, `make test-integration && make test-e2e`, and
`CI=1 make ci` passed. The failing page snapshots showed a rendered clock.
Hosted CI configuration uses `CI=1` and permits Playwright retries.

## Root cause

The exact reason for the local failures is unconfirmed. The assertion samples
display text and wall time at second resolution and only accepts exact equality;
scheduling delay is a plausible cause. No claim of an application defect or
catalog effect is supported by the evidence.

## Generalized lesson

A browser clock smoke should verify that displayed time tracks the browser
clock and advances within a bounded tolerance, without treating a harmless
short scheduling delay as a functional failure.

## Proposed control

In a separate scoped change, inspect a Playwright trace for a failing run, then
replace the exact-second predicate with a documented small bounded tolerance
while retaining the advancement assertion. Verify with repeated local and hosted
runs before promotion. Do not weaken the test based only on this candidate.

## False-positive / over-constraint risk

A tolerance that is too wide could hide a stopped ticker or incorrect zone.
The accepted bound must be justified by observed timing and remain small enough
to detect those defects.

## Review outcome

Pending project reviewer or human decision.

## Promotion

Pending review; no test or policy was changed by this candidate.
