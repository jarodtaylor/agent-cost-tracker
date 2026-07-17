# Variant: Reviewer + PR — Claude Code

Implements [`roles/reviewer.md`](../../reviewer.md) in Claude Code. Provisioned into the
repo-root `CLAUDE.md` (Review + PR sections).

## Phase 3 — Review (how Claude Code runs it)

```bash
git fetch origin
git diff main...feat/subscription-crud --stat     # scope
git diff main...feat/subscription-crud            # read every change
```

Check against the plan's acceptance criteria + standards (simplicity, root-cause, repo-fit,
colorblind-safe, no scope creep, no silent failures). Output a **sign-off** or a numbered
**fix list**. Trivial + obviously-correct fixes may be made directly; anything else routes back
to the Executor. All fixes resolved before the QA gate.

## Phase 5 — PR (gated on the QA verdict)

1. Assemble the QA contract from the plan's acceptance criteria (5 required fields — see
   `blueprint/workflow.md`).
2. Run the Cursor QA gate pane; capture the `QA_GATE_REPORT`.
3. Parse:
   ```text
   **gate_verdict:** PASS | FAIL | BLOCKED
   **pr_recommendation:** OPEN_PR | DO_NOT_OPEN_PR
   ```
4. **Only** on `PASS` + `OPEN_PR`:
   ```bash
   gh pr create --base main --head feat/subscription-crud \
     --title "feat: subscription CRUD" \
     --body "<summary + AC checklist + link to plan + QA verdict>"
   ```
   On `FAIL` / `BLOCKED`: do not open the PR. Summarize blockers; route to Executor/Architect.

## Does not

Open a PR on anything but a green gate. Merge — Jarod merges (that is the run-1 "done" line).
