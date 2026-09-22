# Workstation-level Layer 0 templates

These files are **portable Layer 0 templates for your WSL home environment**. They belong to the reusable SDLC baseline, but they are not project-repository runtime files and should not normally be copied into a project repository unchanged.

- `codex/AGENTS.md.example` -> **canonical portable template** for `~/.codex/AGENTS.md` on every development workstation
- `codex/config.toml.example` -> merge safe global defaults into `~/.codex/config.toml`
- `shell/local-model-aliases.sh.example` -> optional placeholder only if a local-model path is later enabled
- `execution-profile-mapping.md.example` -> template for mapping portable project execution profiles to actual runtimes/models/reasoning settings on this workstation

For `codex/AGENTS.md.example`, keep the installed `~/.codex/AGENTS.md` synchronized with this template unless you deliberately revise the portable SDLC baseline. Copy the same canonical template to every development workstation. Do not add machine-specific model names, credentials, or project-specific policy to it.

For `config.toml.example` and the other templates, review and merge settings manually. Your existing global Codex configuration may already contain project trust settings, MCP servers, plugin state, or other options that must not be overwritten.

The execution-profile mapping is intentionally machine-specific. Cloud model availability can evolve independently per workstation. `local-fast` is optional and may be marked unavailable when no ergonomic, validated local-model harness exists. Do not force local inference into the core workflow merely because the hardware supports it.

## Installing the global Codex instructions

From a local copy of this Starter on a workstation:

```bash
mkdir -p ~/.codex
cp workstation/codex/AGENTS.md.example ~/.codex/AGENTS.md
chmod 644 ~/.codex/AGENTS.md
```

Validate in a fresh Codex session that the global working agreements are active. Repository-level `AGENTS.md` files then add project-specific instructions on top of this global baseline.

## Cross-surface rule

The primary workflow uses the Codex IDE extension, so global capabilities should be chosen with CLI/IDE parity in mind:

- standalone user skills in `~/.agents/skills` are available to Codex CLI and the IDE extension;
- MCP configuration in `~/.codex/config.toml` is shared by CLI and the IDE extension;
- Codex plugins are **not** available in the IDE extension, so do not make a plugin-only dependency part of the baseline workflow.


## Local security tools

The v2.6 baseline expects free local security CLIs rather than hosted security services: Gitleaks for secrets and OSV-Scanner for known vulnerable dependencies. Keep them in Layer 0 and let repositories invoke them through `make security`.
