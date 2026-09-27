# TASK-0011 independent review

- Formal verdict: PASS
- Review level: fresh top-level `independent-cloud-standard`, medium-or-stronger reasoning; independent review session, not an implementer subagent.
- Date: 2026-09-27
- Reviewed implementation: `4acae3bbd3c0b08859bc916ee39c1771a0f1259e`
- Baseline: `752d73dd6cd7e95559b5e87f81ce7384e1cdf37b`
- Review branch: `codex/task-0011-review`
- Findings: no blocking findings.

## Provenance and scope

Read AGENTS, AI workflow, task, current state, implementation plan, timing candidate, both affected tests, Playwright configuration and enough production ticker/formatter/presenter behavior to establish the exercised contract. Layer 0 RetKomp mapping resolves independent standard through cloud-standard with medium reasoning. Fetched origin; origin/main and implementation refs matched the requested SHAs. Merge base equals baseline; implementation is exactly two commits ahead and zero behind. Worktree was clean before creating this local branch at the exact implementation head.

Reviewed cumulative baseline...implementation diff and both individual commits: `46cb5ba567a9b2779a05b5409981a574a7277114` and `4acae3bbd3c0b08859bc916ee39c1771a0f1259e`. Changes are confined to two E2E files, task, current state, one bounded plan insertion and existing candidate. The second commit addresses the same structural race in the first world-clock scenario, within the authorized amendment. Production source/ticker, alarms, Config schemas, picker/persistence logic, dependencies/lockfile, retry/timeout configuration, CI and Pages workflows and AGENTS/Method policy are unchanged. No TASK-0008 task exists.

## Clock and product contract

Pinned installed Playwright reports 1.63.0. The [official Clock guide](https://playwright.dev/docs/clock) and [API contract](https://playwright.dev/docs/api/class-clock#clock-run-for), checked independently, support install before application navigation/timer creation, then pauseAt and runFor. Installed `playwright-core/lib/coreBundle.js` confirms install is registered through context init scripts, pauseAt stops real-time synchronization and advances due timers to the target, and runFor calls the injected controller's timer-draining loop through the requested duration. It executes scheduled application callbacks; it does not merely replace Date. Clock history persists over reload, while application mount and storage logic still execute.

The app smoke constructs its target with browser-local Date components on the initial blank page, before application navigation. This preparatory Date construction creates no application timers and the new document receives Clock before application execution. Expected HH:mm:ss uses browser local getters. After exact initial equality, runFor(1000), runFor(2000) and runFor(60000) must change the DOM and match the exact controlled browser time. The intended readings are 23:59:58, 23:59:59, 00:00:01 and 00:01:01, covering local midnight and minute rollover. No tolerance or retry/timeout increase is present.

The world smoke installs before navigation and uses explicit UTC instant 2026-01-15T14:59:58Z. Browser Intl with explicit Asia/Tokyo and Europe/London independently supplies exact expected text, without runner timezone dependence. Both clocks must change and equal expected after 1 and 2 seconds: Tokyo 23:59:58 -> 23:59:59 -> 00:00:01; London 14:59:58 -> 14:59:59 -> 15:00:01. This genuinely crosses Tokyo midnight and London's minute/hour boundary. The real App.vue interval assigns new Date() every 1000ms to the shared reactive instant; clocks render that instant. There is no test-only product ticker.

Byte-for-byte baseline comparison independently confirmed the city interaction/order/localStorage prefix, reload/removal suffix and every subsequent world-clock scenario are unchanged. Clock does not mock storage, selection or reload initialization. Passing full suites confirm those assertions remain operational under control.

## Independent verification

All commands below were executed in this review session, rather than accepted from implementer reports.

| Command or probe | Result |
|---|---|
| `git diff --check` and cumulative diff check | PASS |
| `make harness-check` | PASS |
| `npx playwright test e2e/app.spec.ts --repeat-each=20 --workers=1 --retries=0` | 20/20 PASS, 16.0s |
| `npx playwright test e2e/world-clocks.spec.ts --grep 'adds, restores' --repeat-each=20 --workers=1 --retries=0` | 20/20 PASS, 16.7s |
| `CI=1 npx playwright test e2e/app.spec.ts e2e/world-clocks.spec.ts --grep 'shows a running\|adds, restores' --repeat-each=20 --retries=0` | 40/40 PASS, 24.3s, retries disabled |
| Unchanged app smoke with temporary config setting America/New_York and retries=0 | 1/1 PASS, 1.6s |
| Temporary copied app smoke capturing and cancelling the actual setInterval handle after initial equality | Expected FAIL at first DOM advancement assertion; display stayed 23:59:58 after runFor(1000) |
| `make test-e2e`, twice after probe removal | 16/16 PASS each, 4.0s each |
| `make security` | PASS: Gitleaks no secrets; OSV no known vulnerable dependencies |
| `make verify` | PASS: formatting, lint, typecheck, 108 unit/component tests, security, build |
| Plain `make ci` | PASS: canonical verify, catalog integration, 16/16 Chromium E2E (3.9s) |
| `npx playwright test --list` | Exactly 16 tests in four files, Chromium only |

The negative probe checked exactly one captured application interval before clearing its actual handle. Initial equality passed, browser time advanced, and the original not.toHaveText(previous) assertion failed. Temporary copied test/config were removed; neither reviewed E2E file was edited, and worktree was clean before documentation closeout. No assertion, timeout or retry weakening occurred.

## Limits, learning and handoff

Sandbox startup fails before command execution because of unsupported `/mnt/wslg/distro` host mount. Auto-reviewed escalated local commands supplied the required evidence; no review check remained blocked. Local browser evidence is Chromium only, with one alternate context timezone. Controlled foreground callbacks do not measure native scheduler latency, background throttling, alarm-runtime guarantees or all zone/DST combinations. Existing domain coverage remains necessary; zones with identical offsets at this instant may coincide.

The candidate accurately separates scheduler-dependent wall-clock sampling (specific scheduling root cause still unconfirmed), deterministic executable control, foreground ticker coverage, hosted #29 escape and subsequent local evidence. Existing LEARN-20260925-155537 stays under candidates with status candidate; promotion requires reviewed control integration and hosted green CI. Harness retrospective: no new harness learning beyond the existing timing and documented tooling candidates; no duplicate candidate or policy change is justified.

TASK-0011 is closed to tasks/done after this formal PASS. Next handoff: human integration. TASK-0007 hosted integration verification remains blocked until TASK-0011 is integrated and hosted CI passes; no hosted PASS is inferred from local commands. TASK-0008 remains uncreated/unstarted. No merge/integration, Pages deployment or release occurred.

Documentation closeout verification: `make harness-check` and `git diff --check` PASS; reviewed tests and production/configuration files unchanged.
