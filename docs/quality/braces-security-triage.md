# braces security triage

Investigation and human approval date: 2026-10-03 (Europe/Warsaw). The human project risk owner explicitly approved the temporary acceptance below; implementation is tracked separately in [TASK-0013](../../tasks/done/TASK-0013.md).

## Scope and baseline

- Canonical local repository: `/home/gregor/repos/MiniJSClock`.
- Investigated `main`: `d3c3320bd184f58222568f946557bef957aa4854`, matching the existing local `origin/main` ref. No remote fetch was performed.
- Separate TASK-0012 branch: `codex/m021-pilot-a-source-repair`, head `0d9f57dedd87050bc5ca3e937b40e7684403f5e6`.
- Both commits have the identical `package-lock.json` Git blob: `81aeea4c19920541c1be3eb56866eead676f920d`. Their package manifests and security adapter also have no differences. TASK-0012 did not introduce this vulnerability.
- This investigation does not change TASK-0012, M-021, documentation profiles, source-repair content, dependencies, or verification policy.

## Finding and observed verification

Network-enabled `make security` on `main`, using OSV-Scanner 2.6.0 and Gitleaks 8.30.1, returned:

```text
PASS secrets: Gitleaks found no secrets in the working tree
271 packages scanned from package-lock.json
1 package affected by 1 vulnerability: 1 High
GHSA-vfj7-8cjw-p6xm | CVSS 8.7 | npm | braces (dev) | 3.0.3 | fixed version --
0 vulnerabilities can be fixed
FAIL dependencies
FAIL SECURITY
make: *** [Makefile:56: security] Error 1
```

The first sandboxed attempt failed to contact OSV; its zero-findings summary is not a successful scan. The network-enabled retry above establishes the finding.

[OSV](https://osv.dev/GHSA-vfj7-8cjw-p6xm) and the [GitHub-reviewed advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) identify `GHSA-vfj7-8cjw-p6xm` / `CVE-2026-93687`: uncontrolled recursion in brace AST walkers permits stack-exhaustion denial of service. A deeply nested pattern can fit below the character limit and throw an uncaught `RangeError`. Affected versions are `<=3.0.3`; no patched version is listed. Severity remains **High**, CVSS v4 **8.7** (v3 vector also supplied by OSV). Published 2026-09-18; reviewed/updated 2026-10-02.

This is distinct from [CVE-2024-4068](https://github.com/advisories/GHSA-grv7-fg5c-xmjg), whose fix was 3.0.3. That older fix does not remediate this finding.

## Complete introducing dependency chain

```text
MiniJSClock
  devDependency @vue/eslint-config-typescript@14.9.0
    fast-glob@3.3.3       (requested ^3.3.3)
      micromatch@4.0.8    (requested ^4.0.8)
        braces@3.0.3     (requested ^3.0.3)
          fill-range@7.1.1
```

Lockfile inspection and traversal from every direct dependency, resolving ancestor package locations, found exactly one introducing path to `node_modules/braces`. All four introducing packages are marked development dependencies. Classification: lint-time developer/CI tooling, including verification before deployment; not an application runtime, test-runner, or Vite bundle dependency through this chain.

## Execution and trust boundaries

`make lint` runs `npm run lint` / `eslint .`. `eslint.config.js` invokes `defineConfigWithVueTs` from the Vue TypeScript configuration with `vueTsConfigs.recommended`. Its configuration transformation eagerly groups Vue files. The pinned upstream implementation calls `fast-glob.sync(['**/*.vue'], ...)` with built-in ignores and global ignores obtained from the ESLint configuration.

Fast-glob processes search and ignore patterns with brace expansion enabled by default; its pattern utility calls `micromatch.braces(pattern, {expand: true, ...})`, which delegates to braces when the pattern contains braces. This is a real potential call to the vulnerable expansion walker, not a conclusion based solely on the `dev` flag.

Current search/ignore patterns are fixed, short repository configuration: `**/*.vue`, `**/node_modules/**`, `**/.git/**`, `**/dist/**`, and `**/coverage/**`. These contain no nested braces. Vue's global-ignore conversion resolves paths and uses fast-glob's path-to-pattern escaping. The `files` selector `**/*.{vue,ts,mts,tsx}` is not the search pattern passed to this fast-glob scan. Matched filenames are candidates matched against patterns, not patterns fed into brace expansion; Vue source contents are subsequently inspected for script language and are not brace patterns.

Consequently, the dependency and expansion route participate in tooling, but execution of the vulnerable deeply nested AST walker under the current configuration is not established. No browser input, localStorage configuration, city catalog content, HTTP request, or test data is passed into this path. Application imports do not reference these tooling packages. No production/runtime exposure to this advisory was found by graph and source inspection; a fresh bundle inspection was not possible here.

Developer/CI residual exposure: an untrusted contributor can propose changes to executable lint configuration or tooling that introduce malicious patterns; CI runs on pull requests as well as main pushes. Such input could abort a Node lint process and fail/delay verification. A developer invoking changed configuration or a new custom glob integration could face the same denial of service. Existing configuration already constitutes executable code, so configuration write access permits broader tooling disruption independently of this advisory. File contents or filenames alone do not establish this particular exploit route. The advisory supports availability loss, not a claim of code execution or confidentiality compromise.

Sources: [Vue configuration transformation](https://github.com/vuejs/eslint-config-typescript/blob/v14.9.0/src/utilities.ts), [Vue file grouping](https://github.com/vuejs/eslint-config-typescript/blob/v14.9.0/src/groupVueFiles.ts), [fast-glob task processing](https://github.com/mrmlnc/fast-glob/blob/3.3.3/src/managers/tasks.ts), [fast-glob defaults](https://github.com/mrmlnc/fast-glob/blob/3.3.3/src/settings.ts), [pattern expansion](https://github.com/mrmlnc/fast-glob/blob/3.3.3/src/utils/pattern.ts), [micromatch API implementation](https://github.com/micromatch/micromatch/blob/4.0.8/index.js), and [braces implementation](https://github.com/micromatch/braces/blob/3.0.3/index.js).

## Remediation options, in priority order

Current npm registry metadata was retrieved directly on the investigation date:

| Option | Evidence / outcome |
|---|---|
| Ordinary transitive updates | Latest [braces](https://registry.npmjs.org/braces) is 3.0.3; latest [micromatch](https://registry.npmjs.org/micromatch) is 4.0.8 and still requires braces `^3.0.3`; latest [fast-glob](https://registry.npmjs.org/fast-glob) is 3.3.3 and still requires micromatch `^4.0.8`. Already locked at these versions. |
| Compatible direct dependency update | Latest [Vue TypeScript ESLint configuration](https://registry.npmjs.org/@vue%2feslint-config-typescript) is 14.9.0 and still requires fast-glob `^3.3.3`. Already directly pinned to that version. No newer published compatible update removes this chain. |
| Official patched version/package | No patched release is identified by the advisory or registry. [Upstream PR #72](https://github.com/micromatch/braces/pull/72) proposes depth guards but remains open/unmerged. It is not a supported published package. |
| Other narrow upstream-supported mitigation | [Issue #70](https://github.com/micromatch/braces/issues/70) describes caller-side pattern length/depth restrictions pending a fix. This is a reporter's suggestion, not a released maintainer fix. MiniJSClock does not directly call braces, and the Vue wrapper exposes no brace-depth/length guard. Patching/replacing the lint configuration or dependency would need separate implementation and validation and would not automatically clear the lockfile advisory. |

No currently available patched compatible package/path was found. No override, downgrade, Git dependency, scanner disablement, or suppression was applied.

## Human risk-owner decision and temporary exception

**TEMPORARY EXPLICIT RISK ACCEPTANCE — approved 2026-10-03; expiry 2026-10-17.**

The user supplied explicit approval from the human project risk owner for this separate task:

> The owner accepts the project-specific risk of `GHSA-vfj7-8cjw-p6xm` through 2026-10-17 under the currently established exposure, with mandatory earlier re-evaluation if an upstream fix becomes available or the input/exposure path changes.

The approving human project risk owner is responsible for monitoring/re-evaluation and removal. No personal name was supplied. This is human acceptance, not an implementer waiver. The accepted scope is this advisory (`CVE-2026-93687` is its alias) in the root lockfile under the exposure documented above: fixed lint/glob configuration, no identified production/runtime input path, and residual developer/CI availability risk if malicious patterns reach the parser. No compatible patched release/path was available in the established 2026-10-03 evidence and baseline scan. Development-only classification does not mean absence of tooling exposure.

Re-evaluate immediately if:

- a compatible upstream fix or chain-removing update becomes available;
- the dependency path changes materially;
- untrusted input can reach vulnerable brace parsing, including a changed lint/glob input path;
- advisory facts materially change;
- an exploit or associated tooling crash is observed;
- the acceptance expires.

Review upstream status at least weekly during the acceptance period. Remove the exception when no longer justified, including supported remediation or invalidated exposure assumptions. Remediation is a separate task: validate the updated dependency graph and run the normal gates. Expiry does not remediate braces; it restores normal reporting and failure for an applicable finding. Do not extend acceptance without a new explicit human decision.

The root `osv-scanner.toml` uses OSV-Scanner 2.6.0's native `[[IgnoredVulns]]` mechanism with only `id = "GHSA-vfj7-8cjw-p6xm"`, `ignoreUntil = 2026-10-17`, and a reason referring to this report. Native aliases of the same vulnerability are included. No other advisory, package, dependency group, severity, or path is excluded. The general security command, Gitleaks, OSV scanning, and quality strategy are unchanged.

Sources: [current official configuration documentation](https://google.github.io/osv-scanner/configuration/) and [installed-version configuration/expiry implementation](https://github.com/google/osv-scanner/blob/v2.6.0/internal/config/config.go). The ignore applies only while its parsed expiry timestamp is later than scanner execution time. The date-only value is an expiry boundary at the start of 2026-10-17, not a promise to suppress through the end of that day; this conservative boundary does not extend the owner's approval.

## Implementation evidence and handoff

[TASK-0013](../../tasks/done/TASK-0013.md) records reproduced baseline/post-change scans, exact exception/expiry checks, verification limits, and the required fresh top-level independent-cloud-deep security review. The preceding investigation evidence retains its original environment limits. Final verification on the corrected pinned Linux Node `v24.21.0` / npm `11.19.0` workstation passed, as recorded in TASK-0013; the earlier environment blocker is resolved. No new runtime lint trace is claimed.

TASK-0012 remains separate and unchanged; M-021 `make docs` is not implemented. No dependency or application change is part of this acceptance. No push, merge, deployment, tag, or publication is authorized.

Harness retrospective: no harness learning. The scanner correctly detects the finding; the already documented network/toolchain limits do not justify new policy or weaker gates.

Fresh top-level independent-cloud-deep security review: **PASS** on 2026-10-03, with no blocking implementation findings; see TASK-0013 for review evidence and limits. Final verification passed on the corrected workstation; TASK-0013 is done. The reviewed exception and security-acceptance semantics remain unchanged.

Next handoff: the approving human risk owner monitors/re-evaluates the accepted risk under the triggers above; acceptance remains indexed in current-state until removed/remediated or expiry.
