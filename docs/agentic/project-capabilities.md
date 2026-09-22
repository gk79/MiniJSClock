# Project Capability Review

Complete and approve this review after architecture, stack, deployment, and threat-model decisions are sufficiently known and before bootstrap materializes project capabilities. Start with recurring engineering, verification, deployment, and operations needs; check Layer 0, repository commands, and official tools before adding an integration.

Decision: No additional project-specific capabilities required.

Approval: pending

If a capability is needed, replace the default decision and record each adopted capability briefly:

| Need/purpose | Type (skill, MCP, CLI/tool, reviewer/agent, other) | Existing coverage | Decision and rationale | Source/maintainer | Scope and access | Validation | Version/pin, if relevant | Revisit/removal trigger |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

Prefer trustworthy, inspectable sources and the least access needed. For MCPs, consider project scope, read-only access, and explicit allowed operations; registry presence alone is not approval. Keep build, test, and release correctness in deterministic repository commands. Propose new capabilities for approval before installation.
