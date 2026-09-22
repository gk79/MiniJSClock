# Quality strategy

## Principle

Prefer objective feedback over agent self-assessment. A change is trusted because evidence exists, not because the implementing model says it is complete.

MiniJSClock has four quality-critical areas:
1. time-zone and alarm correctness;
2. browser-local persistence and recovery;
3. polished, coherent user-visible behavior across supported browsers;
4. reproducible build/release integrity.

## Sensors / quality gates

| Signal | Command/tool | When required | Owner |
|---|---|---|---|
| Lint/static quality | `make lint` | every code change | automated |
| Type checks | `make typecheck` | every TypeScript/Vue change | automated |
| Unit/component tests | `make test` | every behavior change | automated |
| Integration/E2E | `make test-integration` | user-visible flows, persistence, alarms, browser integration | automated/agent |
| Security | `make security` | every code/dependency/workflow change | automated |
| Build | `make build` or canonical equivalent behind `make verify` | every releasable change | automated |
| Full verification | `make verify` | before handoff/integration and release decisions | automated/agent |
| Runtime smoke/manual check | supported desktop browsers | user-visible/runtime change | agent/human |
| Visual acceptance | representative 1/several/~12 clock layouts in digital and analog modes | visual milestone/release | human product owner |

## Testing policy

Tests should encode behavior and regression expectations. Do not optimize for raw coverage alone.

### Pure/domain logic

Framework-independent TypeScript tests should cover:
- formatting current time for representative IANA time zones;
- DST/offset transition cases;
- one-time and daily alarm evaluation;
- overdue alarm detection after delayed execution;
- edge cases around day changes and city-local dates;
- persistence schema validation/default recovery;
- catalog validation and deterministic curation rules.

Prefer deterministic injected clocks/test instants over tests that depend on wall-clock timing.

### Vue/component tests

Use Vue Test Utils selectively for component behavior where mounting adds value:
- settings propagate to all clock cards;
- alarm/city controls expose the intended state;
- digital/analog variants use shared product semantics.

Do not move domain correctness into component tests when it can be verified more cheaply as pure TypeScript.

### Browser/E2E

Use Playwright for:
- first launch and local clock rendering;
- add/remove city and persistence after reload;
- global 12/24-hour and digital/analog settings;
- one-time/daily alarm configuration;
- browser-storage recovery scenarios;
- built app running under the GitHub Pages-style base path;
- supported-browser smoke coverage.

Background throttling and audio/autoplay behavior may require targeted manual/browser evidence because browsers control scheduling/audio policy. Record actual environment limits rather than manufacturing a PASS.

### Visual quality

Automated checks cannot replace the approved human visual gate. Before first meaningful release, review the running application with:
- one clock;
- several clocks;
- roughly a dozen clocks;
- digital and analog modes;
- representative desktop widths and a narrower viewport.

The product owner gives the final visual acceptance verdict.

## Minimal SSDLC baseline

Keep security deliberately simple and local-first:

- every task declares `Security impact: none | material` with a short rationale;
- `make security` runs local Gitleaks secret scanning and, when supported dependency manifests are present, OSV-Scanner vulnerability scanning;
- dependency/workflow changes receive explicit diff review;
- GitHub Actions are pinned to full reviewed commit SHAs;
- no paid/trial service is required;
- no mandatory DAST, SBOM, hosted code scanning, Dependabot, or GitHub-specific security product is part of the baseline;
- update the threat model and require a security-focused fresh independent review only when `Security impact: material`.

## Review policy

Implementation and formal independent review should be separate top-level sessions when the task requires review. Implementer-spawned reviewer subagents are useful inner-loop sensors but are advisory by default.

Review evidence, tests, runtime behavior, architecture impact, and security impact—not only style.

Bootstrap and deployment tasks should receive formal independent review because they establish the project harness and release path even if their runtime security impact remains limited.

## Quality ratchet

When an agent failure escapes a gate, improve the harness: add a test, static rule, checklist item, skill, task-template field, or observability signal so the same class of failure is cheaper to catch next time.
