# Operations runbook

## Service overview

What runs, where, and who owns it?

## Health and observability

- Logs:
- Metrics:
- Traces:
- Dashboards:
- Alerts:
- SLOs/SLIs:

## Common incidents

| Symptom | First checks | Safe action | Escalation |
|---|---|---|---|
| ... | ... | ... | ... |

## Backup and restore

Define backup frequency, retention, restore procedure, and restore-test cadence.

## Deployment failure

Define how to stop, roll back/forward, validate recovery, and preserve evidence.


## Security vulnerability response

For a discovered vulnerability: triage impact/exploitability -> create a bounded security task -> fix with regression/security evidence -> run `make security` and `make verify` -> perform fresh security-focused independent review when material -> release/verify -> update the threat model or learning loop only when the lesson generalizes.
