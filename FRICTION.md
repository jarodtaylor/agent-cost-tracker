# FRICTION

Append-only log of every rough edge in the multi-harness run. **One line per moment.** Capture
tooling friction *and* "this phase/handoff exists only because humans needed it" observations.
A messy run that captures ten "ugh" moments beats a clean run that captures none.

**Tags:** `[scaffold]` (pre-run setup) · `[architect]` · `[execute]` · `[review]` · `[qa]` ·
`[handoff]` (friction that lives *between* phases). Newest at the bottom.

---

- `[scaffold]` 2026-07-16 — **Codex agent format in the vision doc was wrong.** The scaffold spec assumed `.codex/agents/*.toml` persona files. Live `codex` 0.144.0 exposes **no** agents/personas subcommand and `~/.codex/agents/` is empty. The Executor role is carried by `AGENTS.md` + invocation-time `codex exec -m <model> -C <repo>`. The provisioner's on-disk assumption was wrong — an automated provisioner must verify harness surfaces against a live instance, not from memory or a doc.
- `[scaffold]` 2026-07-16 — **The QA squad was authored at USER scope.** The four `qa-*` agents and the `qa-gate` skill were sitting in `~/.cursor/agents/` and `~/.cursor/skills/`, applying to *every* repo on the machine — global-scope pollution. An agent writing config at the wrong scope is *literally* the provisioning problem this whole system exists to solve. Rebuilt project-scoped under `.cursor/`; the user-level copies were deleted after the project copies were committed.
- `[scaffold]` 2026-07-16 — **No browser MCP for the Cursor CLI.** The `qa-browser-e2e` lane needs Playwright/browser tooling, but Cursor's user-level `mcp.json` registers none. Closing the gap **project-scoped** in `.cursor/mcp.json` — registering it at user level would have repeated the wrong-scope friction above.
- `[scaffold]` 2026-07-16 — **Every role file exists twice.** `blueprint/` holds the SSOT; the native harness locations hold hand-copied provisioned duplicates, with no sync between them. Editing intent means editing two files and remembering the mapping. This hand-provisioning ceremony is exactly what an automated provisioner must own.
