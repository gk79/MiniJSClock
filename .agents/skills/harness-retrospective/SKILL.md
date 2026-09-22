---
name: harness-retrospective
description: After non-trivial implementation/review/incident work, decide whether evidence justifies a reusable harness improvement; create a structured learning candidate without silently changing project/global policy.
---

Read `docs/agentic/learning-loop.md`.

1. Review failures/retries, reviewer findings, unexpected environment/tool facts, repeated discovery work, and manual checks from the task.
2. If no reusable lesson meets the capture criteria, explicitly record "no harness learning" in the task/handoff and stop.
3. If a lesson qualifies, run `make learn TITLE="..."` and fill the generated candidate with factual evidence, root cause, ownership, generalized lesson, proposed control, and false-positive risk.
4. Classify ownership before promotion: `project-local` may be promoted locally; hand `Method` or `Lab` lessons to the respective governance surface; preserve or route `external/tooling` evidence externally. Do not copy non-project lessons into project policy.
5. Prefer executable controls over instruction prose.
6. Do not modify `AGENTS.md`, global skills, CI policy, or security policy as part of this retrospective unless a separate approved harness task explicitly authorizes promotion.
7. Recommend whether the candidate should be reviewed by `harness_reviewer`, security reviewer, or the relevant human decision-maker.

## Language policy

Write all durable repository output from this skill in English unless the output is explicitly localized product content.
