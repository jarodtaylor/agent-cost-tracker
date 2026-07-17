# blueprint/ — the SSOT

Shared role intent + per-harness variants. **This is the source of truth.** The native harness
config in the repo (`CLAUDE.md`, `AGENTS.md`, `.cursor/`, `.codex/`) is **provisioned from
here** — currently by hand. That hand-provisioning ceremony, and the blueprint→native mapping,
is the spec for an automated provisioner (see [`../PROVISIONING.md`](../PROVISIONING.md)).

```
blueprint/
  workflow.md              # the SDLC map: phases, handoff contracts, Herdr pane commands
  roles/
    architect.md           # shared intent (WHAT the role owns), harness-agnostic
    executor.md
    reviewer.md
    qa-gate.md
    variants/              # per-harness HOW
      claude-code/         # architect.md, reviewer.md  → provisioned to CLAUDE.md
      codex/               # AGENTS.md + executor.toml → AGENTS.md + .codex/agents/
      cursor/
        agents/            # 4 QA specialists          → provisioned to .cursor/agents/
        skills/qa-gate/    # QA-lead orchestrator      → provisioned to .cursor/skills/qa-gate/
```

## Editing rule

Change **intent here**, then re-provision downstream. Every role currently exists twice (SSOT +
provisioned copy) with no automatic sync — that duplication is a known friction and the reason
the provisioner exists. If you edit a native copy directly, you've drifted from the SSOT.

## Why per-harness variants

The four harnesses expose role differently:
- **Claude Code** — `CLAUDE.md` project instructions + `.claude/agents/`.
- **Codex** — repo-root `AGENTS.md` (project context) **and** `.codex/agents/*.toml` (real
  project-scoped custom subagents) + `codex exec -m`.
- **Cursor** — `.cursor/agents/*.md` (YAML frontmatter, `model:` pins) + `.cursor/skills/`;
  project scope overrides user scope on name conflict.

The shared `roles/*.md` state the invariant intent; the variants carry each harness's mechanics.
