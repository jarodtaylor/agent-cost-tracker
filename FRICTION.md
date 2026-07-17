# FRICTION

Append-only log of every rough edge in the multi-harness run. **One line per moment.** Capture
tooling friction *and* "this phase/handoff exists only because humans needed it" observations.
A messy run that captures ten "ugh" moments beats a clean run that captures none.

**Tags:** `[scaffold]` (pre-run setup) · `[architect]` · `[execute]` · `[review]` · `[qa]` ·
`[handoff]` (friction that lives *between* phases). Newest at the bottom.

---

- `[scaffold]` 2026-07-16 — **The provisioning agent produced a FALSE-ABSENCE finding about Codex subagents** (corrected 2026-07-17 after Jarod's review). The scaffold pass claimed `.codex/agents/*.toml` "does not exist," reasoning from an empty `~/.codex/agents/` + a top-level `codex --help` with no `agents` subcommand — and skipped the authoritative docs (treated them as "optional confirmation"). **The spec was right; the finding was wrong.** Codex custom subagents are real, project-scoped TOML in `.codex/agents/` (docs: developers.openai.com/codex/agent-configuration/subagents); verified live by delegating to a provisioned `executor.toml`, which spawned and returned its own instructions. Lesson (→ `tasks/lessons.md`): a shallow live probe yields false *absences* as readily as false *presences* — "absent from `ls`/`--help`" ≠ "feature doesn't exist." Verify a surface's EXISTENCE against authoritative docs before writing "does not exist." This is a sharper U10 requirement than the original (wrong) entry: the provisioner must not encode absence from a cursory scan.
- `[scaffold]` 2026-07-16 — **The QA squad was authored at USER scope.** The four `qa-*` agents and the `qa-gate` skill were sitting in `~/.cursor/agents/` and `~/.cursor/skills/`, applying to *every* repo on the machine — global-scope pollution. An agent writing config at the wrong scope is *literally* the provisioning problem this whole system exists to solve. Rebuilt project-scoped under `.cursor/`; the user-level copies were deleted after the project copies were committed.
- `[scaffold]` 2026-07-16 — **No browser MCP for the Cursor CLI.** The `qa-browser-e2e` lane needs Playwright/browser tooling, but Cursor's user-level `mcp.json` registers none. Closing the gap **project-scoped** in `.cursor/mcp.json` — registering it at user level would have repeated the wrong-scope friction above.
- `[scaffold]` 2026-07-16 — **Every role file exists twice.** `blueprint/` holds the SSOT; the native harness locations hold hand-copied provisioned duplicates, with no sync between them. Editing intent means editing two files and remembering the mapping. This hand-provisioning ceremony is exactly what an automated provisioner must own.
