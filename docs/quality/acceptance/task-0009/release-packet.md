# TASK-0009 release-readiness packet

- Date: 2026-09-28
- Task: [TASK-0009](../../../../tasks/done/TASK-0009.md), done
- Product acceptance: **PASS**, reported by the product owner for the Pages run #2 hosted artifact
- Production release verdict: **RELEASE APPROVED**

## Deployed artifact

| Item | Exact evidence |
|---|---|
| Product source SHA | `6a34009893cc4f54909a62a66358852fe5ea378a` |
| URL | https://gk79.github.io/MiniJSClock/ |
| Hosted CI | [Run #34](https://github.com/gk79/MiniJSClock/actions/runs/36408376619), ID `36408376619`, success for the exact source SHA |
| GitHub Pages | [Run #2](https://github.com/gk79/MiniJSClock/actions/runs/36408609604), ID `36408609604`, success for the same SHA; verified artifact uploaded and deployed |

The reviewed TASK-0009 implementation is `6ab608d4d6c508b8de841691d606affba4e86902`; the complete reviewed branch was integrated by fast-forward. No product code changed after that integration. The corrected hosted 320px layout and screenshot provenance are recorded in the [acceptance evidence](README.md).

## Automated and formal evidence

- Fresh top-level [independent-cloud-standard review](../../reviews/task-0009-review.md): **PASS**, no blocking findings.
- Hosted CI #34 canonical `make ci`: **PASS**, including 139 unit/component tests, 21 Chromium E2E tests with the focused 320px regression, integration, security, and verify/build.
- Pages run #2 canonical `make ci`: **PASS** with the same test counts and checks; verified artifact upload and deploy **PASS**.
- Hosted corrected 320px check: document and hashed JS/CSS HTTP 200, reload success, readable 172px settings selects, Digital/Analog and 12h/24h changes, no horizontal overflow, and no observed browser console/page/network failures.

## Human acceptance

The product owner explicitly reported “everything passed OK - PASS” for the remaining acceptance gates on the Pages run #2 hosted artifact. This report covers:

| Gate | Result and source |
|---|---|
| Stable desktop Chrome, Edge, Firefox | PASS, product-owner report |
| Dashboard, city, settings, persistence, alarm configuration | PASS, product-owner report |
| Physical enable/test cue and physical due-alarm cue | PASS, product-owner report |
| Real active-tab due delivery and real background/resume overdue handling | PASS, product-owner report |
| Reload/stale once and simultaneous-due behavior | PASS, product-owner report |
| Console/network sanity | PASS, product-owner report |
| Final product-owner visual acceptance | PASS, product-owner report |

This closeout session did not independently repeat the manual observations. Current local Windows host metadata was recovered using ordinary host commands: Windows 11 Home `10.0.26200` (build `26200`), Chrome executable `153.0.8010.54`, and Edge executable `154.0.4258.37`. No Firefox installation or exact version was found on this closeout host. The acceptance-time browser versions and OS could not be independently recovered or tied to this host; the current Chrome/Edge readings are **not** presented as acceptance-time versions. The human behavioral PASS remains recorded.

## Product boundaries and remaining limitations

Config remains V3. The product is client-only, with no backend, service worker, Notification API, or new production dependency. It makes no closed-app alarm delivery or maximum background latency guarantee. No unresolved release-blocking product defect is known. Exact Firefox version and acceptance-time browser/OS metadata remain unavailable; this is an evidence limitation, not an open behavioral acceptance gate.

## Release decision

**Production release verdict: RELEASE APPROVED.** The product owner explicitly issued `RELEASE APPROVED` for the Pages run #2 artifact from product SHA `6a34009893cc4f54909a62a66358852fe5ea378a`. No additional deployment was required for this verdict. Repository documentation commits after that deployed product SHA did not change product code. The known boundaries remain: no closed-app alarm guarantee, no maximum background latency guarantee, and exact Firefox version plus acceptance-time browser/OS metadata were not recovered. These documented limitations are not release blockers after the explicit human approval.
