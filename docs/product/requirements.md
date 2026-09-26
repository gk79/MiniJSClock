# Requirements

## Functional requirements

Use stable IDs so tasks/tests can reference them.

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | The application shall display the user's current local time when opened. | Must | Opening the application shows a running local clock without requiring configuration. |
| FR-002 | The user shall be able to add clocks from a single searchable city combobox backed by a catalog containing approximately 400 major or widely recognized cities worldwide. Typing shall filter available cities live without requiring a separate search field and select control. | Must | One city-selection control accepts text input, filters unselected bundled cities case-insensitively by city-name/ASCII-name prefix (with country-code matching retained as a secondary discovery path), and selecting a matching result adds the corresponding clock. |
| FR-003 | The user shall be able to remove previously added city clocks. | Must | Removing a city clock immediately removes it from the dashboard and the removal persists after reload. |
| FR-004 | The application shall persist the selected city clocks and product configuration locally in the same browser profile across sessions. | Must | Reloading or reopening the application restores the previously saved configuration unless browser storage was cleared. |
| FR-005 | The user shall be able to choose one global clock presentation mode: digital or analog. | Must | Changing the presentation mode updates all displayed clocks consistently. |
| FR-006 | The user shall be able to choose one global time format: 12-hour or 24-hour. | Must | Changing the time format updates all displayed clocks consistently where applicable. |
| FR-007 | The user shall be able to configure an alarm for a displayed clock using that clock's local civil time. | Must | An alarm configured for a city is evaluated against that city's local time rather than the user's local time. |
| FR-008 | An alarm shall support one-time and daily recurrence modes. | Must | The user can select either one-time or daily recurrence and the alarm follows the selected behavior. |
| FR-009 | When a configured alarm becomes due while the application remains open and browser audio is permitted, the application shall emit an audible alarm. If background-tab throttling delays execution, the alarm shall be emitted at the next opportunity when the browser allows application code to run. | Must | Active-tab tests show prompt alarm delivery; background/resume tests show overdue alarms are detected from actual current time and emitted when execution resumes. |
| FR-010 | Alarm configuration shall be stored locally with the rest of the application configuration. | Must | Configured alarms remain present after an application reload in the same browser profile. |
| FR-011 | The selectable city catalog shall be bundled with the application as versioned repository data, with each entry mapped to an IANA time-zone identifier. | Must | The city picker works without a runtime city/time-zone API call, and every selectable city has a valid configured IANA time-zone identifier. |
| FR-012 | The bundled city catalog shall be generated from a documented GeoNames source snapshot and deterministic curation inputs, with provenance recorded in the repository. | Must | The repository records the source snapshot/version and curation inputs, and the catalog can be regenerated for review. |

## Non-functional requirements

| ID | Quality attribute | Requirement / SLO | How verified |
|---|---|---|---|
| NFR-001 | Visual quality | The primary clock experience shall use a polished modern-dashboard direction with clock cards/panels, clear information hierarchy, restrained visual styling, and coherent digital and analog variants suitable for comparing multiple clocks at a glance. The visual hierarchy shall make city, current time, and alarm state immediately recognizable; cards, typography, spacing, and controls shall be coherent; both clock modes shall feel like variants of one product; layouts shall remain visually coherent from one clock through several and roughly a dozen clocks; obvious default-browser styling, placeholder visuals, accidental spacing, clipping, and overflow are not acceptable; the desktop experience shall be polished while narrower layouts remain basically usable. | Representative viewport checks and human review of the running application, including explicit final approval by the product owner. |
| NFR-002 | Time correctness | Displayed city times and alarm interpretation shall follow the applicable civil time for the selected city, including daylight-saving or other offset changes represented by the selected IANA time-zone identifier. | Automated tests around representative time zones and offset-transition cases plus manual spot checks. |
| NFR-003 | Privacy | Application configuration shall remain local to the browser and shall not require transmission to a project-operated backend. | Architecture review and network-behavior verification. |
| NFR-004 | Reliability | Normal page reloads and browser restarts shall not lose configuration stored by the application, subject to the user clearing browser/site data. Alarm scheduling shall not assume browser timers run exactly on schedule: after delayed execution, the application shall compare actual current time against pending alarms. No maximum alarm latency is guaranteed while an open tab is backgrounded or throttled. | Automated persistence and alarm-scheduling tests plus manual active-tab and background/resume scenarios in supported browsers. |
| NFR-005 | Usability | Adding/removing city clocks, changing global display settings, and configuring alarms shall be possible through visible browser UI without editing configuration files or source code. City addition shall use one searchable combobox with live filtering and pointer/keyboard selection rather than separate search and select controls. | End-to-end acceptance scenarios including keyboard and pointer city selection. |
| NFR-006 | Maintainability | City/time-zone mapping and clock/alarm logic shall be structured so that maintained source data can be refreshed without redesigning product behavior. | Architecture/code review and reproducible catalog-generation checks. |
| NFR-007 | Browser compatibility | The first release shall target current stable Chrome, Edge, and Firefox on desktop/laptop. Safari is optional unless compatibility requires no material extra complexity. Mobile/tablet are not guaranteed support targets, but narrower layouts should remain basically usable. | Manual smoke checks in the supported desktop browsers plus representative narrow-viewport checks. |

## First-release alarm semantics

These semantics refine FR-007 through FR-010 and NFR-002/NFR-004/NFR-005 within the existing client-only product boundary.

### Alarm attachment

- Alarms are attached to selected world-city clocks.
- The first release supports zero or one configured alarm per selected city clock.
- The browser-local clock at the top of the dashboard does not receive an alarm in this slice.
- Removing a city clock removes its attached alarm atomically.
- Re-adding the city does not resurrect a previously removed alarm.

### Input precision

- Alarm configuration uses minute precision.
- Daily alarm input is city-local `HH:mm`.
- One-time alarm input is city-local calendar date plus `HH:mm`.

### One-time alarm resolution

A one-time alarm is configured from local civil date/time in the selected city's IANA zone and resolves to one concrete future instant.

- If the local civil minute does not exist because of a forward DST/offset transition, reject the configuration as invalid rather than silently shifting it.
- If the local civil minute is ambiguous because of a backward transition, select the earliest matching occurrence that is still strictly in the future at configuration time.
- If no matching occurrence is still in the future, reject it as past.
- Persist the resolved one-time instant rather than relying on ambiguous civil-time reinterpretation after reload.
- After it becomes due during an open application session, it is one-shot and must not recur.

### Daily alarm semantics

A daily alarm remains expressed as city-local `HH:mm`.

For each city-local calendar date:

- normal time: one scheduled occurrence;
- DST/offset gap: no occurrence that day;
- repeated/ambiguous civil time: use the first occurrence only;
- never emit two daily occurrences merely because a local hour repeats.

### Delayed execution / overdue semantics

The alarm domain must not assume timer callbacks happen on schedule.

Evaluation receives an actual previous evaluation instant and actual current instant.

- Detect whether a scheduled occurrence lies in the interval
  `(previousInstant, currentInstant]`.
- If browser throttling delays evaluation, an alarm whose occurrence lies in that interval is due at the next execution opportunity.
- If multiple daily occurrences were crossed during one long delayed interval, return at most one due event for that alarm during that evaluation; do not burst multiple notifications.
- Daily configuration remains after a due occurrence.
- A one-time configuration becomes consumed/removed after its due occurrence.

### Application-closed boundary

Alarm delivery is required only while the application remains open.

- Do not retroactively fire alarms for occurrences that happened before the current open application session.
- An expired one-time alarm discovered after reopening must be treated as expired/stale rather than fired retroactively.
- TASK-0008 will own runtime session initialization, ticking, browser throttling integration, and audible delivery.

## Data and privacy

The application intentionally stores only local product configuration such as selected city clocks, global display preferences, and alarm definitions. No personal account data or other personally identifiable information is required by the current scope.

The selectable city catalog is non-personal static application data versioned in the repository and bundled with the application. GeoNames is the source for candidate cities; the bundled subset is curated to approximately 400 major or widely recognized cities. IANA time-zone identifiers are used for time-zone mapping. Runtime city/time-zone lookup against an external service is not required.

The repository shall retain enough source provenance to identify the catalog input snapshot/version and curation inputs. Applicable source-data attribution and license obligations must be preserved in the distributed project.

There is no server-side retention or backup requirement. Clearing the browser's site data may remove the saved configuration; cross-device recovery is out of scope.

## Acceptance scenarios

1. **First launch:** The user opens MiniJSClock and immediately sees a running clock showing the browser user's current local time.
2. **World clocks persist:** The user types city-name prefixes into the single searchable city combobox, selects two supported cities from the live-filtered results, reloads the page, and both city clocks remain present with correct current local times.
3. **Global presentation settings:** The user switches between digital and analog presentation and between 12-hour and 24-hour formats; the selected global setting is reflected consistently across all clocks and persists after reload.
4. **Remove a city:** The user removes an added city clock; it disappears and remains absent after reload.
5. **One-time city alarm:** The user configures a one-time alarm on a selected city clock. When that city's local time reaches the configured value while the application remains open and browser audio is permitted, an audible alarm occurs and the one-time alarm does not repeat on the following day.
6. **Daily city alarm:** The user configures a daily alarm on a selected city clock. The alarm is evaluated against that city's local time and remains configured for future days.
7. **Background-throttled alarm:** The application remains open while its tab is backgrounded. If browser throttling delays scheduled execution past the alarm time, the application detects the overdue alarm from actual current time when execution resumes and emits it at the next available opportunity. No maximum background delay is asserted.
8. **Supported desktop browsers:** Core dashboard, city management, display settings, persistence, and alarm configuration are smoke-tested successfully in current stable Chrome, Edge, and Firefox on desktop/laptop.
9. **Offline city catalog behavior:** With runtime city/time-zone network lookup unavailable, the user can still browse/select the bundled city catalog and obtain the configured time zone for each supported city.
10. **Catalog provenance:** A reviewer can identify the GeoNames source snapshot/version and curation inputs used to build the bundled catalog and reproduce the generated catalog.
11. **Visual acceptance:** The running application is reviewed with one clock, several clocks, and roughly a dozen clocks in both digital and analog modes; the approved modern-dashboard criteria are satisfied and the product owner gives final visual approval.
