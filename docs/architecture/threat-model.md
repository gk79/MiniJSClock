# Threat model

## Scope and assets

MiniJSClock is a client-only static web application hosted on GitHub Pages. It has no authentication, backend, server-side database, privileged runtime action, or project-operated API.

Assets worth protecting:
- integrity of the application code, build output, dependency graph, and deployment workflow;
- integrity of the bundled city/time-zone catalog;
- integrity and availability of the user's browser-local configuration;
- privacy of the user's selected cities, display preferences, and alarms;
- correctness of clock and alarm behavior;
- release integrity of the GitHub Pages deployment.

The application does not intentionally process credentials, payment data, account data, or other sensitive personal records.

## Trust boundaries and actors

- **User/browser boundary** — one end user interacts with the application in a supported browser.
- **Browser storage boundary** — application configuration is stored in origin-local `localStorage`; the browser/user may clear, deny, or corrupt it.
- **Static application supply chain** — npm packages and build tooling are development/build dependencies whose integrity affects the generated static artifact.
- **GitHub repository/Actions boundary** — repository contents and GitHub Actions workflows determine what is built and deployed.
- **External source-data boundary** — GeoNames and IANA data are development-time inputs used to generate/validate the bundled city catalog; they are not runtime services.
- **Hosting boundary** — GitHub Pages serves the built static files.

## Main abuse cases / threats

| ID | Threat / abuse case | Impact | Mitigation | Verification |
|---|---|---|---|---|
| TM-001 | Malicious or compromised npm dependency/build tool changes generated application behavior. | Application integrity/privacy compromise. | Exact direct pins, committed lockfile, `npm ci`, dependency review, OSV-Scanner through `make security`, minimal dependency set. | Lockfile diff review; `make security`; clean build verification. |
| TM-002 | Compromised or movable GitHub Action reference executes unexpected CI/deploy code. | Build/release integrity compromise. | Pin third-party/GitHub-hosted actions to reviewed full commit SHAs; least workflow permissions. | Workflow review; harness/security checks. |
| TM-003 | Unverified or incorrect build is deployed to GitHub Pages. | User receives broken or altered release. | Manual human-controlled release from `main`; verification gates before Pages artifact upload/deploy; deploy only generated static artifact. | CI/release workflow evidence; human release verdict. |
| TM-004 | Corrupted, stale, or invalid browser-local configuration causes crashes or incorrect behavior. | Availability/correctness loss for the user. | Versioned typed persistence adapter; validate on load; recover to safe defaults; never execute stored content as code/HTML. | Unit tests for malformed/old storage data; runtime recovery scenario. |
| TM-005 | Untrusted text from catalog/configuration is inserted as raw HTML. | DOM XSS if malicious text enters static/generated data or storage. | Render user/data strings through normal Vue text bindings; prohibit unnecessary raw HTML injection; validate catalog generation. | Code review/static checks; tests around representative text. |
| TM-006 | Incorrect city-to-IANA mapping or time-zone handling causes wrong displayed/alarm time. | Functional integrity failure. | Versioned catalog provenance; IANA identifiers; deterministic tests around representative zones/DST transitions. | Catalog-generation checks; time-zone unit tests. |
| TM-007 | Browser timer throttling delays an alarm. | Delayed alert. | Do not trust timer punctuality; compare actual current time when code executes and trigger overdue alarms according to approved semantics. | Unit tests and background/resume browser scenarios. |
| TM-008 | Browser audio/autoplay policy prevents alarm sound. | Audible notification unavailable despite due alarm. | Explicitly handle audio readiness/user-interaction requirements; surface recoverable UI state rather than claim guaranteed audio delivery. | Supported-browser manual/E2E verification. |
| TM-009 | User/browser clears or blocks localStorage. | Configuration loss or inability to persist. | Treat browser storage as user-controlled; recover to defaults and report persistence limitation without data corruption. | Persistence failure tests/manual scenario. |
| TM-010 | External source-data update introduces malformed/unexpected catalog records. | Build failure or incorrect city data. | Development-time transformation/validation; deterministic curation; fail generation/build on invalid records. | Catalog schema/validation tests and provenance review. |

## Security-sensitive change triggers

Set `Security impact: material` when a task changes:
- GitHub Actions identities, workflow permissions, deployment mechanics, or release trust;
- dependency trust policy or introduces a consequential production/runtime dependency;
- handling of untrusted HTML, code execution, or external runtime input;
- storage of new sensitive/personal data classes;
- authentication/authorization, secrets, cryptography, or a new network/backend trust boundary.

For such changes, re-check this threat model and require a fresh security-focused independent review as defined by `docs/AI_WORKFLOW.md`.

Ordinary UI, clock-domain, deterministic catalog, and local-persistence changes that stay within these approved boundaries normally remain `Security impact: none`, with routine `make security` verification.
