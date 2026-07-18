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
| 7 | `roles/variants/codex/AGENTS.md` | `AGENTS.md` (repo root) | **copy** | Codex **project-context** surface — read by the main `codex exec` session (run-1 driver) |
| 8 | `roles/variants/codex/executor.toml` | `.codex/agents/executor.toml` | **copy** | Codex **custom subagent** (real project-scoped TOML) — spawnable via delegation |
| 9 | *(new — not from a variant)* | `.cursor/mcp.json` | **new** | project-scoped Playwright MCP (`@playwright/mcp@latest --headless --isolated`) to satisfy the `qa-browser-e2e` browser dependency |
| 10 | `roles/variants/claude-code/orchestrator.md` + `architect.md` + `reviewer.md` | `CLAUDE.md` (repo root) | **compose** — identity charge (orchestrator) + standing standards + phase mechanics (architect, reviewer) into one role-first file | Claude Code's role surface: identity + 3 phases + orchestration |
| 11 | *(marker — no source)* | `.codex/README.md` | **new** | documents Codex's **two** real role surfaces (`AGENTS.md` + `.codex/agents/*.toml`) |
| 12 | *(placeholder)* | `.claude/agents/README.md` | **new** | none provisioned for run 1 (review runs inline) |

> **Codex has two role surfaces for one role** (rows 7 + 8) — a single harness can require more
> than one native destination for the same intent. The provisioner's map is not 1:1.

## Transform types (what the provisioner must support)

- **copy** — byte-identical. The common case (8 of 12: 6 Cursor + Codex `AGENTS.md` +
  `executor.toml`). A dumb file copy suffices; the SSOT already carries its own banner.
- **compose** — merge N variant files + boilerplate into one native file (row 10: three variants
  — orchestrator identity + architect + reviewer — → one role-first `CLAUDE.md`). The provisioner
  needs a per-harness assembly recipe, not just a path map. Note the asymmetry: Codex's one role
  maps to one file each; Claude Code's identity + 3 roles compose into one.
- **new** — native files with **no** blueprint source (rows 9/11/12: an MCP registration, a
  correction/marker README, a placeholder). The provisioner must allow harness-specific
  scaffolding that the SSOT doesn't carry.
- **transform** (not exercised in run 1) — strip blueprint-meta framing / inject a banner. Kept
  in the taxonomy because a provisioner will need it once SSOT files carry framing the native
  copy shouldn't; run 1 avoided it by giving each SSOT file a native-ready body.

## Corrections forced during provisioning (→ FRICTION.md)

1. **False-absence finding about Codex subagents** (self-inflicted; caught by Jarod's review,
   fixed 2026-07-17). The first pass wrote "`.codex/agents` does not exist," reasoning from an
   empty `~/.codex/agents/` + a top-level `--help` with no `agents` subcommand — and skipped the
   authoritative docs. **The spec was right.** The real format is project-scoped
   `.codex/agents/*.toml` (verified by delegating to a provisioned `executor.toml`). *Provisioner
   requirement: verify a surface's EXISTENCE against authoritative docs, not just a live `ls`/
   `--help`. A cursory scan yields false absences as readily as false presences — never encode
   "does not exist" from one.*
2. **QA squad was authored at USER scope** (`~/.cursor/...`) — global pollution. Rebuilt
   project-scoped; user-level copies deleted after commit. *Provisioner requirement: default to
   project scope; never write user-global config as a side effect.*
3. **No browser MCP for Cursor.** Registered project-scoped (`.cursor/mcp.json`), not user-level.
   *Provisioner requirement: a lane's tool dependencies are part of provisioning, resolved at the
   correct scope.*

## Not provisioned from the blueprint (runtime / managed artifacts)

Some native files are **not** copies of an SSOT and the provisioner should leave them alone:

- **`HANDOFF.md`** — the project brain: seeded once, then rewritten by each harness during a run.
  Runtime state, not provisioned intent. (The *protocol* for reading/writing it lives in the role
  files, which are provisioned.)
- **`FRICTION.md`** — append-only run log.
- **`skills-lock.json`** — managed by the skills tool (`npx skills add`). Committed (reproducible);
  the materialized skill content under `.agents/`/`.claude/skills/` is gitignored, reinstallable.

## The duplication problem (the reason U10 exists)

After provisioning, **every role exists twice** — once in `blueprint/`, once in its native
location — with no sync. Editing intent means editing the SSOT and re-running this ceremony.
Today that is manual and error-prone. Automating this map (copy/transform/compose/new + live
surface verification + correct scope) is the provisioner's job.
