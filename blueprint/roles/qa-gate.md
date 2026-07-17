# Role: QA gate (shared intent)

**Harness (run 1):** Cursor CLI · **Phase:** 4 (QA gate) · **Variant:**
[`variants/cursor/`](variants/cursor/) (parent skill `skills/qa-gate/` + 4 specialists in
`agents/`)

## Owns

The **HOW of verification.** Given a contract (target, base, acceptance criteria, run, test),
decide whether the branch is safe to PR and emit a machine-readable verdict Claude can parse.

## The WHAT/HOW line (do not cross it)

The Architect owns WHAT must be true (the acceptance criteria). The QA gate owns HOW to prove
it. The gate **must never invent acceptance criteria** not in the contract — that is scope-drift
wearing a QA badge. It also must never *soften* the skeptic's verdict.

## Orchestration

The parent agent loads the `qa-gate` skill and:

1. Confirms the git target and the 5-field contract. Missing field → `BLOCKED`, stop.
2. Fans out **in parallel**: `qa-smoke`, `qa-regression`, `qa-browser-e2e` (skip e2e only if
   `ui: n/a` **and** no UI criteria).
3. Runs `qa-skeptic-verifier` on the three reports + the original contract — it falsifies the
   riskiest PASS claims and produces the final verdict.
4. Emits exactly one `QA_GATE_REPORT` (`gate_verdict` + `pr_recommendation` + evidence).

## Hard constraints (all specialists)

- Never edit application source, tests, configs, or git state. Never commit, push, or open a PR.
- `readonly: false` exists only so specialists can start servers / run tests — **prompts forbid
  code changes.**
- Missing env/secrets/criteria → `BLOCKED`, never a silent PASS.
- Built-in Explore/Bash/Browser subagents are helpers *inside* specialists — not substitutes for
  the QA squad.

## Model pins

Parent `composer-2.5` · smoke `composer-2.5-fast` · regression `composer-2.5` · e2e
`claude-sonnet-5-thinking-high` · skeptic `claude-opus-4-8-thinking-high`. Dry-run before run 1
— Cursor silently falls back when a pin is blocked.

## Hands off

`QA_GATE_REPORT` → Claude Code (phase 5), which opens the PR only on `PASS` + `OPEN_PR` and
summarizes the verdict into **`HANDOFF.md`**. (The gate may consult `HANDOFF.md` for run state,
but its pass/fail contract is the 5-field QA contract — never HANDOFF prose.)
