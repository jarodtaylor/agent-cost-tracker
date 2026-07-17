# agent-cost-tracker — Claude Code instructions

> Provisioned from `blueprint/roles/variants/claude-code/{architect,reviewer}.md` (the SSOT).
> Edit intent there, then re-provision. The full SDLC map + pane commands live in
> [`blueprint/workflow.md`](blueprint/workflow.md).

Claude Code owns **three** phases of the multi-harness pipeline: **Architect** (plan),
**Reviewer** (post-execution review), and **PR** (open the PR, gated on the QA verdict). Codex
executes; Cursor runs the QA gate.

## Standing standards (all phases)

- **Simplicity first** — smallest change that satisfies the acceptance criteria. No speculative
  abstraction.
- **Read before you write** — never change code you haven't read; match repo patterns/idioms.
- **Root causes, not band-aids** — no temporary fixes, no silent failures / swallowed errors.
- **Feature branch + PR** — application code never lands on `main` directly. `main` is protected
  by convention. Run 1 lands on `feat/subscription-crud`.
- **Colorblind-safe** — where color conveys meaning, pair it with a text label + shape/icon.
- **Stack** — Bun · React Router 7 · Tailwind + shadcn/ui · SQLite + Drizzle.
- **HANDOFF.md is the brain.** Read [`HANDOFF.md`](HANDOFF.md) at the start of every phase you own
  and update it at the end (`## Now`, `## Latest handoff`, one `## Log` line). The pane prompt
  points here + the plan — it does not re-inject the whole task.

## Phase 1 — Architect (plan)

1. Enter plan mode; the plan is the deliverable.
2. Write it to `docs/plans/` as `YYYY-MM-DD-NNN-<slug>.md`.
3. It **must** contain an **Acceptance Criteria** section of verifiable **pass/fail** bullets —
   each a fact a QA specialist can confirm/refute with a command, HTTP status, or visible UI
   outcome. No subjective bullets. UI-with-color criteria include the colorblind-safe check.
   (The Cursor QA gate returns `BLOCKED` without this section.)
4. **Seed `HANDOFF.md`** — set `## Now` and write the Plan → Execute handoff block (what's decided,
   open risks, what the Executor must do).

## Phase 3 — Review

```bash
git diff main...feat/subscription-crud --stat   # scope
git diff main...feat/subscription-crud          # read every change
```

Read `HANDOFF.md` first (the Executor's block — built, decisions, open disagreements) so you
review against what actually happened, then diff. Check simplicity · correctness (root-cause, no
silent failures) · repo-fit · colorblind-safe · no scope creep. Output a **sign-off** or a
numbered **fix list**. Trivial+obvious fixes may be made directly; anything else routes back to
the Executor. Resolve all before the QA gate, then write the Review → QA handoff to `HANDOFF.md`.

## Phase 5 — PR (gated)

1. Assemble the **QA contract** (5 fields: target, base, acceptance_criteria, run, test — see
   `blueprint/workflow.md`) from the plan's acceptance criteria.
2. Run the Cursor QA gate pane; capture the `QA_GATE_REPORT`.
3. Parse `gate_verdict` + `pr_recommendation`. Open the PR **iff** `PASS` + `OPEN_PR`:
   ```bash
   gh pr create --base main --head feat/subscription-crud \
     --title "feat: subscription CRUD" --body "<summary + AC checklist + plan link + QA verdict>"
   ```
   On `FAIL` / `BLOCKED`: do **not** open the PR — route blockers back. **Jarod merges** (the
   run-1 "done" line).
4. **Update `HANDOFF.md`** — summarize the QA verdict + PR/merge state so the brain reflects where
   the run ended.

## Friction

Every rough edge — tooling *or* "this handoff exists only because humans needed it" — gets one
line in [`FRICTION.md`](FRICTION.md). A messy run that captures ten "ugh" moments beats a clean
run that captures none.
