# Learning candidate: Validate alarm evaluation cost before runtime handoff

- ID: LEARN-20260926-193427
- Status: candidate
- Date: 2026-09-26
- Related task/PR: TASK-0007 formal independent review, R1
- Ownership: project-local
- Confidence: high

## Observation

Correctness tests and all canonical gates passed while ordinary daily evaluation repeatedly performed extensive synchronous Intl work. Twelve selectable-city daily alarms over a one-second interval required 100,835 formatToParts calls and approximately 220 ms in isolated desktop Chromium. Four alarms required approximately 69 ms. The domain was handed off as ready for runtime integration without a reusable computation path.

## Evidence

[Formal review](../../../quality/reviews/task-0007-review.md), portable `task-0007-cost.mjs` and retained measured output. Exact implementation: `b92bb9672a172adbda140c700eb6c8c36df178c8`. Independent Node/Chromium measurements reproduced the work count and approximate cost. No audio/ticker integration was added to obtain evidence.

## Root cause

Domain tests verify due outcomes, DST and persistence, but have no sensor for work repeated between adjacent evaluations. A multi-second catalog-wide test timeout measures a different use pattern and cannot establish main-thread runtime readiness.

## Generalized lesson

For this product's synchronous alarm API, verify repeated normal evaluation with several and roughly a dozen configured daily alarms before runtime handoff. A correct algorithm used occasionally for Save can still be unsuitable for frequent due evaluation. Long-delay coalescing must remain correct; slower polling must not be used to hide recurrent pauses.

## Proposed control

After bounded remediation, add a focused deterministic work-count characterization for repeated adjacent intervals with unchanged daily alarms and a documented small browser benchmark. Set the appropriate work bound from the approved final implementation, rather than an arbitrary wall-time threshold. Cover cache invalidation/rollover/DST as appropriate. Keep measurement outside audio/background orchestration. Recommend human project-owner review before promotion.

## False-positive / over-constraint risk

Absolute timing varies across browsers/hardware, and cold preparation may legitimately cost more than reuse. A universal formatter-call cap could reject sound future algorithms or encourage incorrect offset assumptions. Scope the sensor to repeated ordinary evaluation and retain correctness tests; do not turn this observation into a global performance policy.

## Review outcome

Pending human/project review. Captured only; no harness subagent verdict or policy promotion.

## Promotion

None. Existing candidates, AGENTS, CI and security policy remain unchanged.
