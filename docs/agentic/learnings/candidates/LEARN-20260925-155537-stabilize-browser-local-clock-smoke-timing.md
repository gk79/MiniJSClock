# Learning candidate: Stabilize browser local-clock smoke timing

- ID: LEARN-20260925-155537
- Status: candidate
- Date: 2026-09-25
- Related task/PR: TASK-0004, TASK-0011
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

Hosted [CI #29](https://github.com/gk79/MiniJSClock/actions/runs/36264019043), run ID `36264019043`, failed at exact main SHA `752d73dd6cd7e95559b5e87f81ce7384e1cdf37b`: 15 other Chromium E2E tests passed. Attempts 1/2 passed advancement then timed out at line 26 equality; attempt 3 timed out at line 23 initial equality. TASK-0007 did not change this test. Local TASK-0011 pre-change focused smoke passed; local reproduction is not required to establish the hosted escape.

TASK-0011 local evidence: focused smoke PASS; ordinary repeat-each=20/workers=1 PASS (20/20); CI=1 repeat-each=20 PASS (20/20, no retries); explicit America/New_York context PASS. A temporary test-only interval-handle capture/cancellation after initial equality caused the first advancement assertion to fail as expected; the experiment was restored. An earlier numeric-ID cancellation did not stop Playwright's fake timers and was discarded as invalid evidence.

First full E2E run: stabilized app smoke passed, but unchanged world-clock test failed exact-second Asia/Tokyo equality at e2e/world-clocks.spec.ts:50 (15 passed, 1 failed). Full-suite rerun passed 16/16; plain make ci also passed 16/16 E2E and all canonical gates. At the initial implementation head this predicate was outside scope and unchanged. The user subsequently authorized a bounded TASK-0011 amendment after advisory read-only review: stabilize only the first world-clock scenario time correctness/advancement checks. The repeated structural before/text/after wall-clock sampling pattern confirms the reusable issue spans both local and IANA smoke predicates; it is not specific to one test. No application defect is established.

Bounded amendment verification: local smoke 20/20, world-clock first scenario 20/20, combined ordinary 40/40, combined CI=1 with retries explicitly disabled 40/40 PASS. Two full make test-e2e runs each passed 16/16; make harness-check, make security, make verify and plain make ci PASS. All non-timing selection/order/persistence/removal assertions and later world-clock scenarios stayed unchanged. No further scheduler-racy predicate failure observed during this verification. At implementation handoff formal independent review had not started; no hosted integration PASS claimed.

## Root cause

The exact reason for the local failures is unconfirmed. The assertion samples
display text and wall time at second resolution and only accepts exact equality;
scheduling delay is a plausible cause. No claim of an application defect or
catalog effect is supported by the evidence.

## Generalized lesson

Control the browser timeline to verify exact local-time rendering and real interval advancement without scheduler-dependent wall-clock sampling.

## Proposed control

TASK-0011 installs Playwright Clock before navigation, pauses at browser-local 23:59:58, derives expected HH:mm:ss via browser Date getters, then runs actual scheduled callbacks for 1, 2, and 60 seconds. The bounded amendment also installs Clock before world-clock navigation, pauses at 2026-01-15T14:59:58Z, derives Tokyo/London HH:mm:ss with browser Intl.DateTimeFormat and explicit Asia/Tokyo/Europe/London zones, and runs real interval callbacks for 1 then 2 seconds. Tokyo midnight and London minute crossings are checked. Existing selection/order/persistence/removal assertions remain. Exact equality and advancement assertions remain. No timezone assumption, tolerance, retry increase, or product change. See https://playwright.dev/docs/clock.

## False-positive / over-constraint risk

Stopped or wrong-time rendering fails exact equality or advancement; one/multiple ticks and minute/day boundaries are covered. A wrong timezone with an identical offset at the chosen instant may coincide; broader zone/DST domain tests remain necessary. Controlled timers do not characterize real background throttling or wall-clock scheduling latency. This is a foreground ticker/rendering smoke, not an alarm-runtime guarantee.

## Review outcome

Fresh top-level independent-cloud-standard review PASS against `4acae3bbd3c0b08859bc916ee39c1771a0f1259e` on 2026-09-27; see [formal review](../../../quality/reviews/task-0011-review.md). Independent repetitions, stopped-ticker probe, alternate timezone, two full E2E runs and canonical gates support the control. Status remains candidate pending integration and hosted green CI.

## Promotion

Keep status candidate. Promotion requires independent control review and successful hosted CI after integration. No AGENTS/global Method policy change.
