# Learning candidate: validate-approved-toolchain-peer-compatibility

- ID: LEARN-20260923-211940
- Status: candidate
- Date: 2026-09-23
- Related task/PR: TASK-0001
- Ownership: Method
- Confidence: high

## Observation

An architecture review approved exact, individually available frontend tool pins one day before bootstrap. During materialization, the approved TypeScript 7.0.2 pin proved incompatible with both the approved Vue lint configuration and Vue type checker, blocking the canonical verification contract before application implementation.

## Evidence

- `npm ci --ignore-scripts` completed but emitted peer conflicts: current TypeScript-ESLint packages declare TypeScript `>=4.8.4 <6.1.0`.
- `npm run lint` aborted with `typescript-eslint does not support TS 7.0` through `@vue/eslint-config-typescript@14.9.0`.
- `npm run type-check` crashed in `vue-tsc@3.3.11` because TypeScript 7.0.2 does not export the `./lib/tsc` package subpath.
- The exact direct pins and failure evidence are recorded in `tasks/active/TASK-0001.md`.

## Root cause

The architecture compatibility review verified package availability and documented peer relationships at the direct-package level, but it did not execute a disposable exact-pin installation followed by the selected lint and Vue type-check commands. Registry availability and broad top-level peer declarations did not prove end-to-end compatibility with transitive TypeScript tooling.

## Generalized lesson

When a bootstrap architecture selects an ecosystem-leading compiler or runtime major together with framework-specific lint/type-check adapters, task readiness should require an executable compatibility preflight of the exact proposed pins. This is most valuable for new compiler/runtime majors and can be skipped for an already materialized lockfile that has current passing canonical evidence.

## Proposed control

Add a disposable exact-pin bootstrap preflight to the architecture/toolchain selection workflow: generate or create the minimal package manifest, perform a clean lockfile restore, and execute the intended lint, type-check, test, and build entry points before marking the version set approved. Preserve the resulting command evidence in the architecture decision or bootstrap task. Review this as a Method-level workflow change rather than silently modifying this project's policies.

## False-positive / over-constraint risk

Running full preflight commands for every mature patch update would add unnecessary planning cost and may require platform-specific binaries. Limit the control to initial bootstrap, major compiler/runtime transitions, or version sets without an existing verified lockfile; allow clearly recorded environment limitations rather than manufacturing compatibility evidence.

## Review outcome

Needs review by the Method owner, with `harness_reviewer` advisory review if useful. One directly reproduced bootstrap blocker supports capture, but promotion scope and the narrow trigger need independent evaluation.

## Promotion

Files/checks changed when accepted, plus verification that the new control catches the original failure without breaking valid behavior.
