# Contributing

## Language

Use English for all version-controlled engineering artifacts: code identifiers and comments, documentation, ADRs, task files, scripts and messages, commit messages, and pull-request content. Product-facing localized text is an exception when required by the product.

## Definition of Ready

A task is ready for execution when it has a clear goal, non-goals, acceptance criteria, relevant constraints/ADRs, expected verification, dependencies, a risk level, an execution profile, a reasoning target, required review, and explicit escalation conditions for any known boundary that could invalidate the assignment. When concurrent human work is planned, any blocking predecessor must also be integrated before the task begins implementation.

## Definition of Done

A task is done when:

- acceptance criteria are satisfied;
- relevant format/lint/type/test/security/build checks pass;
- changed behavior has been executed or otherwise observed where practical;
- an independent review has no unresolved blocking findings for medium/high-risk work;
- documentation and task/current-state artifacts are updated;
- the harness retrospective was considered and any justified learning candidate was captured;
- CI or equivalent required integration verification passes on the proposed change.

Production deployment is a separate decision and requires its own evidence/verdict.
