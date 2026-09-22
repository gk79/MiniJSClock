# Global workstation setup (WSL/Ubuntu)

Keep universal tools global; keep language/framework toolchains project- or stack-specific.

## Canonical global Codex instructions

The Starter versions the portable cross-project Codex policy in:

```text
workstation/codex/AGENTS.md.example
```

Install that file as `~/.codex/AGENTS.md` on every development workstation. It defines **how you work across projects**: repository-as-memory, evidence-based verification, escalation, safety, durable documentation, and language policy.

Keep project behavior out of the global file. Each repository's root `AGENTS.md` defines **how that project works** and routes Codex to `docs/AI_WORKFLOW.md` before substantive project work. The resulting instruction chain is:

```text
~/.codex/AGENTS.md
    global cross-project working agreements
        ↓
<repo>/AGENTS.md
    project operating rules
        ↓
<repo>/docs/AI_WORKFLOW.md
    shared AI operating contract
        ↓
<repo>/tasks/active/TASK-*.md
    concrete work contract
```

Do not maintain an independently edited global policy on each computer. If the portable global working agreements need to change, update the Starter template first and then propagate the reviewed version to the workstations.

## Universal baseline

Recommended across almost every project:

- `git`
- GitHub CLI (`gh`)
- Bash
- `curl`
- `jq`
- `ripgrep` (`rg`)
- `make`
- `gitleaks` CLI
- `osv-scanner` CLI
- VS Code opened in WSL (`code .` from the Linux project directory)
- Codex CLI + Codex VS Code extension
- `bubblewrap` on Linux/WSL when Codex reports it as a sandbox prerequisite

Useful optional utilities:

- `fd` for fast file discovery
- `shellcheck` and `shfmt` when shell scripts are non-trivial
- Docker Engine / Docker Compose only when the selected project/deployment profile needs containers
- Ollama/local models only when an actual local-model workflow is enabled

For Ubuntu/WSL, if Codex warns that `bubblewrap` is missing, install the system package rather than relying indefinitely on the bundled fallback:

```bash
sudo apt update
sudo apt install -y bubblewrap
command -v bwrap
bwrap --version
```

## Reusable Codex skills across CLI and IDE

The primary development surface is the Codex IDE extension, so the global skill baseline must work in both CLI and IDE.

Codex standalone/user skills are discovered from:

```text
~/.agents/skills/<skill-name>/SKILL.md
```

The IDE extension does **not** support Codex plugins. Therefore, do not use a plugin-only installation as the baseline for generic engineering skills that must also be available in VS Code.

For Addy Osmani's `agent-skills`, use a reviewed/pinned clone and symlink its individual skill folders into `~/.agents/skills`:

```bash
mkdir -p ~/agentic-sdlc/vendor ~/.agents/skills

git clone --branch <reviewed-version> --depth 1 \
  https://github.com/addyosmani/agent-skills.git \
  ~/agentic-sdlc/vendor/agent-skills

for skill_dir in ~/agentic-sdlc/vendor/agent-skills/skills/*; do
  if [ -f "$skill_dir/SKILL.md" ]; then
    ln -sfn "$skill_dir" "$HOME/.agents/skills/$(basename "$skill_dir")"
  fi
done
```

Use `$skill-name` or `/skills` for explicit invocation in Codex CLI/IDE; implicit routing can select skills from their descriptions.

A native Codex plugin is still useful for CLI/desktop-only workflows and distribution, but it is not the cross-surface baseline when the IDE extension is the primary tool.

## Documentation retrieval

Context7 is a good broadly reusable documentation capability. Configure it as a global MCP so Codex CLI and the IDE extension share it:

```bash
codex mcp add context7 --url https://mcp.context7.com/mcp/oauth
codex mcp login context7
codex mcp list
```

Do not also install Context7 as a Codex plugin in this baseline. Global MCP configuration in `~/.codex/config.toml` is shared between CLI and IDE; plugins are not available in the IDE extension.

On Windows + WSL, browser OAuth may occasionally complete authorization but fail on the final loopback callback to `127.0.0.1:<port>`. If `codex mcp login context7` is still waiting, copy the full failed callback URL from the Windows browser and request it from a second WSL shell:

```bash
curl 'http://127.0.0.1:<port>/callback/...'
```

Treat that callback URL as temporary authentication material: do not paste it into chats, issue trackers, or logs.

Add vendor-specific documentation MCPs only when the project needs them (for example OpenAI Developer Docs for an OpenAI-based project).

## Global Codex safety defaults

Use an explicit interactive baseline rather than relying on implicit defaults:

```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

Merge settings into an existing `~/.codex/config.toml`; never overwrite auth, plugin state, trust entries, or other workstation-specific configuration blindly.

## Portable execution profiles vs. machine-specific models

Project task contracts use logical execution profiles and reasoning targets defined in `docs/agentic/model-routing.md`. Layer 0 maps the cloud profiles to the physical models and supported reasoning settings available on the workstation.

The core Codex routing baseline is:

```text
cloud-efficient
cloud-standard
cloud-deep
```

`local-fast` remains an **optional** logical profile. Enable it only when the workstation has an ergonomic, validated local-model-capable harness. The harness does not need to be Codex; for example it may be a VS Code local-agent path backed by Ollama. If local execution is not convenient or reliable, mark `local-fast` unavailable and use `cloud-efficient` for the same class of bounded work.

Use `workstation/execution-profile-mapping.md.example` as the checklist when configuring a machine. Keep the filled machine-specific mapping in the workstation configuration rather than using project task files as the source of truth.

## Minimal local security baseline

The baseline intentionally uses only free local CLI tools:

- **Gitleaks CLI** — secret scanning of the working tree;
- **OSV-Scanner** — known-vulnerability scanning when supported dependency manifests exist.

Do not make the baseline depend on paid/trial security products or hosted GitHub security services. Projects may add stack-specific controls later when the threat model justifies them. `make security` is the stable repository entry point.

Prefer official prebuilt releases rather than adding language runtimes solely to build these tools. A simple WSL installation path using the already-configured GitHub CLI is:

```bash
mkdir -p ~/.local/bin

rm -rf /tmp/gitleaks-install /tmp/osv-install
mkdir -p /tmp/gitleaks-install /tmp/osv-install

gh release download --repo gitleaks/gitleaks \
  --pattern '*linux_x64.tar.gz' --dir /tmp/gitleaks-install
tar -xzf /tmp/gitleaks-install/*linux_x64.tar.gz -C ~/.local/bin gitleaks

gh release download --repo google/osv-scanner \
  --pattern '*linux_amd64' --dir /tmp/osv-install
install -m 0755 /tmp/osv-install/*linux_amd64 ~/.local/bin/osv-scanner

gitleaks version
osv-scanner --version
```

Record the installed versions in the workstation notes. For a project that requires stricter supply-chain reproducibility, pin and verify release checksums there rather than making that ceremony mandatory for every small project.

## What should NOT be universal

Do not globally standardize all of these across unrelated projects:

- Python/Node/.NET/Java/Go versions
- package managers
- linters/formatters for languages you are not using
- database clients/migration tools
- Playwright/Chrome DevTools MCP for non-web projects
- cloud CLIs for clouds you are not deploying to

Pin these in the chosen project/profile instead.
