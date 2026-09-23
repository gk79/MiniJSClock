# Learning candidate: validate-playwright-native-dependencies

- ID: LEARN-20260923-220250
- Status: candidate
- Date: 2026-09-23
- Related task/PR: TASK-0001
- Ownership: project-local
- Confidence: high

## Observation

`make bootstrap` restored the pinned Playwright package and Chromium binary successfully, but the first browser smoke could not launch Chromium because required Linux shared libraries were absent. The bootstrap adapter reported success even though the browser execution prerequisite was not usable.

## Evidence

- `make bootstrap` passed after `npm ci` and `npx playwright install chromium`.
- `make test-e2e` could not complete successfully.
- A bounded debug run reached the production preview with HTTP 200, then Chromium exited 127 with `error while loading shared libraries: libnspr4.so`.
- `npx playwright install-deps chromium --dry-run` reported 26 missing packages.
- `npx playwright install-deps chromium` failed because sudo required an interactive password unavailable to the executor.

## Root cause

The bootstrap adapter verified JavaScript dependencies and downloaded browser assets but did not launch the browser or otherwise validate its native runtime dependencies. The universal doctor check intentionally knew nothing about the selected application stack.

## Generalized lesson

When Playwright is an approved repository capability, bootstrap should not report complete until a minimal headless browser launch succeeds. System dependency installation may remain a documented human/CI-image responsibility, but missing libraries must fail early with actionable output before the full E2E suite.

## Proposed control

Add a small project-local Playwright launch preflight invoked by `make bootstrap` after browser installation. It should open and close a headless Chromium instance without external navigation and emit the official `npx playwright install-deps chromium` remediation on native-library failure. Keep the actual E2E test as the acceptance gate.

## False-positive / over-constraint risk

Browser launch adds a small cost to bootstrap and will intentionally fail in minimal containers that have not provisioned Playwright libraries. Limit the control to repositories that selected Playwright, and allow CI images to satisfy it through preinstalled packages rather than requiring runtime package-manager elevation.

## Review outcome

Needs review by a `harness_reviewer` or project maintainer; evidence is reproducible, but the exact preflight implementation should avoid coupling to Playwright cache paths or distro package names.

## Promotion

Not promoted in this task.
