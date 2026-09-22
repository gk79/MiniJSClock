# Self-improving harness loop

The goal is not for agents to continuously rewrite their own rules. The goal is for recurring evidence to improve the project's controls in a governed way.

## Capture -> review -> promote

### 1. Capture

At the end of a non-trivial task/review, run the `harness-retrospective` skill. Create a candidate only when at least one of these happened:

- a failed/repeated implementation attempt exposed a reusable lesson;
- an independent reviewer caught a defect that existing automation should have caught;
- an important environment/tooling fact was undocumented;
- a recurring manual check can become automated;
- a new architecture/security invariant was discovered;
- an agent repeatedly wastes context/tokens because the same discovery must be repeated.

Create the candidate with:

```bash
make learn TITLE="short description"
```

Then fill in evidence, root cause, ownership, and proposed control.

### 2. Review

A fresh reviewer (human plus `harness_reviewer` when useful) evaluates:

- Is the lesson supported by evidence?
- Who owns the lesson: `project-local`, `Method`, `Lab`, or `external/tooling`?
- Would the proposed rule create false positives or over-constrain future work?
- Can the lesson be encoded deterministically instead of as prose?

### 3. Promote

Preferred promotion order:

1. regression/characterization test or architecture fitness test
2. schema/type constraint
3. formatter/linter/static rule
4. script/canonical command
5. CI quality gate
6. narrow reusable skill/workflow
7. `AGENTS.md` rule
8. prose documentation only

Executable controls are preferred because they provide machine-checkable feedback instead of relying on model obedience. Classify ownership before promotion: `project-local` lessons may be promoted within this project; hand `Method` lessons to Method/Lab governance and `Lab` lessons to Lab governance; preserve or route `external/tooling` evidence to its owner rather than treating it as project policy.

Move accepted candidates to `docs/agentic/learnings/accepted/`; rejected/obsolete ones to `rejected/` with a short reason. An experimental control that fails independent review remains a candidate or is rejected; implementation alone is not evidence of promotion readiness.

## Cross-project promotion

Do not immediately change the global starter from one project's incident. Route a `Method` candidate for central review; promote a lesson into the base template only when it is universal by construction or has repeated across multiple projects and remains valuable after review.

Keep a separate starter/template repository and version changes to it like normal code.

## Optional Codex hook

`.codex/hooks.json.example` contains an optional deterministic Stop hook. It checks whether a coding turn changed tracked/untracked project files while no active task file appears in the change set; if so, it asks Codex to perform the required handoff/retrospective before stopping.

Review and trust hooks explicitly before enabling them. The hook is intentionally a guard/reminder, not an autonomous rule generator.
