# HANDOFF — project brain

The living state of the multi-harness run. **Every harness reads this at the start of its phase
and updates it at the end.** It carries intent between harnesses so the next one — and a
returning Architect — gets caught up in minutes instead of re-deriving context. The prompt that
launches a pane should point *here* + the plan, not re-inject the whole task.

**Protocol (every phase):** (1) read `## Now` + `## Latest handoff`; (2) do your phase; (3) update
`## Now`, overwrite `## Latest handoff` with your outgoing block, append one line to `## Log`.
Keep it tight — this is a state file, not a narrative.

---

## Now

- **phase:** plan ✅ (run-1 plan written) → **execute** (next)
- **branch:** `feat/subscription-crud` (not yet created — Executor creates it)
- **plan:** `docs/plans/2026-07-16-001-run-1-subscription-crud.md`
- **next harness:** Codex (Executor)

## Latest handoff  (Architect → Executor)

- **Built / done:** Scaffold + blueprint + provisioned harness config; run-1 plan with 11
  pass/fail acceptance criteria; all three panes dry-run green.
- **Decisions made:** Stack = Bun · React Router 7 · Tailwind + shadcn/ui · SQLite + Drizzle.
  `monthlyCost` stored as integer cents. Colorblind-safe from day one.
- **Open disagreements / risks:** Port in the QA contract says `:3000`; RR7/Vite likely `:5173` —
  Executor confirms and updates the plan's QA-contract seed. Playwright-MCP-inside-Cursor-gate
  unproven (first real gate confirms).
- **What the next harness MUST do:** Create `feat/subscription-crud`; implement the plan so every
  acceptance criterion passes; do NOT open a PR; write your Executor handoff block here when done.

## Log  (append one line per phase; newest at the bottom)

- 2026-07-16 claude/architect: scaffold + blueprint provisioned; run-1 plan written with acceptance criteria.
- 2026-07-17 claude/architect: added HANDOFF brain + Playwright skills; ready for execute.
- 2026-07-18 claude/architect: live-verified the Herdr loop in a pane — corrected workflow.md orchestration (pane run not agent send; --source visible; split→run pattern; clear trust dialog; idle≠ready). 4 frictions logged. Repo restored to main (Codex had auto-created the branch during the test).
