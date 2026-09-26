# Learning candidate: Distinguish malformed schema versions from unsupported documents

- ID: LEARN-20260926-120747
- Status: candidate
- Date: 2026-09-26
- Related task/PR: TASK-0006 formal review R1
- Ownership: project-local
- Confidence: high

## Observation and evidence

Fresh top-level review of `899a7976cc525b7a1a725f562bf1017fd6435a76` found string `"2"` and null version fields classified as unsupported by `src/config.ts:72`. Independent parser and Chromium reproductions returned defaults/unsupported warning, preserved malformed bytes after settings changes, and reset preferences on reload. All 14 unit/component tests and plain `make ci` passed; the unsupported-version test explicitly expects this wrong-type classification. The task requires exact wrong-type rejection and established invalid recovery.

## Root cause

Unsupported discrimination occurs before validation of the version field's type/domain. Test expectations copied this branch's semantics rather than the recovery contract, allowing an indefinite no-save state for malformed data.

## Generalized lesson

A versioned persistence boundary must distinguish a valid but unsupported schema discriminator from a malformed discriminator. Safe defaults alone do not prove recovery; warning and next-write behavior matter.

## Proposed control

In bounded TASK-0006 remediation, add contract-derived table cases for malformed version types, parser status/defaults, and ordinary user-change persistence after reload. Retain separate legitimate numeric-future non-overwrite tests for all mutation paths. No global policy change is needed.

## False-positive / over-constraint risk

Do not infer how every historical or numeric unknown schema should be migrated. Define the valid discriminator domain explicitly and preserve legitimate unsupported documents; never coerce `"2"` into supported V2.

## Review outcome and promotion

Pending project reviewer/human review. Candidate captured only; no tests, policy, CI, or global skills changed by this review.
