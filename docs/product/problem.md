# Problem statement

## Problem / opportunity

MiniJSClock is a personal browser-based clock dashboard for one user. It should make it easy to see the current local time and compare it with the current civil time in selected cities around the world without relying on a cloud account or backend service.

The product should also provide a polished visual experience rather than behaving like a purely utilitarian time-zone converter. The user should be able to keep a preferred set of city clocks, switch the presentation style globally, and attach alarms to individual clocks.

## Users / stakeholders

- Primary users: the repository owner / single end user.
- Secondary users: none planned.
- Operators/administrators: none planned; the application is intended to run directly in the user's browser.
- Business/system owners: the same single user.

## Desired outcomes

- The user can open the application and immediately read the current local time.
- The user can maintain a personally useful set of world-city clocks and compare times at a glance.
- The interface is visually polished and remains clear in both digital and analog clock modes.
- The user's selected cities, display preferences, and alarm configuration persist between browser sessions on the same browser profile.
- The user can rely on an audible alarm for a selected clock while the application remains open.

## Constraints

- The application is for a single user and does not require accounts, authentication, or multi-user features.
- Configuration is stored only in the local browser; cloud synchronization is not required.
- No backend service is currently required by the product scope.
- The primary support target is desktop/laptop browsers.
- The first release shall support current stable Chrome, Edge, and Firefox versions.
- Safari support is optional unless it can be achieved without material additional complexity.
- Mobile/tablet are not guaranteed support targets for the first release, but the UI should not become unusable at narrower widths.
- The first-release visual direction is a modern dashboard: clock cards/panels, clear information hierarchy, and a polished application-like presentation optimized for reading multiple clocks at a glance.
- The city picker should cover approximately 400 major or widely recognized cities worldwide.
- The selectable city catalog shall be static application data versioned in the repository rather than fetched from an external city/time-zone service at runtime.
- GeoNames shall be the source dataset for candidate cities, with a documented curation rule producing the bundled catalog.
- IANA time-zone identifiers shall be used for the city-to-time-zone mapping and civil-time calculation.
- The source snapshot/version and curation inputs used to produce the bundled catalog shall be recorded so the catalog can be regenerated and reviewed.
- Display mode (digital or analog) and 12-hour / 24-hour format are global settings shared by all clocks.
- Alarms are interpreted in the local civil time of the selected clock's city.
- Alarms may be one-time or daily.
- Alarm delivery is required only while the application remains open in the browser.

## Out of scope

- Multi-user accounts or sharing.
- Cloud synchronization across devices or browser profiles.
- Server-side persistence.
- Runtime dependence on an external city/time-zone lookup API.
- Exhaustive coverage of every city or settlement in the source dataset.
- Guaranteed alarm delivery after the application or browser has been closed.
- Guaranteed first-release parity on mobile/tablet or Safari.
- General calendar, stopwatch, countdown timer, or scheduling functionality unless added by a later requirement.

## Open questions

- [ ] Which concrete visual review criteria will define "polished" for the approved modern-dashboard direction?
- [ ] What level of alarm timing tolerance is realistic and acceptable when the application is open but the tab is backgrounded or throttled by the browser?
