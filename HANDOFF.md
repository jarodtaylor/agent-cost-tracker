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

- **phase:** plan ✅ → execute ✅ → **review** (next)
- **branch:** `feat/subscription-crud` (implementation commit `cd4b984`)
- **plan:** `docs/plans/2026-07-16-001-run-1-subscription-crud.md`
- **next harness:** Claude Code (Reviewer)

## Latest handoff  (Executor → Reviewer)

- **Built / done:** AC1–AC11 implemented: RR7 app boots on `:3000`; empty/list states; create,
  field-level validation, edit, delete; restart-persistent SQLite; integer-cent currency formatting;
  text+icon color safety; console-clean valid CRUD flow. `bun test` = 10 pass; typecheck + production
  build green; desktop/mobile Playwright acceptance completed.
- **Decisions made:** Runtime migrations create `data/app.db` on first boot. The injected Drizzle
  data layer is tested with Bun's native in-memory SQLite driver; RR7 SSR uses `better-sqlite3`
  because its dev/production server evaluates server modules in Node. Dev uses Chokidar polling to
  avoid the multi-harness checkout's macOS watcher exhaustion.
- **Open disagreements / risks:** No plan deviations. Formal code review was intentionally left to
  the Reviewer. The provisioned Playwright CLI skill copies are stale (logged in `FRICTION.md`), but
  browser verification itself completed successfully. The mobile table scrolls horizontally.
- **What the next harness MUST do:** Review `feat/subscription-crud` from `cd4b984`, focusing on the
  Node/Bun SQLite adapter boundary, RR7 loader/action validation, migration boot behavior, and UI
  accessibility. Run `bun install`, `bun test`, `bun run typecheck`, `bun run build`, then
  `bun run dev` and exercise `http://localhost:3000`. Do not open a PR until the QA gate is green.

## Log  (append one line per phase; newest at the bottom)

- 2026-07-16 claude/architect: scaffold + blueprint provisioned; run-1 plan written with acceptance criteria.
- 2026-07-17 claude/architect: added HANDOFF brain + Playwright skills; ready for execute.
- 2026-07-18 claude/architect: live-verified the Herdr loop in a pane — corrected workflow.md orchestration (pane run not agent send; --source visible; split→run pattern; clear trust dialog; idle≠ready). 4 frictions logged. Repo restored to main (Codex had auto-created the branch during the test).
- 2026-07-18 claude/architect: smoke-tested the Cursor QA pane — Herdr tracks cursor status; playwright MCP picked up (approve via send-keys a, not pane run); Composer 2.5 pin holds; `pane run` TYPES but doesn't SUBMIT to Cursor's composer (needs discrete send-keys Enter). Corrected the QA step in workflow.md; 2 more frictions logged.
- 2026-07-18 codex/executor: implemented + verified AC1–AC11 on `feat/subscription-crud` (`cd4b984`); ready for Claude review.
