# Alarm configuration domain

TASK-0007 implements configuration and pure evaluation only. The application display ticker does not call the alarm domain. Runtime session initialization, due transitions, persistence of consumed alarms, and sound belong to TASK-0008.

## Civil minute resolution

`src/alarms.ts` interprets Gregorian `YYYY-MM-DD` and exact `HH:mm`, independently of the browser-local zone. Inputs use four-digit years 0001 through 9999; native Date round trips reject impossible dates. Persisted instants are exact valid `YYYY-MM-DDTHH:mm:00.000Z`, also round-trip checked. Configuration selects the earliest candidate strictly after the supplied actual configuration instant.

The resolver enumerates all 2,881 canonical UTC minute instants within ±24 hours of the civil components encoded as UTC, inclusive. Each candidate is validated against native Intl Gregorian/Latin-number/h23 year, month, day, hour, minute, second and era components in the requested IANA zone. Results are ordered actual instants: zero candidates is a gap, one is ordinary, and multiple is an overlap. It never parses civil input as browser-local time or assumes a one-hour transition.

The bound covers the bundled catalog's civil offsets, including date-line zones. Since permitted occurrences have second/millisecond zero, every candidate under that offset bound lies on the enumerated grid; the resolver cannot miss one because a transition has an unexpected size or timing. Deterministic tests exercise every bundled zone in winter/summer at 2026 and 9998 instants, near-bound ±23:59 fixed offset identifiers, Kathmandu, New York gap/overlap, Lord Howe's half-hour overlap, Apia's skipped date, and UTC four-digit year endpoints. The alarm product uses future minute instants; historical local-mean-time offsets with seconds are not an alarm scheduling target. Zone rule correctness remains supplied by each browser's IANA data, as with the existing clock display. Catalog/time-zone changes must recheck this bound.

References: [ECMA-402 formatToParts](https://tc39.es/ecma402/#sec-intl.datetimeformat-prototype.formattoparts), [IANA timezone theory](https://data.iana.org/time-zones/tzdb/theory.html). The bound is an explicit property of the supported catalog, not a universal guarantee about arbitrary future zone databases.

## Pure transitions

`dailyOccurrence` returns the first candidate for a civil date; gaps have no occurrence. `evaluateAlarms` evaluates `(previous, current]` and returns `due` entries plus `nextAlarms`. Daily evaluation visits dates in reverse calendar order with offset padding and returns at most one (latest) crossed occurrence per alarm. Calendar traversal uses UTC arithmetic, so browser-local DST cannot affect it. One-time due alarms are consumed; daily alarms remain. Inputs must be validated alarm configuration and finite ordered actual instants; a daily alarm requires a city-zone lookup.

`openAlarmSession` returns expired one-time alarms as `stale` and removes them from its returned `nextAlarms`; occurrences at or before the session start cannot become retroactive due events. A future caller must initialize the session with this result and begin evaluation at the session boundary. No production startup orchestration is included here.

## Config V3

The exact document has `version: 3`, ordered unique `selectedCityIds`, `presentationMode`, `timeFormat`, and `alarms`. An alarm has exactly `cityId`, `recurrence`, and either `instant` (once) or `time` (daily). Alarm city IDs are selected and unique; extra/mixed fields are invalid. No separate alarm ID exists.

Loading exact V1/V2 migrates in memory, preserving order and available display preferences with empty alarms. Loading never writes. Ordinary mutations persist V3. Safe-integer future versions above 3 remain unsupported and the application's single persistence path protects their stored bytes. Malformed discriminators remain invalid. Read/access/write failure behavior remains graceful.

## Configuration UI

Each world-city card owns one small alarm editor. Set/Edit opens city-local date/time controls; Save validates against an actual instant read at submission. Daily input stays exact HH:mm regardless of the global clock display preference. One-time summaries format the persisted instant into the city's civil date/minute and also show UTC time to distinguish overlap occurrences. Editing replaces the city's alarm; Cancel does not write. Saving, removing, and city removal share the existing protected persistence path. City removal updates selected IDs and alarm collection together in a single write; re-add has no alarm.

Native date/time controls may visually use the browser's input locale (including AM/PM); their values and domain semantics remain canonical HH:mm. Error text is visible and linked to the inputs. Opening moves focus to recurrence; Save/Cancel/Remove alarm return focus to the Set/Edit control. No alarm editor appears on the browser-local top clock.
