# TASK-0007 independent implementation review

- Date: 2026-09-26
- Formal verdict: **REQUEST CHANGES**
- Reviewer: fresh top-level Codex cloud review session; `independent-cloud-deep`, high reasoning. No implementer-spawned reviewer or advisory verdict was used as formal evidence.
- Exact reviewed implementation: `b92bb9672a172adbda140c700eb6c8c36df178c8`
- Planning baseline: `89b592fc03142467a1248ec0ef052126a196a841`
- Evidence branch: `codex/task-0007-review`

## Blocking findings

### R1 — Medium: ordinary daily evaluation repeats excessive synchronous work

Location: `src/alarms.ts:141-146`, calling `dailyOccurrence` and the exhaustive resolver at `src/alarms.ts:65-76`.

A normal one-second evaluation of twelve daily alarms at `2026-09-26T12:00:00Z`, each configured for 08:00 in twelve selectable bundled city zones, makes **100,835** native `Intl.formatToParts()` calls per evaluation. Three independent Chromium samples took **220.4, 220.4, and 220.2 ms**. Four alarms took 68.2–70.5 ms (31,691 calls). One alarm took 14.2–25.1 ms (5,762 calls). Repeated runs reproduced these call counts and approximate timings.

The padded dates are exhaustively resolved anew on every call. The API accepts neither reusable occurrence state nor a resolver/cache supplied by its caller. This is a practical runtime-readiness blocker: ordinary second-level use occupies about one fifth of a desktop browser main-thread second with twelve alarms. A minute cadence reduces total CPU but still causes the same recurring synchronous pause and changes active-tab delivery timing. Implementing a separate cached due engine in TASK-0008 would bypass or duplicate the domain behavior TASK-0007 is meant to provide. Merely documenting a cadence is therefore insufficient.

The exhaustive resolver is reasonable for occasional configuration. The required change is to make repeated domain evaluation usable: reuse bounded date/zone/time resolutions or provide an equivalent efficient domain evaluation path, preserving interval, DST, stale, and consumption semantics. Keep this remediation in TASK-0007; it needs no audio, production dependency, or application ticker wiring. Add deterministic work-count evidence and rerun an independent normal/delayed benchmark. No hardware-specific millisecond threshold is being introduced as project policy.

### R2 — Medium: a real civil minute is misclassified as nonexistent at the supported date endpoint

Location: `src/alarms.ts:72-74` filters matches through `isCanonicalInstant`; `src/alarms.ts:100` then interprets an empty list as a gap. `src/AlarmEditor.vue:57-58` tells the user the clocks move forward.

For selectable New York City, `configureOnce(5128581, 'America/New_York', '9999-12-31', '23:59', new Date('2026-09-26T12:00:00Z'))` returns `{ ok: false, reason: 'nonexistent' }`. Native Intl independently formats `+010000-01-01T04:59:00.000Z` in that zone as **9999-12-31 23:59:00**. The candidate is inside the search radius and is future. It is discarded solely because its UTC year cannot fit the chosen four-digit persistence representation. There is no forward transition or nonexistent civil minute.

The date control and documented civil domain explicitly include 9999-12-31. Existing endpoint tests use UTC only, while catalog round trips stop at 9998; they miss the civil/UTC representation boundary.

Keep the exact V3 schema protected. Distinguish an out-of-representable-range match from a genuine gap, and give truthful invalid/range feedback with a documented boundary. Do not broaden the persistence format silently. Add deterministic negative-offset upper-endpoint tests, corresponding positive-offset lower-endpoint coverage where relevant, and preserve ordinary gap/overlap behavior.

## Independent verification

All commands used the exact implementation source. Application source/tests were unchanged throughout this review.

| Command or probe | Observed result |
|---|---|
| `git fetch --all --prune`, ref/ancestry/parent inspection | Clean initial worktree; local HEAD and remote implementation ref matched exact requested SHA; baseline was ancestor; exactly four linear commits, no unexpected divergence; fresh local review branch created from exact head |
| `git diff --check 89b592f...b92bb96` | Passed |
| `make harness-check` | Passed |
| `npm run test:unit -- src/__tests__/alarms.spec.ts src/__tests__/config.spec.ts src/__tests__/alarm-config.spec.ts` | 86 tests passed: 33 domain, 41 persistence, 12 component |
| `npm run test:e2e -- e2e/alarms.spec.ts e2e/clock-settings.spec.ts e2e/world-clocks.spec.ts e2e/clock.spec.ts` | 14 Chromium alarm/settings/world tests passed; `clock.spec.ts` is not a repository file and contributed no test |
| `npm run test:e2e -- e2e/app.spec.ts` | Existing exact-second clock test passed directly; assertion unchanged |
| `make test-integration` | Five catalog contracts and offline regeneration passed |
| `make security` | Gitleaks found no leaks; OSV-Scanner found no known vulnerable dependencies (271 lockfile packages) |
| `make verify` | Formatting, lint, typecheck, all 96 unit/component tests, security and production build passed |
| Plain `make ci` | Passed without a CI environment override or assertion/retry changes; includes verify, integration and all 15 Chromium E2E tests |
| `TZ=Pacific/Honolulu node docs/quality/reviews/task-0007-probes.mjs` | 46 independent parser cases, 13 resolver cases, 50,310 native offset checks across all 258 bundled zones, 516 catalog resolver round trips and three interval checks passed; independently reproduced R2 |
| `node docs/quality/reviews/task-0007-cost.mjs` | Measured unchanged API in Node and isolated headless Chromium; deterministic native call counts and timings saved in `task-0007-cost-results.json` |

The parser matrix independently covers numeric versions 1/2/3, safe future versions, malformed `"3"`/`"4"`, null/booleans/fractional/unsafe numbers, strict time/instant forms, mixed alarm shapes, selection ownership and duplicate city alarms. A direct Node import of `config.ts` initially could not resolve its extensionless import; the portable probe uses the existing TypeScript compiler to load the unchanged modules. An initial offset probe assertion distinguished negative zero from zero; the probe was corrected to compare mathematical remainder, then rerun. Neither probe issue required an application change.

## Resolver bound and semantics assessment

Civil parsing explicitly uses UTC and round-trip Gregorian validation. The candidate grid, requested Gregorian/Latin/h23/era fields, exact-second comparison, chronological candidate order and strict-future selection correctly handle the examined ordinary/DST cases. Independent cases include New York transition boundaries, Lord Howe's half-hour gap/overlap, Kathmandu, Apia's skipped date, positive/negative extreme offsets and UTC year endpoints. Daily first-overlap suppression, `(previous, current]`, delayed coalescing, one-time consumption and session-boundary stale removal are supported by actual code and tests. Selecting the latest crossed daily occurrence is consistent with the approved at-most-one-event semantics. Invalid/reversed intervals are rejected and output follows stable input order.

The native offset probe visits all 258 bundled zones monthly in 2026–2040 and additional months in 2099/2100/2400/9998/9999. Observed current/future offsets are whole minutes, from -11 to +13 hours. Separately, independent binary inspection of the installed 2026c TZif files examined 1,388 stored offset types for all bundled zones; all were within ±24 hours (including historical offsets: approximately -15.936 to +14 hours). This is supplemental system-data evidence, not a claim that the browser reads those files or that sampled instants prove all future rules.

[ECMA-402 §6.5](https://tc39.es/ecma402/#sec-use-of-the-iana-time-zone-database) requires IANA-backed named-zone behavior and describes database updates; [IANA theory](https://data.iana.org/time-zones/tzdb/theory.html) describes Gregorian civil modeling, historical local mean time and nontrivial transition rules. Neither establishes a universal eternal ±24-hour bound for any possible zone database. The current catalog/platform evidence supports the radius for the future scheduling domain, subject to the documented recheck when catalog/rules change. R2 is a canonical-representation clipping error, not evidence that the search radius is too small. Historical subminute offsets are outside future alarm scheduling; exact UTC-minute persistence remains deliberate.

## Persistence, UI, test quality and scope

V1/V2 migration preserves city order and applicable presentation/format settings, adds empty alarms, and performs no eager write. V3 validates exact top-level/recurrence shapes, city ownership, uniqueness, canonical instants and daily times. The TASK-0006 discriminator fix remains intact. The single protected persistence path preserves future bytes across settings, city and alarm mutations. City/alarm removal is one mutation/write; re-add has no alarm.

World cards alone have Set/Edit/Remove. Date is one-time-only; inputs and summaries identify the city zone. One-time summaries preserve UTC identity on reload. Submission uses a new actual instant; opening/cancelling does not write. Labels, focus return, live error text and input error linkage are reasonable. Global display changes leave stored semantics intact. Generated Chromium desktop summary and 320px error/editor screenshots were visually inspected for visibility and containment; this is not final product visual approval.

Tests assert behavior rather than raw implementation structure, with meaningful DST/migration/mutation/reload coverage. Old world/settings/App changes are schema/discriminator/selector updates; prior assertions remain. The exact-second Playwright assertion, dependency manifests, catalog, scripts, workflows and deployment files are unchanged. The uncovered gaps are repeated computation and non-UTC civil-year endpoints.

The change stays in TASK-0007: no audible playback/Web Audio/HTMLAudio, production due/session/ticker integration, browser background orchestration, service worker/notifications/backend/runtime network, production dependency, catalog generation/deployment change, multiple alarms per city or top-clock alarm. The architecture document describes the implemented mechanism; R2 needs a correction to its boundary account. TASK-0008 remains uncreated/unstarted.

## Computational cost detail

Chromium results use twelve real selectable city IDs in New York, London, Tokyo, Kathmandu, Adelaide, Apia, Auckland, Pago Pago, Warsaw, Cairo, Los Angeles and São Paulo zones. The configured time is 08:00; the end instant is fixed. Three samples per case are retained, including warm-up/GC variation; no CPU throttle was imposed.

| Daily alarms | 1-second interval | 1-minute interval | 1-hour delay | 30-day delay | 365-day delay |
|---|---|---|---|---|---|
| 1 | 14.2–25.1 ms | 12.9–13.2 ms | 12.4–12.9 ms | 12.3–12.8 ms | 12.4–13.1 ms |
| 4 | 68.2–70.5 ms | 68.6–70.9 ms | 67.6–70.9 ms | 50.0–52.0 ms | 51.5–52.1 ms |
| 12 | 220.2–220.4 ms | 218.1–222.0 ms | 213.3–214.8 ms | 161.7–165.3 ms | 162.2–172.6 ms |

Long intervals generally terminate after finding the latest occurrence, so measured cost does not grow linearly with elapsed days. That is a useful design property. It does not resolve R1's repeated short-interval work. The benchmark instruments native calls in an isolated browser; these are domain timings, not audio/background-delivery or full-app frame measurements.

## Limits and handoff

The default sandbox failed before commands could start with the existing `/mnt/wslg/distro` host-mount error. Approved host execution was used; the sandbox is not fixed. Chrome DevTools MCP was not available; evidence is isolated headless Chromium Playwright and direct runtime probes. No Edge/Firefox, screen reader, product-owner visual acceptance, hosted CI, Pages, audio or background delivery evidence is claimed. Terminal NO_COLOR/FORCE_COLOR warnings are runner output, not observed application console errors.

Next action: bounded `cloud-deep` TASK-0007 remediation for R1/R2, followed by fresh top-level `independent-cloud-deep` re-review. TASK-0007 remains active; no application fix, integration, deployment, Pages run or release was performed here. One project-local computational-cost learning candidate was captured for later review; existing candidates remain unchanged and no policy was promoted.
