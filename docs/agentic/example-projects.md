# Two example compositions

These examples show **when** the generic base becomes concrete. They are examples, not default architecture choices.

## Example A — small local Python web application

Assumptions derived from requirements:

- one controlled host;
- low/moderate concurrency;
- simple operations valued over horizontal scale;
- browser UI required;
- cloud availability/managed database not required.

A defensible composition could be:

- stack: Python/FastAPI + React/TypeScript;
- data: SQLite;
- deployment: local processes without containers;
- GitHub: source control + CI, even though runtime is local.

Sequence:

1. ChatGPT helps produce `problem.md` and requirements/NFRs.
2. Base repository is created and those artifacts are committed. Configure the ChatGPT Project from `docs/agentic/chatgpt-project.md` and connect authorized GitHub read access when available.
3. Architecture ADRs explicitly justify FastAPI/React, SQLite, and single-host non-container deployment.
4. Apply `profiles/stack/python-fastapi-react`, `profiles/data/sqlite`, and `profiles/deployment/local-processes`.
5. Codex bootstraps `backend/` and `frontend/`, pins Python/Node/package-manager versions, lockfiles and migration/test approach.
6. Implement Make adapters using `uv`, Ruff, chosen Python type checker, pytest, TypeScript/ESLint, frontend tests, and Playwright for critical flows.
7. Create a tiny API + UI smoke slice and make `make verify` green.
8. If hosted CI is useful, configure it to install the pinned toolchains and call `make ci`; otherwise keep the same gate local.
9. Add host deployment mechanics only as needed: service manager, static frontend/reverse proxy choice, secrets, SQLite file permissions, backup/restore, health/log location.
10. Decompose product features into task contracts and start normal implementation loops.

Important: the fact that SQLite and no containers are simpler is a consequence of these NFRs. If availability/concurrency/deployment constraints change, revisit the ADR instead of treating the profile as permanent dogma.

## Example B — internet-facing .NET application in managed cloud containers

Assumptions derived from requirements:

- multiple users and meaningful concurrent writes;
- internet-facing service;
- managed backup/availability requirements;
- separate staging/production environments;
- immutable deployment artifacts and controlled promotion desired.

A defensible composition could be:

- stack: ASP.NET Core on .NET 10 + React/TypeScript;
- data: PostgreSQL;
- deployment: container image to a managed cloud container service;
- local external dependencies: Docker Compose or Testcontainers as useful;
- optional hosted CI/CD (GitHub Actions is one possible runner).

Sequence:

1. ChatGPT and the user define requirements/NFRs before cloud/provider decisions.
2. Create the generic repository and commit approved intent. Configure the ChatGPT Project from `docs/agentic/chatgpt-project.md` and connect authorized GitHub read access when available.
3. Compare architecture/deployment alternatives and record ADRs for .NET 10/React, PostgreSQL, containerization, and the chosen cloud service.
4. Apply the corresponding stack/data/deployment profiles.
5. Codex pins .NET SDK (`global.json`), frontend Node/package manager, dependencies and lockfiles; creates backend/frontend/test layout.
6. Implement Make adapters around .NET format/analyzers/build/test, TypeScript/ESLint/frontend tests, integration tests against real PostgreSQL semantics, Playwright, security checks, and reproducible build.
7. Build a thin vertical smoke slice and make local `make verify` green.
8. If the project needs hosted CI, configure it to call `make ci`. Build the container only after the application skeleton and runtime contract are clear; keep the resulting artifact immutable.
9. Introduce IaC for the selected provider under `infra/`; provision staging early enough to test the real deployment path.
10. CI builds/tests/scans and publishes an image. CD deploys the exact digest to staging, runs smoke/acceptance/migration checks, then promotes the same digest to production after the required approval.
11. Feature development proceeds in task-sized loops with reviewer/security reviewer based on risk.

## Python cloud variant

The same PostgreSQL + managed-container deployment layers can be combined with the Python/FastAPI stack profile. This is why stack, data, and deployment concerns are separate overlays rather than separate monolithic templates.
