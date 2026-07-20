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

- **phase:** run 1 ✅ **COMPLETE & MERGED** — plan → execute → review → QA (PASS) → PR → PR-feedback → **merge** (PR #1, `c74c305`, 2026-07-20). Run 2 not started.
- **branch:** none active — `feat/subscription-crud` merged + deleted; `main` @ `c74c305`.
- **full run-1 record:** [`docs/runs/run-1/RETROSPECTIVE.md`](docs/runs/run-1/RETROSPECTIVE.md) (+ evidence alongside it).
- **plan:** `docs/plans/2026-07-16-001-run-1-subscription-crud.md`
- **next:** Run 2 kickoff (Architect/Plan) on a fresh `feat/*` branch — see the run-2 backlog below.

## Latest handoff  (Run 1 → closed; next: Run 2 kickoff)

- **Run 1 shipped end to end** across 4 harnesses (Claude / Codex / Cursor + Jarod merge). PR #1
  merged to `main` at `c74c305` (2026-07-20); branch deleted; main synced. The full **retrospective +
  Agent-OS design brief + durable evidence** (QA report, AC9 screenshot, Codex rollout audit) is in
  [`docs/runs/run-1/`](docs/runs/run-1/). Frictions → `FRICTION.md`; design threads + answered post-run
  checklist → `docs/OBSERVATIONS.md`; process SSOT (incl. Phase 6) → `blueprint/workflow.md`.
- **Run-2 backlog (carried):** delete-race → `useFetcher()` swap (the one deferred **code** item);
  overflow error-message precision (optional polish). Everything in RETROSPECTIVE §6 P2 is Agent-OS
  design work, not run-2 app scope.
- **What the next harness (Run 2 Architect) does:** pick the run-2 slice from the plan's feature ladder
  (renewal-soon flags / monthly-spend total — the run-1 plan's non-goals), write the plan with
  acceptance criteria on a fresh branch, and re-seed this brain. Nothing blocking.

## Log  (append one line per phase; newest at the bottom)

- 2026-07-16 claude/architect: scaffold + blueprint provisioned; run-1 plan written with acceptance criteria.
- 2026-07-17 claude/architect: added HANDOFF brain + Playwright skills; ready for execute.
- 2026-07-18 claude/architect: live-verified the Herdr loop in a pane — corrected workflow.md orchestration (pane run not agent send; --source visible; split→run pattern; clear trust dialog; idle≠ready). 4 frictions logged. Repo restored to main (Codex had auto-created the branch during the test).
- 2026-07-18 claude/architect: smoke-tested the Cursor QA pane — Herdr tracks cursor status; playwright MCP picked up (approve via send-keys a, not pane run); Composer 2.5 pin holds; `pane run` TYPES but doesn't SUBMIT to Cursor's composer (needs discrete send-keys Enter). Corrected the QA step in workflow.md; 2 more frictions logged.
- 2026-07-18 codex/executor: implemented + verified AC1–AC11 on `feat/subscription-crud` (`cd4b984`); ready for Claude review.
- 2026-07-18 claude/reviewer: SIGN-OFF — live-verified AC1+AC11, code-confirmed AC2–AC9; 1 accepted non-AC nit (delete race → run 2); handed the QA gate a contract with window.confirm + db-reset + port-3000 notes.
- 2026-07-19 cursor/qa-gate: PASS + OPEN_PR — all 11 AC met (3 lanes + skeptic); needed `--force --approve-mcps` (Herdr send-keys can't drive Cursor's per-command approvals — key Phase-4 finding); no PR opened by gate. Claude opening the PR.
- 2026-07-19 claude/pr: opened PR #1 (feat/subscription-crud → main) on PASS+OPEN_PR; verified base/head/tip + state OPEN. **Run-1 loop complete through PR — awaiting Jarod's merge.**
- 2026-07-19 codex/executor: applied both PR #1 review fixes (safe-cent overflow boundary + route error messages); 12 tests and typecheck green, committed locally for the orchestrator.
- 2026-07-19 claude/pr-feedback: triaged 4 bot comments (all fix) via Phase-6 model — Codex fixed #1/#4 (`02d8532`), Claude fixed #2/#3 (`f4c5e7a`); re-verified 12/12 tests + typecheck + build; pushed; bots confirmed + all 4 threads resolved. **PR #1 ready — awaiting Jarod's merge.**
- 2026-07-20 claude/pr-feedback+close: bot-review rounds 2–3 (8 comments total → 6 fixed, 2 disregarded w/ rationale, all resolved); captured the Phase-6 terminate-timing lesson; recovered durable evidence + wrote `docs/runs/run-1/RETROSPECTIVE.md` (Agent-OS design brief incl. Codex rollout audit → 4 subagents at Sol/xhigh, ~3× simplify cost).
- 2026-07-20 jarod/merge: PR #1 merged to `main` (`c74c305`); `feat/subscription-crud` deleted; main synced. **RUN 1 DONE.** Run 2 not started.
