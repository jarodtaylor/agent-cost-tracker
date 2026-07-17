# PROVISIONING — blueprint → native (the manual provisioner)

The hand-copy from `blueprint/` (SSOT) into native harness locations, recorded step by step.
**This ceremony is the spec for an automated provisioner.** Every transform, every correction,
every place a human had to know something the file didn't say = a requirement for the automation.

Provisioned by hand on 2026-07-16 against verified-live harnesses (codex 0.144.0,
cursor-agent 2026.07.13).

## Mapping table

| # | Source (blueprint SSOT) | Native destination | Transform | Notes |
|---|---|---|---|---|
| 1 | `roles/variants/cursor/agents/qa-smoke.md` | `.cursor/agents/qa-smoke.md` | **copy** (byte-identical) | model pin `composer-2.5-fast` |
| 2 | `roles/variants/cursor/agents/qa-regression.md` | `.cursor/agents/qa-regression.md` | **copy** | `composer-2.5` |
| 3 | `roles/variants/cursor/agents/qa-browser-e2e.md` | `.cursor/agents/qa-browser-e2e.md` | **copy** | `claude-sonnet-5-thinking-high`; needs browser MCP (step 8) |
| 4 | `roles/variants/cursor/agents/qa-skeptic-verifier.md` | `.cursor/agents/qa-skeptic-verifier.md` | **copy** | `claude-opus-4-8-thinking-high` |
| 5 | `roles/variants/cursor/skills/qa-gate/SKILL.md` | `.cursor/skills/qa-gate/SKILL.md` | **copy** | parent orchestrator |
| 6 | `roles/variants/cursor/skills/qa-gate/claude-invocation.md` | `.cursor/skills/qa-gate/claude-invocation.md` | **copy** | caller template |
| 7 | `roles/variants/codex/executor.md` | `AGENTS.md` (repo root) | **transform** — strip the blueprint `# Variant …` header + `---`; keep the role body; add a "provisioned from" banner | Codex's real role surface |
| 8 | *(new — not from a variant)* | `.cursor/mcp.json` | **new** | project-scoped Playwright MCP (`@playwright/mcp@latest --headless --isolated`) to satisfy the `qa-browser-e2e` browser dependency |
| 9 | `roles/variants/claude-code/architect.md` + `reviewer.md` | `CLAUDE.md` (repo root) | **compose** — merge both variants + a project header + standing standards into one file | Claude Code's role surface (3 phases) |
| 10 | *(marker — no source)* | `.codex/README.md` | **new** | documents that `.codex/agents` persona format does NOT exist; role lives in `AGENTS.md` |
| 11 | *(placeholder)* | `.claude/agents/README.md` | **new** | none provisioned for run 1 (review runs inline) |

## Transform types (what the provisioner must support)

- **copy** — byte-identical. The trivial case (6 of 11). A dumb file copy suffices.
- **transform** — strip blueprint-meta framing, inject a "provisioned from <source>" banner
  (step 7). The provisioner needs to know each variant's body boundary.
- **compose** — merge N variant files + boilerplate into one native file (step 9: two variants →
  one `CLAUDE.md`). The provisioner needs a per-harness assembly recipe, not just a path map.
- **new** — native files with **no** blueprint source (steps 8/10/11: an MCP registration, a
  correction marker, a placeholder). The provisioner must allow harness-specific scaffolding that
  the SSOT doesn't carry.

## Corrections forced during provisioning (→ FRICTION.md)

1. **Codex persona format was wrong in the spec.** No `.codex/agents/*.toml`. Verified live, then
   provisioned the Executor to `AGENTS.md` + documented the correction in `.codex/README.md`.
   *Provisioner requirement: verify the target surface exists on the live harness before writing
   to it.*
2. **QA squad was authored at USER scope** (`~/.cursor/...`) — global pollution. Rebuilt
   project-scoped; user-level copies deleted after commit. *Provisioner requirement: default to
   project scope; never write user-global config as a side effect.*
3. **No browser MCP for Cursor.** Registered project-scoped (`.cursor/mcp.json`), not user-level.
   *Provisioner requirement: a lane's tool dependencies are part of provisioning, resolved at the
   correct scope.*

## The duplication problem (the reason U10 exists)

After provisioning, **every role exists twice** — once in `blueprint/`, once in its native
location — with no sync. Editing intent means editing the SSOT and re-running this ceremony.
Today that is manual and error-prone. Automating this map (copy/transform/compose/new + live
surface verification + correct scope) is the provisioner's job.
