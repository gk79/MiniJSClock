# Implementation plan

## Strategy

Break work into small vertical slices that produce verifiable behavior. Avoid long phases where architecture, code, tests, and deployment drift apart.

## Milestones

| Milestone | Outcome | Dependencies | Exit evidence |
|---|---|---|---|
| M1 | ... | ... | ... |

## Task decomposition

Each implementation task should be independently understandable and reviewable. Create executable task contracts from `tasks/TEMPLATE.md` when work is ready to enter the task lifecycle.

When multiple human contributors will implement tasks concurrently, make blocking execution dependencies explicit here and check for unsafe implementation collisions. Prefer task boundaries that allow safe parallel work; when two tasks should not proceed concurrently, change the decomposition or serialize them with a dependency rather than inventing a separate coordination taxonomy.

Use a compact table when the dependency topology is non-trivial:

| Task | Outcome | Depends on |
|---|---|---|
| TASK-0001 | ... | — |

A dependency `A -> B` means that B should not begin implementation until A has been integrated into the shared baseline. The graph should remain acyclic and contain only dependencies that materially constrain safe execution. For simple solo or naturally linear work, an explicit DAG is optional.

Live assignee/status coordination belongs in the team's shared collaboration surface rather than being duplicated into this plan or task contracts.

## Risk ordering

Build uncertain/high-risk technical spikes early, but keep production-changing implementation behind explicit decisions and acceptance criteria.
