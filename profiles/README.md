# Technology profiles

Profiles are decision aids and implementation recipes, not automatically active configuration.

Select them only after requirements/architecture decisions are recorded. Compose one stack profile, one data profile, and one deployment profile when they fit.

Examples included:

- `stack/dotnet10-react`
- `stack/python-fastapi-react`
- `data/sqlite`
- `data/postgresql`
- `deployment/local-processes`
- `deployment/docker-compose`
- `deployment/cloud-containers`

When a profile is chosen, copy/adapt its decisions into the project's real configuration and documentation; do not leave the profile README as the only place the project knows how it works.

## Extending profiles

The included profiles are examples, not an exhaustive catalog. For another architecture (for example Go CLI, Java service, desktop app, data pipeline, mobile backend, or LLM/agent service), add or adapt only the profile dimensions that are relevant. Preserve the Layer 1 contracts: `AGENTS.md`, `docs/AI_WORKFLOW.md`, task schema, canonical Make interface, evidence/review model, CI entry point, and learning loop.

A project does not need a database or browser/deployment profile merely to satisfy the template. Mark non-applicable canonical checks explicitly as described in the root `README.md` rather than forcing irrelevant technology into the design.

## Human-readable command output

When implementing profile adapters, source `scripts/lib/output.sh` and emit explicit `PASS`, `WARN`, `N/A`, or `FAIL` labels. Color is optional presentation; exit codes remain authoritative. Respect `NO_COLOR` and avoid raw ANSI sequences in redirected logs.
