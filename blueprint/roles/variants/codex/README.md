# Variant: Executor — Codex

Implements [`../../executor.md`](../../executor.md) for Codex. Codex has **two** project role
surfaces, both real (verified live 2026-07-16/17, `codex-cli 0.144.0`) — this dir provisions both:

| SSOT file | Native destination | Surface |
|---|---|---|
| `AGENTS.md` | repo-root `AGENTS.md` | **Project context** — read by the main session incl. `codex exec`. Run 1's headless pane drives the Executor via this file. |
| `executor.toml` | `.codex/agents/executor.toml` | **Custom subagent** (real TOML format) — spawnable via delegation. Symmetric with `.cursor/agents/*.md` and `.claude/agents/`. |

Both carry the same Executor role. Keeping them in sync is a provisioning duty (and a U10
requirement — a single harness can have more than one role surface).

## Real Codex custom-agent format (do not re-derive from `--help`)

`.codex/agents/*.toml` — required `name`, `description`, `developer_instructions`; optional
`model`, `model_reasoning_effort`, `sandbox_mode`, `nickname_candidates`, `mcp_servers`,
`[[skills.config]]`. Filename is convention; `name` is the source of truth. Invoked via
delegation or interactive `/agent` — **not** surfaced by a passive `codex exec` self-report
(that returns "none configured" even when the agent loads and spawns correctly).
Spec: <https://developers.openai.com/codex/agent-configuration/subagents>.

> An earlier scaffold pass wrongly concluded this format didn't exist (empty `~/.codex/agents/` +
> no top-level `--help` subcommand). It does. That false-absence finding is captured in
> `../../../../FRICTION.md` and `../../../../tasks/lessons.md`.
