# Skills policy

## General reusable skills

Use maintained generic engineering skills at **user scope** when they should be available in both Codex CLI and the Codex IDE extension.

Codex discovers personal skills from:

```text
~/.agents/skills/<skill-name>/SKILL.md
```

The IDE extension does not support Codex plugins, so a plugin-only installation is not an adequate cross-surface baseline for a workflow that primarily uses VS Code.

For Addy Osmani's `agent-skills`, keep a reviewed/pinned clone outside project repositories and expose the skill directories through `~/.agents/skills` (symlinks are supported by Codex). Update the clone deliberately after reviewing release notes rather than silently tracking every upstream change.

Example layout:

```text
~/agentic-sdlc/vendor/agent-skills/
    skills/<name>/SKILL.md

~/.agents/skills/<name> -> ~/agentic-sdlc/vendor/agent-skills/skills/<name>
```

Explicit invocation in Codex CLI or the IDE extension uses `$skill-name`; implicit routing may select a skill from its description.

A native Codex plugin remains a valid **CLI/desktop-only** distribution option, but it is not the portable baseline when the IDE extension must see the same skills.

## Project-local skills

Only keep a local skill when it encodes a workflow that depends on this starter's repository contract or on the project itself.

This template includes:

- `repo-bootstrap`: turns an approved stack/profile into an executable repo baseline.
- `project-handoff`: persists task and project state for the next fresh session/tool.
- `harness-retrospective`: converts failures/reviewer findings into structured learning candidates.

Add further local skills only when the workflow is repeatedly needed and cannot be expressed cleanly by the general skill pack plus project documentation.

## Avoid duplicate routers

Do not preload a meta-router skill into `AGENTS.md` when Codex's native skill routing is active. Duplicate routing instructions consume context and may produce conflicting workflow choices.
