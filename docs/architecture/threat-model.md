# Threat model

## Scope and assets

List valuable assets: credentials, personal data, business data, money, privileged actions, availability, integrity.

## Trust boundaries and actors

Identify users, admins, external services, unauthenticated callers, CI/CD, runtime identities, data stores.

## Main abuse cases / threats

| ID | Threat / abuse case | Impact | Mitigation | Verification |
|---|---|---|---|---|
| TM-001 | ... | ... | ... | ... |

For material security or destructive behavior, classify each safety property as an application-enforceable control, a guarantee delegated to an external platform/provider and supported by its authoritative contract, or residual platform/environment risk requiring explicit human acceptance. Record the responsible boundary and evidence. Residual-risk classification must not replace a control the application can reasonably enforce. An implementer cannot self-accept residual risk or self-relax an unmet application requirement; stop for a human scope/risk decision when a required external absolute guarantee is unavailable.

## Security-sensitive change triggers

Set `Security impact: material` when a task changes authentication/authorization, secrets, sensitive/personal data handling, trust/network boundaries, dependency trust, database permissions, untrusted file/input parsing, code execution, cryptography, CI/CD identities, or production infrastructure. Re-check this threat model and make the formal fresh-session review explicitly security-focused. Ordinary tasks with no such impact remain `Security impact: none`.
