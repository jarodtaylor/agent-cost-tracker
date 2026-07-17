# .codex/ — Codex project surfaces

Codex exposes **two** project-scoped role surfaces in this repo, both real and both verified live
on 2026-07-16/17 (`codex-cli 0.144.0`):

## 1. `agents/executor.toml` — custom subagent (real format)

Codex custom agents are **TOML** files in `.codex/agents/` (project scope) or `~/.codex/agents/`
(personal scope) — spec:
<https://developers.openai.com/codex/agent-configuration/subagents>. Required keys: `name`,
`description`, `developer_instructions`; optional `model`, `model_reasoning_effort`,
`sandbox_mode`, `nickname_candidates`, `mcp_servers`, `[[skills.config]]`. The filename is
convention; the `name` field is the source of truth.

- **[`agents/executor.toml`](agents/executor.toml)** defines the `executor` agent (`gpt-5.6-sol`,
  `workspace-write`).
- **Invocation:** via delegation ("delegate to the executor agent…"), or `/agent` in an
  interactive session. **Not** auto-loaded for self-report by a passive `codex exec` prompt.
- **Verified:** `codex exec … "delegate to the custom agent named 'executor'"` spawned it and it
  returned its own `developer_instructions` — the file works end to end.

## 2. `../AGENTS.md` — project context (repo root)

Read by the main Codex session (including `codex exec`). Spec:
<https://developers.openai.com/codex/agent-configuration/agents-md>. This is what run 1's headless
`codex exec` pane uses to carry the Executor role; verified — the main session recited the role
from `AGENTS.md`.

## Which does run 1 use?

The Codex pane runs `codex exec -m gpt-5.6-sol -C <repo> "Implement …"` and reads **`AGENTS.md`**
(main-session path). The **`executor.toml`** subagent is the symmetric per-harness agent file
(analogous to `.cursor/agents/*.md` and `.claude/agents/`) and the delegation-invoked form. Both
carry the same Executor role, provisioned from the same blueprint SSOT
(`blueprint/roles/variants/codex/`).

> Correction note: an earlier version of this file wrongly claimed the `.codex/agents` format did
> not exist. It does. See `../FRICTION.md` and `../tasks/lessons.md` — the false-absence finding
> is itself a dogfood lesson for the provisioner.
