# .codex/ — intentionally minimal

The scaffold spec assumed Codex carried per-agent personas in `.codex/agents/*.toml`. **That
surface does not exist** in the Codex version verified here (`codex-cli 0.144.0`, 2026-07-16):

- `codex --help` exposes **no** `agents` / `persona` subcommand.
- `~/.codex/agents/` (the user-level equivalent) is **empty**.
- `~/.codex/config.toml` has no `[agents]` / `[persona]` tables — only `[projects.*]`,
  `[mcp_servers.*]`, `[plugins.*]`, `[hooks.*]`, `[features]`, etc.

## Where the Executor role actually lives

- **Role instructions:** repo-root [`../AGENTS.md`](../AGENTS.md) (Codex reads it automatically).
- **Model pin:** invocation-time — `codex exec -m <model> -C <repo> …` (see
  [`../blueprint/workflow.md`](../blueprint/workflow.md)). Optionally a `[profiles.*]` block in
  `~/.codex/config.toml` selected with `-p <profile>`.

This directory is kept as a deliberate marker: the provisioner's on-disk assumption was wrong,
and the correction is a friction entry (`../FRICTION.md`). If a future Codex version adds a
project-level agent surface, provision it here.
