# Alarm configuration domain

TASK-0007 implements configuration and pure evaluation only. The application display ticker does not call the alarm domain. Runtime session initialization, due transitions, persistence of consumed alarms, and sound belong to TASK-0008.

## Civil minute resolution

`src/alarms.ts` interprets Gregorian `YYYY-MM-DD` and exact `HH:mm`, independently of the browser-local zone. Inputs use four-digit years 0001 through 9999; native Date round trips reject impossible dates. Persisted instants are exact valid `YYYY-MM-DDTHH:mm:00.000Z`, also round-trip checked. Configuration selects the earliest V3-representable candidate strictly after the supplied actual configuration instant. A real civil minute with future matches only outside the UTC persistence range returns `range`; it is not a clock-forward gap. If all actual matches have passed, it returns `past`. Civil input bounds remain 0001-01-01 through 9999-12-31, but a city's offset can place an endpoint occurrence outside UTC years 0001–9999.

The resolver enumerates all 2,881 actual UTC minute instants within ±24 hours of the civil components encoded as UTC, inclusive. Each candidate is validated against native Intl Gregorian/Latin-number/h23 year, month, day, hour, minute, second and era components in the requested IANA zone. Results are ordered actual instants, including ISO extended-year or year-0000 matches. Zero actual candidates is a gap, one is ordinary, and multiple is an overlap. `resolveCivilMinute` and `dailyOccurrence` return actual identities, not a guarantee of persistence validity; only one-time configuration and Config V3 validation enforce `isCanonicalInstant`. It never parses civil input as browser-local time or assumes a one-hour transition.

The bound covers the bundled catalog's civil offsets, including date-line zones. Since permitted occurrences have second/millisecond zero, every candidate under that offset bound lies on the enumerated grid; the resolver cannot miss one because a transition has an unexpected size or timing. Deterministic tests exercise every bundled zone in winter/summer at 2026 and 9998 instants, near-bound ±23:59 fixed offset identifiers, Kathmandu, New York gap/overlap, Lord Howe's half-hour overlap, Apia's skipped date, and UTC four-digit year endpoints. The alarm product uses future minute instants; historical local-mean-time offsets with seconds are not an alarm scheduling target. Zone rule correctness remains supplied by each browser's IANA data, as with the existing clock display. Catalog/time-zone changes must recheck this bound.

References: [ECMA-402 formatToParts](https://tc39.es/ecma402/#sec-intl.datetimeformat-prototype.formattoparts), [IANA timezone theory](https://data.iana.org/time-zones/tzdb/theory.html). The bound is an explicit property of the supported catalog, not a universal guarantee about arbitrary future zone databases.

## Pure transitions

`dailyOccurrence` returns the first candidate for a civil date; gaps have no occurrence. `evaluateAlarms` evaluates `(previous, current]` and returns `due` entries plus `nextAlarms`. Daily evaluation visits dates in reverse calendar order with offset padding and returns at most one (latest) crossed occurrence per alarm. Calendar traversal uses UTC arithmetic, so browser-local DST cannot affect it. One-time due alarms are consumed; daily alarms remain. Inputs must be validated alarm configuration and finite ordered actual instants; a daily alarm requires a city-zone lookup.

### Reusable evaluation state

TASK-0008 should instantiate `createAlarmEvaluator()` once per runtime/session and retain it, calling its `evaluate(alarms, cityZones, previous, current)` method. It uses the same evaluation implementation as stateless `evaluateAlarms`, with an ephemeral FIFO cache of at most **128** daily occurrence resolutions. Keys encode `(IANA zone, civil date, HH:mm)`; undefined gap results are cached using key presence. City IDs and alarm objects are not occurrence identity inputs. Time edits and changed zone lookups select different keys; no result is tied to stale configuration objects. A new padded evaluation date resolves only missing keys. Eviction causes recomputation and cannot change output. Recreating the evaluator intentionally discards reuse. No state is persisted in Config V3, and no timer or application ticker integration is added.

For the ordinary short-interval padded date window, twelve alarms require at most 48 occurrence keys, fitting the bound. Once those keys are established, repeated evaluation performs cache lookups without native formatting scans. A crossed occurrence may stop traversal early; the next interval can require a previously unvisited older key once. Date rollover and edits also incur cold resolution for new keys. Workloads exceeding 128 distinct keys may cause repeated eviction and recomputation; the bound controls retained memory, not the maximum work of arbitrary intervals. Cold resolution remains synchronous and significant; the resolver is still exhaustive. Benchmark observations are evidence on the measured Node/Chromium environment, not a hardware-independent latency guarantee.

`openAlarmSession` returns expired one-time alarms as `stale` and removes them from its returned `nextAlarms`; occurrences at or before the session start cannot become retroactive due events. A future caller must initialize the session with this result and begin evaluation at the session boundary. No production startup orchestration is included here.

## Config V3

The exact document has `version: 3`, ordered unique `selectedCityIds`, `presentationMode`, `timeFormat`, and `alarms`. An alarm has exactly `cityId`, `recurrence`, and either `instant` (once) or `time` (daily). Alarm city IDs are selected and unique; extra/mixed fields are invalid. No separate alarm ID exists.

Loading exact V1/V2 migrates in memory, preserving order and available display preferences with empty alarms. Loading never writes. Ordinary mutations persist V3. Safe-integer future versions above 3 remain unsupported and the application's single persistence path protects their stored bytes. Malformed discriminators remain invalid. Read/access/write failure behavior remains graceful.

## Configuration UI

Each world-city card owns one small alarm editor. Set/Edit opens city-local date/time controls; Save validates against an actual instant read at submission. Daily input stays exact HH:mm regardless of the global clock display preference. One-time summaries format the persisted instant into the city's civil date/minute and also show UTC time to distinguish overlap occurrences. Editing replaces the city's alarm; Cancel does not write. Saving, removing, and city removal share the existing protected persistence path. City removal updates selected IDs and alarm collection together in a single write; re-add has no alarm.

Native date/time controls may visually use the browser's input locale (including AM/PM); their values and domain semantics remain canonical HH:mm. Error text is visible and linked to the inputs. Opening moves focus to recurrence; Save/Cancel/Remove alarm return focus to the Set/Edit control. No alarm editor appears on the browser-local top clock.
