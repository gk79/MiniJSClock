# TASK-0009 formal independent review

- Date: 2026-09-28
- Verdict: **PASS**; no blocking findings
- Review level: fresh top-level `independent-cloud-standard`
- Exact reviewed implementation: `6ab608d4d6c508b8de841691d606affba4e86902`
- Baseline `main`: `a9a2a5fc7abae7c69c8cbef66952e9af5ba6f66b`
- Pre-remediation head: `2d998f1402743fac4aff939e33353aa4a9d84da6`
- Review branch: `codex/task-0009-review`

## Provenance and deployment

Fetched `origin`, verified exact remote heads and a clean starting worktree, then created this local review branch from the exact implementation head. The baseline is the merge base; the implementation branch was not changed. Inspected the complete baseline-to-head diff and the bounded remediation diff. The only product-code change is the narrow settings CSS rule; the only test change is the focused settings E2E. Other changes are task, state, and acceptance evidence. Dependency manifests, lockfile, Config V3, workflow, permissions, deployment identity, and trust boundary are unchanged. There is no backend, service worker, or Notification API. Security impact remains `none`.

[Pages run #1](https://github.com/gk79/MiniJSClock/actions/runs/36405144795) is `workflow_dispatch` from `main` at the exact baseline SHA. GitHub's run record and step log show successful canonical `make ci`, verified artifact upload, and deployment from that artifact; the deploy log identifies the same Pages build SHA and reports success. The unchanged workflow restricts dispatch execution to `main`. This is first-deployment acceptance evidence, not a production-release verdict.

The task's hosted headless Chromium record is appropriately bounded to Pages/base-path/assets and reload, clock, cities, settings, persistence, alarm configuration, and controlled due-event behavior. It records no physical audio, stable Chrome/Edge/Firefox, real background throttling, or human visual approval. Screenshots `01`–`05`, `07`, and `08` depict the old deployed artifact. The corrected `06` depicts a local production build, and the README explicitly says that build has not been redeployed.

## Narrow-layout finding and correction

The original hosted 320px screenshot visibly showed two near arrow-only global settings selects despite no page overflow. A user could not read the selected values; classification as a release-blocking NFR-001 basic narrow usability defect is reasonable. The `max-width: 30rem` CSS rule stacks only `.clock-settings` and makes its native selects full width. It changes no product semantics or desktop layout. The corrected screenshot visibly reads “Analog” and “12-hour”; the fieldset, buttons, text, and four world-clock cards fit without visible horizontal clipping. Product-owner visual approval remains open.

The new 320px E2E asserts the exact viewport; fieldset and each select within viewport; select width at least 140px; selected option text; visible labels; both selects operable; and Digital/Analog presentation changes. The 140px floor rejects the original approximately 26px selects while allowing layout variation. It catches the escaped defect independently of any page overflow assertion and avoids pixel-perfect screenshot coupling.

Independent production-build Chromium probes found no breakpoint transition defect:

| Width | Settings columns | Select widths | Page overflow | Labels and settings operable |
|---|---|---|---|---|
| 320px | one | 172px each | none | yes |
| 479px | one | 331px each | none | yes |
| 480px | one | 332px each | none | yes |
| 481px | two | 188px each | none | yes |
| 1280px | two | 795px each | none | yes |

The probes were temporary and did not change tracked code.

## Independent verification

| Check | Result |
|---|---|
| Baseline-to-head `git diff --check`; `make harness-check` | PASS |
| Focused 320px Playwright E2E | 1 PASS |
| Complete `e2e/clock-settings.spec.ts` | 5 PASS |
| Focused App/config component tests | 46 PASS |
| `make test` | 139 PASS |
| `make test-e2e` | 21 PASS, matching expected count |
| `make test-integration` | PASS |
| `make security` | Gitleaks and OSV-Scanner PASS |
| `make verify` | Format, lint, types, tests, security, build PASS |
| Plain `make ci` | Full verify, integration, 21 E2E PASS |

The corrected screenshot SHA-256 is `bc255f409e6b7448379193ecd8f4faaec585835ebdabebf59f2427e88d6fd0e4`. The normal command/image sandbox failed before launch due to the known WSL `/mnt/wslg/distro` mount condition; authorized elevated commands were used. No verification gate was weakened.

Harness retrospective: **no new harness learning**. The escaped settings defect now has an executable E2E control; existing `LEARN-20260926-110426` covers the sandbox issue. No candidate or policy was changed.

TASK-0009 remains **in-progress**. Next handoff: human integration of the reviewed correction and hosted redeployment, followed by stable desktop Chrome, Edge, and Firefox acceptance; physical enable/test and due alarm sound; real active-tab and background/resume behavior; reload/stale and simultaneous-due scenarios; and product-owner final visual acceptance. The Pages run #1 artifact is still the old build. No production-release verdict is made.
