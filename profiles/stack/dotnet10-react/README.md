# Profile: .NET 10 + React

Use when requirements fit an ASP.NET Core backend and browser SPA/frontend.

## Pinning and package management

- Pin .NET SDK with `global.json`.
- Use the normal `.csproj`/solution package graph and locked/controlled NuGet restore policy appropriate to the project.
- Use a committed frontend lockfile and an explicit Node/package-manager version.
- Prefer one frontend package manager; `pnpm` is a good default when there is no contrary constraint.

## Typical quality tools

Backend:

- `dotnet format --verify-no-changes` or project analyzers for formatting/style
- compiler/analyzers with warnings policy
- `dotnet test` for unit/integration tests
- architecture/fitness tests where boundaries matter

Frontend:

- TypeScript compiler
- ESLint
- framework/unit tests (for example Vitest where selected)
- Playwright for critical browser flows

## Canonical command mapping

Implement `scripts/commands/*.sh` so agents continue to call the stable Make interface. A common mapping is:

- bootstrap -> `dotnet restore` + frontend frozen/locked install
- format-check -> .NET format verification + frontend formatter check if used
- lint -> .NET analyzers/build warnings policy + ESLint
- typecheck -> `dotnet build --no-restore` + TypeScript no-emit check
- test -> backend unit tests + frontend unit tests
- test-integration -> ASP.NET integration tests; use the actual database engine when behavior depends on it
- test-e2e -> start app stack + Playwright
- security -> secret/dependency/SAST checks selected for the project
- build -> reproducible backend publish/build + frontend production build
- run -> project-specific dev launcher

## Typical repo shape

```text
src/
  Backend/
  Frontend/
tests/
  Backend.Unit/
  Backend.Integration/
  e2e/
```

Do not force this shape if a simpler or established solution layout is clearer.
