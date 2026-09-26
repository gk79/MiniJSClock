# TASK-0007 finding-focused formal re-review

- Date: 2026-09-26
- Formal verdict: **PASS**
- Exact reviewed remediation: `d71f77385f885c3062433cdcaeb261a5dacdf8cf`
- Previous review evidence: `cb8a16566896f1e7e5130df1a24602b84126d0ba`
- Original reviewed implementation: `b92bb9672a172adbda140c700eb6c8c36df178c8`
- Planning baseline: `89b592fc03142467a1248ec0ef052126a196a841`
- Review branch: `codex/task-0007-rereview`
- Reviewer: fresh top-level finding-focused Codex review, fulfilling the human-authorized `independent-cloud-deep` review assignment. No implementer/remediator-spawned subagent was used. Workstation Layer 0 was read before review; its mapping sections were inconsistent and recorded session metadata initially indicated Sol/Medium. The human explicitly accepted the active model/session and directed this review to proceed. This routing acceptance is a human decision, not independent telemetry proof of a High reasoning setting.

## Scope and provenance

Fetched `origin`; both requested remote heads matched exactly. Remediation is exactly one direct child of the review-evidence head (`0 1` left/right commit count), without divergence. The original implementation and planning baseline remain ancestors. Initial worktree was clean; the local review branch was created from the exact remediation head. The remediation branch was not modified.

Independently inspected R1, R2, the full remediation diff and plausible regressions. Only bounded domain/cache/error feedback, tests, product/architecture clarification and evidence changed. Prior [formal review](task-0007-review.md) is reused only for unaffected parser/migration/ownership, persistence, city/settings/clock behavior, resolver radius/catalog evidence and scope. Its historical REQUEST CHANGES remains unchanged. Remediator notes were context, not proof. No broader architectural, dependency, security, lifecycle or deployment assumption changed requiring a full repeat of that review.

## R1 disposition: resolved

`createAlarmEvaluator()` retains ephemeral domain state in its own closure; no Config V3 field or application runtime wiring is added. All callers use the same transition implementation. The cache key serializes zone, civil date and exact HH:mm. City identity and alarm object identity are correctly irrelevant to occurrence resolution. Key-presence lookup caches undefined gaps. Changed time/zone produces a new identity; rollover resolves new dates. Separate evaluators own separate Maps.

On a miss, resolution occurs before mutation; failure does not insert partial state. When size is 128, the oldest insertion is removed before adding the new entry. Inductively the Map never exceeds 128. FIFO reads do not reorder entries. Independent instrumentation of every Map insertion during public API evaluation observed an exact maximum of **128** over 135 distinct keys; oldest-key recomputation produced 8,643 formatting calls and the same stateless result, followed by zero-call reuse. A separate evaluator was cold. A different city with identical zone/time/date reused established entries with zero calls. Eviction affects performance only.

The [independent probe](task-0007-rereview-probes.mjs) imports/transpiles unchanged source into Node and isolated Chromium. It wraps native `formatToParts` and compares each measured result against stateless evaluation after capturing work; the stateless oracle cannot populate the evaluator cache. Warm evaluations return real expected due entries, so zero calls are not caused by skipping evaluation. Final [raw results](task-0007-rereview-results.json) contain 187 assertions in each runtime plus 10 independent Node persistence assertions. The remediation benchmark was inspected for instrumentation, timer boundaries, real bundled cities, cold instances and warm output assertions; representative conclusions were reproduced by this separate implementation.

| Daily alarms | Cold native calls | Same interval warm calls | Chromium cold ms | One new date calls | Established new date calls |
|---|---:|---:|---:|---:|---:|
| 1 | 5,762 | 0 | 27.8 | 2,881 | 0 |
| 4 | 31,691 | 0 | 70.9 | 11,524 | 0 |
| 12 | 100,835 | 0 | 219.4 | 34,572 | 0 |

For twelve alarms, date rollover took 75.1 ms; one time edit incurred 8,643 calls / 18.7 ms and one previously unused zone incurred 8,643 / 20.2 ms. Established repeats of all these cases made zero calls. The next second after a due occurrence fills one previously unvisited padded-date key (2,881 calls), then steady evaluation is warm. A fresh thirty-day interval incurred 74,906 calls / 162.3 ms, its replay zero calls; the adjacent resume interval filled 28,810 calls / 62.9 ms, then the following second made zero calls. Node twelve-alarm cold evaluation was 263.179 ms. These are single final-run samples, not hardware-independent thresholds; timer-rounded zero milliseconds does not mean zero elapsed work. Earlier successful development runs likewise reproduced deterministic counts; final raw results are the authoritative samples.

Cold synchronous work remains significant and is explicitly documented. Several or roughly twelve alarms fit comfortably: an ordinary padded short interval visits at most four dates per alarm (at most 48 keys), and one new date per alarm on rollover remains within 128. Delayed evaluation normally stops at the latest crossed occurrence rather than scanning the elapsed duration, and the measured thirty-day resume establishes additional keys once. Retaining **one evaluator per runtime/session** is the explicit API contract and is sufficient for intended first-release workloads; no duplicate due engine, extra cache or unstated TASK-0008 workaround is needed. More than 128 distinct keys can evict earlier entries and a working set continually exceeding capacity can thrash. Correct recomputation is acceptable here; this is a memory bound, not an arbitrary-load latency guarantee. The previous every-short-evaluation synchronous blocker is resolved without claiming cold work is free or audio delivery is proven.

Independent expected-result probes and focused tests preserve `(previous,current]`, gaps, first-overlap-only behavior, suppression of the second overlap, delayed/latest coalescing, at most one event per alarm, mixed input/result order, once consumption, daily retention and invalid/reversed rejection. Stateless evaluation's transition body is unchanged apart from injected occurrence resolution. The R2 relaxation returns actual identities at civil endpoints rather than clipping daily occurrences to persistence range; configuration validation remains separate as documented.

## R2 disposition: resolved

Resolver matching still checks exact Gregorian civil day, HH:mm, second `00`, AD era and native zone interpretation. It no longer discards a match because its ISO year is not V3-persistable. Candidate enumeration remains chronological.

`configureOnce` classifies malformed civil input as invalid; zero actual candidates as nonexistent; no strictly future actual candidate as past; and strictly future candidates with none canonical as range. It selects the earliest canonical strictly future match. Native New York overlap probes preserve selection before the first occurrence and at/between occurrences. A separately marked controlled Intl fixture checks mixed representable/unrepresentable candidates, earliest representable selection, equality exclusion and all-candidates-past classification; that fixture is selection evidence, not a claim of a real IANA endpoint overlap.

| Native zone / local minute | Independently formatted actual match | Configuration outcome |
|---|---|---|
| America/New_York / 9999-12-31 23:59 | `+010000-01-01T04:59:00.000Z`, exact second 00, AD | range when future; past at equality |
| Europe/Warsaw / 0001-01-01 00:00 | `0000-12-31T22:36:00.000Z`, exact second 00, AD | range when future; past at equality |
| UTC / 0001-01-01 00:00 | `0001-01-01T00:00:00.000Z` | valid when strictly future |
| UTC / 9999-12-31 23:59 | `9999-12-31T23:59:00.000Z` | valid when strictly future |

Each existence check directly formats the expected actual instant with native Intl separately from the domain and then checks resolver retention and canonical representation. The Warsaw lower-endpoint probe injects a year-zero earlier `now` to isolate range behavior; this is not ordinary present-day scheduling. Existing modern dates, New York spring gap and fall overlap pass. Historical subminute offsets remain outside the existing future-minute scheduling domain.

`isCanonicalInstant` is byte-for-byte unchanged: exact four-digit UTC year 0001–9999, valid date, second 00, millisecond 000 and canonical round trip. Extended years, year 0000, alternate offsets, nonzero seconds and shortened ISO forms are independently rejected by both `parseConfig` and `saveConfig`; rejected saves perform no write. No V4 exists. `src/config.ts` and its tests are unchanged; all 41 persistence tests pass, including exact V3, lazy V1/V2 migration, no eager writes, future-version protection, malformed discriminators, city ownership/uniqueness, and storage failures.

Product requirements are coherent: permitted civil input years do not guarantee representable UTC endpoint occurrences; saving requires an actual future match within the narrower persisted range. The range message is distinct from clock-forward feedback. Component and Chromium tests show truthful feedback, min/max, error linkage and no overwrite of a previously valid configuration; reload restores the original daily alarm. Independently inspected the generated 320px range-error screenshot: message and Save/Cancel controls remain visible and contained. This is not product-owner visual acceptance or screen-reader evidence.

## Test quality and regressions

New cache tests fail if lookup is bypassed, gaps are recomputed, zone/time/date keys are omitted, unlimited growth prevents eviction, eviction changes output, overlap's second event returns, or cached output differs from the stateless oracle. Their overflow test alone establishes eviction rather than the exact numerical maximum; the independent every-insertion probe additionally establishes the precise 128-entry bound. R2 tests separately demonstrate actual existence, rejection by persistence representation and range/past classification. UTC endpoint success alone was insufficient; non-UTC endpoint coverage now closes that gap.

Exact diff inspection confirms no changes to V3 shape, migrations/discriminator, ownership, city cleanup, settings/city flow, display/time math, existing exact-second assertion, dependencies, catalog, workflows/deployment, ticker/audio/background integration. Application source/tests were untouched throughout re-review and closeout. TASK-0008 remains uncreated/unstarted. No new blocking findings.

## Executed verification

| Command | Observed outcome |
|---|---|
| `git fetch origin`, exact ref/parent/ancestry/clean-worktree checks | Passed; local review branch created from exact head |
| `git diff --check` and `git diff --check cb8a165..d71f773` | Passed |
| `make harness-check` | Passed at baseline and closeout |
| `npm run test:unit -- src/__tests__/alarms.spec.ts src/__tests__/alarm-evaluation.spec.ts src/__tests__/alarm-config.spec.ts src/__tests__/config.spec.ts` | 98 passed (37 domain, 7 cache, 13 component, 41 persistence) |
| `npm run test:e2e -- e2e/alarms.spec.ts e2e/clock-settings.spec.ts e2e/world-clocks.spec.ts e2e/app.spec.ts` | All 16 Chromium tests passed, including unchanged exact-second clock assertion |
| `make test-integration` | Five catalog contracts and offline regeneration passed |
| `make security` | Gitleaks no leaks; OSV no known vulnerable dependencies, 271 packages |
| `make verify` | Format/lint/types, all 108 unit/component tests, security and production build passed |
| Plain `make ci` | Passed; 108 unit/component tests, integration and all 16 Chromium tests, no CI override or retry/assertion changes |
| `node docs/quality/reviews/task-0007-rereview-probes.mjs` | Final run passed in Node 24.21.0 and headless Chromium 153; raw work/correctness/endpoint evidence retained |

A first independent probe's zone edit used Kathmandu, already cached by another of the twelve cities. Its positive-work assertion failed because correct cross-city reuse made zero calls. The fixture was corrected to unused Paris, then rerun; no source change was needed. Later added mixed-order/interval and synthetic-selection probes and exact parse/save probes also passed. No application gate failed or was weakened.

## Limits, retrospective and handoff

Default command and image sandboxes could not start because of the existing `/mnt/wslg/distro` mount error. Approved host execution was used; no sandbox PASS or repair is claimed. Screenshot inspection used approved host reads after the image sandbox failed. Project files were written only to this checkout; temporary execution logs used `/tmp`. No Edge/Firefox, screen-reader, product-owner acceptance, audio/background delivery, hosted CI, deployment, Pages or production release evidence is claimed.

Harness retrospective: **no new harness learning**. Existing environment and evaluation-cost candidates cover the observed limitations; fixture correction was caught by the independent assertions. All learning candidates remain unchanged and unpromoted. Historical REQUEST CHANGES and remediation benchmark evidence remain intact.

TASK-0007 is closed as done after this formal PASS and final verification. Next handoff: human integration decision. No merge/integration, deployment, Pages run or release occurred; TASK-0008 remains uncreated/unstarted.
