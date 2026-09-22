# Quality strategy

## Principle

Prefer objective feedback over agent self-assessment. A change is trusted because evidence exists, not because the implementing model says it is complete.

## Sensors / quality gates

| Signal | Command/tool | When required | Owner |
|---|---|---|---|
| Lint/static quality | `make lint` | every code change | automated |
| Type checks | `make typecheck` | typed projects | automated |
| Unit/component tests | `make test` | every behavior change | automated |
| Integration/E2E | `make test-integration` | affected flows | automated/agent |
| Security | `make security` | every code/dependency change | automated |
| Runtime smoke/manual check | stack-specific | user-visible/runtime change | agent/human |

## Testing policy

Tests should encode behavior and regression expectations. Do not optimize for raw coverage alone. For important business behavior, maintain explicit acceptance scenarios that are independent of the implementation.

## Minimal SSDLC baseline

Keep security deliberately simple and local-first:

- every task declares `Security impact: none | material` with a short rationale;
- `make security` runs local Gitleaks secret scanning and, when supported dependency manifests are present, OSV-Scanner vulnerability scanning;
- no paid/trial service is required;
- no mandatory DAST, SBOM, hosted code scanning, Dependabot, or GitHub-specific security product is part of the baseline;
- update the threat model and require a security-focused fresh independent review only when `Security impact: material`.

Stack-specific projects may add stronger controls when their threat model justifies them.

## Review policy

Implementation and formal independent review should be separate top-level sessions when the task requires review. Implementer-spawned reviewer subagents are useful inner-loop sensors but are advisory by default. Review evidence, tests, runtime behavior, architecture impact, and security impact—not only style.

## Quality ratchet

When an agent failure escapes a gate, improve the harness: add a test, static rule, checklist item, skill, task-template field, or observability signal so the same class of failure is cheaper to catch next time.
