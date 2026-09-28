# TASK-0008 formal independent review

- Date: 2026-09-28
- Verdict: **PASS**; no blocking findings
- Reviewed implementation: `f23e9c2a2a3b98aa1a5de0d539374488891e8660`
- Planning baseline: `9a9f426ba85b0949f3ab53923e8affd962966bec`
- Underlying main: `edcfaecf4321f7bde9fa889d46d518576df46c41`
- Review branch: `codex/task-0008-review`
- Reviewer: fresh top-level `independent-cloud-deep` session; no implementer-spawned agent supplied the verdict.

## Provenance and scope

Fetched `origin`; all three requested refs matched exactly. The implementation is one commit ahead of planning, zero behind, with planning as its exact merge base. The initial worktree was clean. This local review branch was created from the exact implementation head; the implementation branch was not changed.

Inspected the exact diff, `src/alarms.ts`, `src/config.ts`, new runtime/audio/App code and tests, existing domain/cache/configuration/browser regressions, requirements, alarm architecture, threat model, quality strategy and reviewed TASK-0007. The diff leaves domain and Config V3 implementation, dependency manifests, workflows and deployment untouched. It adds no worker, notification service, backend, network audio asset or new scheduler. Security impact remains `none` under the existing threat model.

## Runtime and persistence disposition

App loads configuration before capturing one `sessionStart`. The runtime uses that instant for both `openAlarmSession` and the first evaluation baseline. Stale once alarms at or before start are removed without delivery; future once and daily alarms remain. Startup persistence is conditional on actual stale removal. V1/V2 migration alone does not write, future-version bytes remain protected, and failed writes retain in-memory consumption with visible storage feedback. A subsequent reload classifies an old stored once alarm as stale.

`createAlarmRuntime` constructs one retained `createAlarmEvaluator()`; neither ticker, foreground event, edit, city removal nor backward reset recreates it. Production repeating evaluation uses its method, never stateless `evaluateAlarms()`. Existing instrumentation passes factory-count and established daily-key zero-native-scan assertions. The only recurring application interval is the existing display ticker; audio timeouts bound resume attempts. Ticker and visible `visibilitychange` call the same `evaluateNow`, which reads actual time once. Evaluation uses `(previous,current]`; a zero-length repeat does not duplicate due events. A backward instant resets the baseline without event or write, and later forward evaluation works.

The runtime snapshots every due event, removes once alarms in memory, attempts required persistence, and advances its baseline synchronously before invoking audio. It retains daily alarms. A delayed interval reports one latest daily occurrence per alarm, while simultaneous distinct alarms each get an event and cue attempt. IDs include a session sequence; copied city/name/instant fields survive city removal. Dismissal affects one runtime event, never daily configuration. Failed, synchronously throwing, rejected or pending audio cannot replay consumed once alarms or block later evaluation. Runtime and adapter disposal guard late outcomes and remove the interval/listener and browser audio resources.

Two temporary independent Vitest probes, removed after execution, passed: one exercised exact/stale/future startup boundaries, reversal, simultaneous once/daily delivery, commit-before-rejected-audio, dismissal and one evaluator; the other exercised two concurrent resume promises with one rejection and one success, interrupted state change, timeout, late resolution, and disposal with another pending attempt. The committed focused suites and source trace cover no-stale startup, migration, storage failure, future-version protection, edits/removals, pending audio and native cache reuse. No independent probe changed production or retained tests.

## Audio, browser and UI disposition

The adapter creates an `AudioContext` only after explicit enable/test; due attempts use an existing context. It observes `running` and successful finite oscillator/gain scheduling before returning `requested` or `ready`. Suspended, interrupted, closed and unexpected non-running states fail conservatively when they cannot resume to running. Explicit retry may recover; a closed context is recreated only by explicit retry. The cue stops after 0.3 seconds, nodes disconnect on completion/disposal, and the context listener is removed. The 3-second resume timeout yields a terminal failure and suppresses a late historical cue; browser throttling can delay the timeout itself. Concurrent attempts have separate terminal outcomes and do not block domain events. State changes away from running downgrade prior readiness; disposed state cannot publish late UI changes.

Visible wording says a sound **request** succeeded, not that a speaker was audible. The enable/test and dismissal controls are native keyboard-operable buttons. Readiness and due events use polite live semantics; each simultaneous due event remains visible until its own dismissal, with no focus stealing. The 320px E2E checks no horizontal overflow. No screen-reader acceptance is inferred. Notifications and readiness disappear on reload.

The native audio E2E was rerun in **headless Chromium 153.0.8010.12 on Linux/WSL**, Playwright 1.63.0, against the production `/MiniJSClock/` base path. It does not replace `AudioContext`: a button gesture reaches the native API, the adapter reports requested cues for due once and daily alarms, once is consumed in stored V3, daily remains, no replay occurs, keyboard dismissal works and reload clears runtime UI. This proves native cue scheduling, not physical speaker output. Separate injected-unavailable tests prove fallback. Playwright Clock is installed before navigation/timers; `runFor` progresses callbacks, `fastForward` fires skipped due timers at most once, and `setSystemTime` plus a synthetic visible event tests the foreground path without an intervening ticker. These are deterministic orchestration tests, not actual background-throttling evidence. Current [Playwright Clock documentation](https://playwright.dev/docs/api/class-clock) and [MDN AudioContext state documentation](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) support these interpretations; interrupted behavior remains browser-dependent.

## Verification and limits

| Check | Result |
|---|---|
| Exact range `git diff --check`; `make harness-check` | PASS |
| Focused runtime/audio/domain/cache/config/component Vitest | 129 PASS |
| Two temporary independent probes | 2 PASS, removed afterward |
| Focused runtime/alarm/clock Playwright | 14 Chromium PASS |
| `make test-e2e` | 20 Chromium PASS |
| `make test-integration` | Five contracts and offline regeneration PASS |
| `make security` | Gitleaks no leaks; OSV no known issues among 271 packages |
| `make verify` | Format/lint/types, 139 unit/component tests, security and build PASS |
| Plain `make ci` | Full verify, integration and all 20 E2E PASS |

No gate, retry setting or assertion was weakened. The normal sandbox could not start due to the known WSL `/mnt/wslg/distro` mount condition; authorized host execution was used. No actual Chrome/Edge/Firefox physical audio/autoplay, active-tab delivery, real background/resume, screen-reader, hosted CI, product-owner visual acceptance, Pages or release evidence is claimed. Human post-integration checks remain open for those browser conditions plus reload/stale and multiple-due scenarios. The first Pages deployment remains barred until the reviewed task is integrated and hosted CI passes for exact `main`.

Harness retrospective: **no new harness learning**. Existing candidates cover the sandbox limitation and evaluator cost; the independent probes found no missing reusable gate or defect. No learning candidate or policy was changed.

TASK-0008 closes as done after this PASS and closeout checks. Next handoff: human integration, then exact-main hosted CI and the approved ordered Pages/real-browser acceptance path. No integration, deployment, Pages trigger, release or TASK-0009 creation occurred in this review.
