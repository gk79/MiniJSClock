# Learning candidate: <title>

- ID: LEARN-<timestamp>
- Status: candidate
- Date:
- Related task/PR:
- Ownership: project-local | Method | Lab | external/tooling
- Confidence: low | medium | high

## Observation

What happened? State facts, not a generalized rule yet.

## Evidence

Commands, failing tests, reviewer finding, incident, repeated attempts, files/symbols, or other reproducible evidence.

## Root cause

Why was the existing harness unable to prevent/detect this earlier?

## Generalized lesson

What should be true next time, and under what conditions? Include important exceptions.

## Proposed control

Prefer the narrowest executable control: test -> type/schema -> linter/static check -> script -> CI gate -> skill -> AGENTS rule -> prose.

## False-positive / over-constraint risk

What legitimate future work could this rule break or make unnecessarily expensive?

## Review outcome

Accepted / rejected / needs-more-evidence; reviewer and rationale.

## Promotion

Files/checks changed when accepted, plus verification that the new control catches the original failure without breaking valid behavior.
