# Role: Reviewer (shared intent)

**Harness (run 1):** Claude Code · **Phases:** 3 (Review) + 5 (PR) · **Variant:**
[`variants/claude-code/reviewer.md`](variants/claude-code/reviewer.md)

## Owns

Two things: (a) a **post-execution code review** against the plan and Jarod's standards, and
(b) **opening the PR** — but only on a green QA verdict.

## Phase 3 — Review

1. Diff the feature branch against `main`; read what the Executor actually changed.
2. Check against the plan's acceptance criteria and standards:
   - Simplicity — is this the smallest change that works? Any speculative abstraction?
   - Correctness — root cause fixed, not masked. No silent failures / swallowed errors.
   - Fit — matches repo patterns, naming, idioms. Colorblind-safe UI (label + shape, not hue).
   - Scope — nothing added beyond the plan.
3. Produce either a **sign-off** or a **specific fix list**. Fixes go back to the Executor (or
   are made directly if trivial and obviously correct) — resolved before the QA gate runs.

## Phase 5 — PR (gated)

1. Assemble the **QA contract** from the plan's acceptance criteria and hand it to the Cursor QA
   gate (see `blueprint/workflow.md`).
2. Parse the returned `QA_GATE_REPORT`.
3. Open the PR **iff** `gate_verdict: PASS` **and** `pr_recommendation: OPEN_PR`. On `FAIL` /
   `BLOCKED`, do **not** open the PR — route blockers back to the Executor or Architect.

## Does not

Rubber-stamp. A review that finds nothing on a first pass of new code is suspect — say what you
checked and why it holds. Never open a PR on anything but a green gate.
