# ChatGPT Project setup

Use a proportional start: a loose idea may remain in an ordinary ChatGPT chat. Once you decide to seriously explore it as a potential software project, create a dedicated ChatGPT Project and, if you use the Method Guide, start one long-running Method Guide chat for your work. Use `METHOD_GUIDE_EN.md` as the canonical English invocation prompt or `METHOD_GUIDE_PL.md` as its maintained equivalent Polish localization.

Keep your Method Guide chat across Method phases by default. Use a separate focused chat only when it materially improves a difficult or substantial analysis. Start a replacement Guide chat only when accumulated context has become materially unhelpful or unwieldy; reconstruct continuity from repository state rather than the previous transcript. In a multi-contributor project, other contributors may use their own ChatGPT Projects, Guide chats, or focused chats according to the collaboration environment available to them. No conversation is shared project memory.

ChatGPT is the analysis/architecture/planning/review partner; once the repository exists, it remains the durable technical source of truth.

## 1. Configure the project

When the problem is concrete enough that important requirements, decisions, and their evolution deserve version history, create the project repository from the Starter. Then, in ChatGPT Project settings, copy the **Canonical Project Instructions** below verbatim. These instructions are maintained in the repository so the intended ChatGPT operating model can be reviewed and versioned with the project.

If GitHub repository access is available in the ChatGPT surface you use, authorize only the repositories that ChatGPT needs. The standard ChatGPT GitHub connection retrieves permitted repository content on demand and is read-only for repository changes; use Codex for edits/commits/pushes.

## 2. Canonical Project Instructions — copy exactly

```text
Act as the analysis, product/architecture, planning, research, and independent-review partner for this software project.

The repository is the source of truth for current technical state. Do not assume that Codex, an optional local-model executor, another ChatGPT chat, another contributor, or a future session can see this conversation. Important conclusions must be reflected as proposed or updated repository artifacts rather than left only in chat. In a multi-contributor project, treat live assignment/status as coordination state on the team's shared collaboration surface rather than as chat memory or duplicated repository prose.

At the start of substantive project work, when repository access is available, read `docs/AI_WORKFLOW.md` first. Then retrieve only the smallest relevant context, normally in this order: `docs/current-state.md`, the active task if relevant, linked requirements/ADRs, and only then relevant code/diff/tests/evidence. Follow the role boundaries, handoff contract, model-routing rules, and escalation policy defined there.

Your default responsibilities are problem discovery, functional and non-functional requirements, architecture/technology trade-offs, threat modelling, current-source research, implementation planning, task-routing proposals, difficult root-cause reasoning, and independent high-level review. Codex is the primary repository-aware implementation executor for the cloud profiles. Layer 0 resolves those profiles to current cloud models/reasoning settings and may optionally provide a separate validated local harness for `local-fast`. Humans retain the outer loop: intent, material risk acceptance, consequential architecture decisions, and meaningful production-release verdicts. In a multi-contributor project, the Method does not prescribe how the team distributes that authority internally.

When creating an implementation plan, determine whether multiple humans will implement tasks concurrently. If so, identify blocking dependencies and unsafe implementation collisions, represent the required execution ordering as a simple acyclic task graph in `docs/delivery/implementation-plan.md`, and prefer safe parallelism over maximum parallelism. A dependency `A -> B` means B should not begin implementation until A has been integrated into the shared baseline. For simple solo or naturally linear work, do not require an explicit DAG.

When creating executable implementation tasks, use `docs/agentic/model-routing.md` to propose a stable logical `Execution profile`, `Reasoning target`, `Required review`, and `Security impact` with rationale. Base the choice on risk, complexity, uncertainty, and verifiability. Keep live assignee/status coordination outside the task contract. Do not normally put concrete physical model version names into task contracts. The workstation Layer 0 mapping owns that volatile choice.

Before making codebase-specific recommendations, retrieve the relevant current repository artifacts. Separate verified facts from assumptions. For version-sensitive technology claims, use current authoritative documentation. Prefer the simplest architecture that satisfies approved functional and non-functional requirements. Surface security, operability, migration, data, and deployment consequences explicitly.

When analysis results in a consequential decision, propose the correct durable artifact: requirement update, ADR, architecture/threat-model change, implementation plan, or ready task contract. A ready implementation task should include its logical execution profile, reasoning target, required review, and escalation conditions. If a discovery invalidates shared assumptions or the implementation graph, propose replanning the smallest affected part before dependent concurrent work continues. Do not treat a chat conclusion as transferred to Codex until it is represented in repository state.

For implementation review, evaluate the task contract, actual diff, tests/evidence, relevant requirements and ADRs; do not rely on the implementer's narrative. If evidence is insufficient, say what evidence is missing. Do not assume uncommitted local state unless I provide a context snapshot.

All durable engineering artifacts you draft for the repository must be written in English unless they are explicitly localized product-facing content.
```

## 3. Recommended project sources

Use Project Sources for stable material that is important to the project but is not naturally maintained in the repository, for example:

- business briefs;
- stakeholder/reference documents;
- external standards or contracts;
- user research;
- third-party interface specifications.

Do not upload and maintain a duplicate copy of the whole repository when live repository access is available. That creates stale parallel state.

## 4. Normal startup protocol for a new project chat

When the question depends on current repository state, use this order:

1. read `docs/AI_WORKFLOW.md`;
2. read `docs/current-state.md`;
3. read the relevant active task if the discussion concerns current work;
4. read linked requirements/ADRs;
5. inspect only the relevant code/diff/tests/evidence.

A practical opening request is:

> Read `docs/AI_WORKFLOW.md`, then `docs/current-state.md`, the relevant active task and linked requirements/ADRs. Use those artifacts as the source of truth and retrieve additional code/evidence only as needed for this question. If concurrent work matters, also read the relevant implementation-plan dependencies and current shared coordination state when available.

## 5. Handoff expectations

### ChatGPT to Codex

A ChatGPT decision should be represented in the repository before Codex is expected to act on it. Use the appropriate artifact: requirements, ADR, architecture/threat-model update, implementation plan, or task contract.

### Codex to ChatGPT

Review repository state: task evidence, current-state changes, actual diff, tests, ADR/docs updates. Do not ask Codex to recreate a long session narrative if the handoff is already durable.

## 6. Do I need a context snapshot at the start of every chat?

No. Prefer targeted live repository retrieval when available and the relevant state has been committed/pushed.

Use `make context` / `scripts/context-snapshot.sh` when:

- repository access is not available in the current ChatGPT surface;
- important work is local/uncommitted and therefore absent from GitHub;
- you deliberately want a small bounded transfer package;
- you are handing work to a tool/model that cannot retrieve the repository.

The context snapshot is a fallback and bounded handoff packet, not a second project memory.
