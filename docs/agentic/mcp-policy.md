# MCP policy

MCP servers should provide missing capabilities or authoritative data, not form a permanent collection of every integration available.

## Good global candidate

**Context7** — useful across stacks for current framework/library documentation. Configure it as a **global MCP** when both Codex CLI and the IDE extension should use it. Codex shares MCP configuration between those surfaces.

Recommended setup:

```bash
codex mcp add context7 --url https://mcp.context7.com/mcp/oauth
codex mcp login context7
```

Do not also install Context7 through a Codex plugin in this baseline. Plugins are not available in the IDE extension, while global MCP configuration is.

On Windows + WSL, an OAuth loopback callback opened in the Windows browser may occasionally fail to reach the listener in WSL. If the login process is still waiting, copy the full failed `http://127.0.0.1:<port>/callback/...` URL and request it with `curl` from a second WSL shell. Treat the URL as temporary authentication material and do not paste it into chats or logs.

## Project-specific candidates

Enable only when needed:

- OpenAI Developer Docs for OpenAI API/SDK projects.
- Playwright and/or Chrome DevTools for browser applications and browser debugging.
- Sentry or another observability source when incident/debug workflows require it.
- Cloud provider tooling for the chosen deployment environment.
- Database tooling when agents truly need schema/query inspection; prefer read-only/non-production access.

## GitHub

Local development already has Git and usually `gh`. Do not automatically add another GitHub MCP just because one exists. Add it only if it gives a concrete workflow that Git/`gh` and the Codex/GitHub integration do not already cover.

## Least capability

For every MCP server:

1. scope it globally only if it is useful in most projects;
2. otherwise keep it in `.codex/config.toml` for the trusted project;
3. use tool allow/deny lists where practical;
4. default write/destructive tools to approval or disable them;
5. never expose production secrets/data merely for agent convenience.
