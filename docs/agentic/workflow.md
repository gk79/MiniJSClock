# End-to-end workflow

## Phase A — discovery before technical commitment

1. A loose idea may remain in an ordinary ChatGPT chat. Once you decide to seriously explore it as a potential software project, create a dedicated ChatGPT Project and, if you use the Method Guide, start one long-running Method Guide chat for your work using `docs/agentic/METHOD_GUIDE_EN.md` or the equivalent `METHOD_GUIDE_PL.md`.
2. Work with the Method Guide to clarify users, outcomes, constraints, assumptions, and open questions without committing prematurely to a stack. Keep your Guide chat across Method phases by default; use focused chats only when they materially improve a difficult or substantial analysis. In a multi-contributor project, other contributors may use their own chats; no chat is shared project memory.
3. When the problem becomes concrete enough that important requirements, decisions, and their evolution deserve version history, create the Git repository from this tech-agnostic base. Configure the ChatGPT Project with the canonical instructions in `docs/agentic/chatgpt-project.md`, connect authorized repository access when available, and continue your Guide chat against durable repository state.
4. Commit the initial problem statement and requirements drafts early so architecture work has versioned inputs. From this point, `docs/AI_WORKFLOW.md` is the shared AI operating contract.

## Phase B — decide architecture, stack, data and deployment

5. Refine functional and non-functional requirements until the major decision drivers are explicit.
6. Compare a small number of credible architecture options.
7. Decide and record major choices as ADRs: backend style, frontend boundary, database, deployment topology, container strategy, external services, security boundary.
8. Update threat model, quality strategy, and deployment design enough to expose important implementation constraints.

Do not choose the stack merely because the starter has a profile for it; profiles are applied only after these decisions.

## Phase C — materialize the chosen profile

9. Record the approved technical Project identifier in `docs/current-state.md` and complete `docs/agentic/project-capabilities.md` before bootstrap materializes identifiers or capabilities. The Product/display name may remain `TBD`; the capability review may find no additions necessary.
10. Apply/adapt the selected stack, data, and deployment profiles, materializing only approved project capabilities.
11. Pin tool/runtime/package-manager versions and create lockfiles. Separately provision the tools and activate the intended executables in the normal developer environment; a pin alone proves neither.
12. Implement the canonical `make` command adapters.
13. Build the smallest runnable skeleton and a smoke test.
14. Run `make doctor`, `make harness-check`, `make bootstrap`, and `make verify`; rerun at least `make doctor` and `make verify` from a fresh ordinary developer environment and record any executor/environment limitations separately from project failures.

## Phase D — optional remote repository / CI

15. Keep Git history local from the start. Push to GitHub (or another remote) when collaboration, backup, or remote automation is useful. When multiple humans will implement concurrently, establish one shared remote integration target and one shared live coordination surface before parallel work begins.
16. Hosted CI is optional for the baseline. If enabled, make it execute the same `make ci` contract used locally; do not make local correctness depend on GitHub-specific services. For concurrent work, prefer hosted CI or an equivalent shared mechanism that verifies the current integration candidate.
17. Configure remote repository protections/review policy only when the project benefits from them.
18. Add staging/deployment automation only when the application actually has a deployment target.

## Phase E — implementation

19. Decompose implementation in `docs/delivery/implementation-plan.md`. When multiple humans will implement concurrently, identify blocking dependencies and unsafe implementation collisions, represent the required ordering as a simple acyclic task graph, and prefer safe parallelism over maximum parallelism. A dependency `A -> B` means B should not begin implementation until A has been integrated into the shared baseline. For simple solo or naturally linear work, an explicit DAG is optional.
20. Create executable tasks from `tasks/TEMPLATE.md` as work becomes ready; set risk, execution profile, reasoning target, formal required review, security impact/rationale, next handoff, and escalation triggers using `docs/agentic/model-routing.md`. Keep live assignee/status coordination in the shared collaboration surface rather than duplicating it into task Markdown.
21. For concurrent implementation, use one current human assignee for primary implementation of a task, isolate each task change (normally on a short-lived branch), and integrate through the shared remote target with a PR/MR-equivalent workflow. A task blocked by predecessors becomes eligible for implementation only after those predecessors are integrated.
22. For each implementation task, resolve its logical profile through the current workstation's Layer 0 mapping and use one primary implementation session in the assigned harness by default: load -> validate routing -> baseline -> investigate -> implement -> targeted verification -> `make verify` -> formal independent review when required -> fix -> durable handoff. A fresh top-level reviewer owns the formal verdict; `reviewer` and `security_reviewer` subagents are selective advisory sensors, used when specialization, uncertainty, or material risk justifies them.
23. Before integrating concurrent work, synchronize with the current integration target, resolve conflicts, and run the required verification against that current candidate. If implementation invalidates a shared contract or the task graph, stop affected work and replan the smallest necessary part of the graph.
24. Route low-risk mechanical tasks to optional `local-fast` only when deterministic verification is strong **and** Layer 0 provides an ergonomic, validated local harness. Otherwise use `cloud-efficient`. If task assumptions or risk change, stop, persist discoveries/evidence, and escalate according to `docs/AI_WORKFLOW.md`; when a stronger profile is required, begin a fresh implementation session rather than silently switching mid-task.
25. If formal review returns `REQUEST CHANGES`, keep the task active and remediate. A required formal re-review remains fresh and top-level; a bounded fix may receive a finding-focused re-review covering prior blocking findings, the remediation diff, and plausible regressions while valid earlier evidence is reused. Broaden review when remediation materially changes scope, architecture, security impact, dependencies, lifecycle semantics, or other assumptions or evidence relied on by the previous review. Only humans acting under the project's approved decision policy may durably change or waive a required review contract; an implementer may not self-waive it. Move the task to `tasks/done/` only after the required review and final verification pass.
26. Capture learning candidates when the work exposes reusable harness improvements; do not promote an experimental control merely because it was implemented once.

## Phase F — release and operations

27. Define the release artifact/distribution model and build an identifiable artifact.
28. Validate it on a representative acceptance target; distinguish build/publish correctness, runtime acceptance, and host/distribution compatibility when relevant.
29. Run acceptance/security/smoke checks and document release limitations. Evaluate staging/production deployment, post-deploy checks, migrations, recovery, rollback/roll-forward, and configuration/secrets independently against the product's topology and risk; validate each applicable control and record genuine non-applicability. A local product with persistent data may still need migration/recovery evidence without environment deployment; a product without persistent data may mark migrations not applicable.
30. Require an explicit human release verdict for meaningful releases.
31. Distribute the verified artifact; when production deployment applies, promote it and run post-deploy health checks.
32. Feed incidents, reviewer findings, and recurring waste back into the harness-learning loop.
