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

- **phase:** plan ✅ → execute ✅ → review ✅ → **QA gate** (next)
- **branch:** `feat/subscription-crud` (impl `cd4b984`; review-docs commit is the current tip)
- **plan:** `docs/plans/2026-07-16-001-run-1-subscription-crud.md`
- **next harness:** Cursor CLI (QA gate)

## Latest handoff  (Reviewer → QA gate)

- **Review verdict: SIGN-OFF.** A line-by-line read of the data layer, routes, validation, form,
  and error boundary + an independent code-reviewer sweep both came back clean (0 blockers). Claude
  **live-verified AC1** (`bun run dev` → `GET /` 200 with a real `<h1>Subscriptions</h1>`; clean SSR
  log through `better-sqlite3`, the driver the tests don't cover) and **AC11** (`bun test` 10/10,
  `typecheck` exit 0, `build` exit 0). AC2/3/4/5/6/8/9 confirmed in source: server-side validation
  blocks bad input (returns 400 + field errors, never writes), money is integer cents with safe
  `Math.round(x*100)`, colorblind-safe affordances are always icon+text, never bare hue.
- **Accepted run-1 limitation (NOT a blocker, do not fix now):** row delete is a navigation `<Form>`,
  so a *race* (stale second tab resubmitting an already-deleted row) 404s into a full-page error
  boundary. Off every AC path — single-session CRUD works. Deferred to run 2 as a `useFetcher()` swap;
  fixing it in run 1 would be scope creep.
- **QA must verify (the browser-gated ACs):** AC7 restart-persistence (create → restart dev → still
  listed, SQLite file) and AC10 clean console over create→edit→delete; re-confirm AC1–AC6/AC8/AC9 live.
- **Orchestration notes for the gate (so it passes first-try):** (1) delete is guarded by a
  **`window.confirm`** dialog — the browser lane MUST accept it (`page.on('dialog', d => d.accept())`)
  or AC6 false-fails. (2) `data/app.db` carries state from Codex's own browser testing — **delete it
  before the empty-state check** (AC2); migrations recreate it on boot. (3) app runs on
  **`http://localhost:3000`** (pinned in the `dev` script; the earlier `:3000`/`:5173` uncertainty is
  resolved to 3000).
- **What the next harness MUST do:** Run `qa-gate` per its contract against the branch tip; emit
  `QA_GATE_REPORT` with `gate_verdict` + `pr_recommendation`. Do NOT open a PR — Claude does that, and
  only on `PASS` + `OPEN_PR`.

## Log  (append one line per phase; newest at the bottom)

- 2026-07-16 claude/architect: scaffold + blueprint provisioned; run-1 plan written with acceptance criteria.
- 2026-07-17 claude/architect: added HANDOFF brain + Playwright skills; ready for execute.
- 2026-07-18 claude/architect: live-verified the Herdr loop in a pane — corrected workflow.md orchestration (pane run not agent send; --source visible; split→run pattern; clear trust dialog; idle≠ready). 4 frictions logged. Repo restored to main (Codex had auto-created the branch during the test).
- 2026-07-18 claude/architect: smoke-tested the Cursor QA pane — Herdr tracks cursor status; playwright MCP picked up (approve via send-keys a, not pane run); Composer 2.5 pin holds; `pane run` TYPES but doesn't SUBMIT to Cursor's composer (needs discrete send-keys Enter). Corrected the QA step in workflow.md; 2 more frictions logged.
- 2026-07-18 codex/executor: implemented + verified AC1–AC11 on `feat/subscription-crud` (`cd4b984`); ready for Claude review.
- 2026-07-18 claude/reviewer: SIGN-OFF — live-verified AC1+AC11, code-confirmed AC2–AC9; 1 accepted non-AC nit (delete race → run 2); handed the QA gate a contract with window.confirm + db-reset + port-3000 notes.
