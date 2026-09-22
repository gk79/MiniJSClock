# Profile: Python/FastAPI + React

Use when requirements fit a Python API/backend plus browser frontend.

## Pinning and package management

- Pin the supported Python version in project metadata/tooling.
- Prefer `uv` for environment/dependency management when there is no project constraint requiring another tool.
- Keep a reproducible lockfile.
- Pin Node/package-manager version and commit the frontend lockfile.
- Prefer one frontend package manager; `pnpm` is a good default when there is no contrary constraint.

## Typical quality tools

Backend:

- Ruff formatting/linting
- a static type checker selected explicitly (for example Pyright or mypy)
- pytest
- FastAPI/http integration tests

Frontend:

- TypeScript compiler
- ESLint
- unit/component tests
- Playwright for critical browser flows

## Canonical command mapping

A common mapping:

- bootstrap -> `uv sync --frozen` + frontend frozen/locked install
- format-check -> `ruff format --check` + frontend formatter check if selected
- lint -> `ruff check` + ESLint
- typecheck -> Python type checker + TypeScript no-emit check
- test -> pytest unit suite + frontend unit suite
- test-integration -> backend integration tests against real dependencies where behavior differs
- test-e2e -> start stack + Playwright
- security -> secret/dependency/SAST checks selected for the project
- build -> package/image/frontend production build as applicable
- run -> project-specific dev launcher

## Typical repo shape

```text
backend/
frontend/
tests/
  integration/
  e2e/
```

Do not introduce abstractions/layers until the domain or architecture actually needs them.
