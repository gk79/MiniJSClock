# Requirements

## Functional requirements

Use stable IDs so tasks/tests can reference them.

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | The application shall display the user's current local time when opened. | Must | Opening the application shows a running local clock without requiring configuration. |
| FR-002 | The user shall be able to add clocks by selecting from a catalog containing several hundred major or widely recognized cities worldwide. | Must | A user can select a city from the catalog and a corresponding clock appears. |
| FR-003 | The user shall be able to remove previously added city clocks. | Must | Removing a city clock immediately removes it from the dashboard and the removal persists after reload. |
| FR-004 | The application shall persist the selected city clocks and product configuration locally in the same browser profile across sessions. | Must | Reloading or reopening the application restores the previously saved configuration unless browser storage was cleared. |
| FR-005 | The user shall be able to choose one global clock presentation mode: digital or analog. | Must | Changing the presentation mode updates all displayed clocks consistently. |
| FR-006 | The user shall be able to choose one global time format: 12-hour or 24-hour. | Must | Changing the time format updates all displayed clocks consistently where applicable. |
| FR-007 | The user shall be able to configure an alarm for a displayed clock using that clock's local civil time. | Must | An alarm configured for a city is evaluated against that city's local time rather than the user's local time. |
| FR-008 | An alarm shall support one-time and daily recurrence modes. | Must | The user can select either one-time or daily recurrence and the alarm follows the selected behavior. |
| FR-009 | When a configured alarm becomes due while the application remains open, the application shall emit an audible alarm. | Must | With the application open and audio permitted by the browser, a due alarm produces an audible signal. |
| FR-010 | Alarm configuration shall be stored locally with the rest of the application configuration. | Must | Configured alarms remain present after an application reload in the same browser profile. |

## Non-functional requirements

| ID | Quality attribute | Requirement / SLO | How verified |
|---|---|---|---|
| NFR-001 | Visual quality | The primary clock dashboard shall be intentionally designed, visually coherent, legible, and polished in both digital and analog modes rather than relying on default browser styling. | Human design review against approved visual references and representative viewport checks. |
| NFR-002 | Time correctness | Displayed city times and alarm interpretation shall follow the applicable civil time for the selected city, including daylight-saving or other offset changes represented by the chosen maintained time-zone data source. | Automated tests around representative time zones and offset-transition cases plus manual spot checks. |
| NFR-003 | Privacy | Application configuration shall remain local to the browser and shall not require transmission to a project-operated backend. | Architecture review and network-behavior verification. |
| NFR-004 | Reliability | Normal page reloads and browser restarts shall not lose configuration stored by the application, subject to the user clearing browser/site data. | Automated persistence tests and manual reopen/reload scenario. |
| NFR-005 | Usability | Adding/removing city clocks, changing global display settings, and configuring alarms shall be possible through visible browser UI without editing configuration files or source code. | End-to-end acceptance scenarios. |
| NFR-006 | Maintainability | City/time-zone mapping and clock/alarm logic shall be structured so that maintained time-zone data can be updated without redesigning the product behavior. | Architecture/code review and targeted tests. |

## Data and privacy

The application intentionally stores only local product configuration such as selected city clocks, global display preferences, and alarm definitions. No personal account data or other personally identifiable information is required by the current scope.

There is no server-side retention or backup requirement. Clearing the browser's site data may remove the saved configuration; cross-device recovery is out of scope.

## Acceptance scenarios

1. **First launch:** The user opens MiniJSClock and immediately sees a running clock showing the browser user's current local time.
2. **World clocks persist:** The user adds two supported cities, reloads the page, and both city clocks remain present with correct current local times.
3. **Global presentation settings:** The user switches between digital and analog presentation and between 12-hour and 24-hour formats; the selected global setting is reflected consistently across all clocks and persists after reload.
4. **Remove a city:** The user removes an added city clock; it disappears and remains absent after reload.
5. **One-time city alarm:** The user configures a one-time alarm on a selected city clock. When that city's local time reaches the configured value while the application remains open and browser audio is permitted, an audible alarm occurs and the one-time alarm does not repeat on the following day.
6. **Daily city alarm:** The user configures a daily alarm on a selected city clock. The alarm is evaluated against that city's local time and remains configured for future days.
