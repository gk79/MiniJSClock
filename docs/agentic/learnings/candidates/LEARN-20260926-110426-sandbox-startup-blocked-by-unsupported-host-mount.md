# Learning candidate: Sandbox startup blocked by unsupported host mount

- ID: LEARN-20260926-110426
- Status: candidate
- Date: 2026-09-26
- Related task/PR: TASK-0010
- Ownership: external/tooling
- Confidence: high for the observed failure; underlying mount cause unverified

## Observation

The first default-sandbox shell command could not start. The required workflow read and subsequent repository commands succeeded through approved escalation execution.

## Evidence

`cat docs/AI_WORKFLOW.md` returned exit 1 before command execution:

> error building bubblewrap command: app-server socket directory has an unsupported host mount at /mnt/wslg/distro; remove the bind-mount alias or nested mount before starting the sandbox

The same read with `sandbox_permissions=require_escalated` succeeded. TASK-0010's canonical gates subsequently passed using that execution path.

## Root cause

The sandbox launcher reports a host-mount topology it cannot support. No mount inspection or host repair was performed; the repository harness cannot detect this because commands fail before its scripts start.

## Generalized lesson

Workstation sandbox startup is a prerequisite independent of repository health. A host-mount failure should be diagnosed by the runtime owner before repository work; successful escalated checks do not prove sandbox recovery.

## Proposed control

Route to the runtime/workstation owner for an executable sandbox startup preflight and supported mount configuration. Preserve the failure evidence. Do not weaken repository gates or automatically disable sandboxing.

## False-positive / over-constraint risk

Do not generalize this one mount error to other machines or require elevated execution by default. Mount changes may affect other WSL applications and need owner diagnosis.

## Review outcome

Pending human/runtime-owner review; no promotion proposed inside this repository.

## Promotion

None. Repository/global policy and host mounts were not modified.
