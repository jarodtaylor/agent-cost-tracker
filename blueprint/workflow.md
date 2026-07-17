# workflow — the SDLC map (SSOT)

The single source of truth for **who does what, in what order, and what each phase hands the
next**. Native harness config (`CLAUDE.md`, `AGENTS.md`, `.cursor/`, `.codex/`) is provisioned
*from this blueprint*. Edit intent here; re-provision downstream.

## Phase map (run 1 — fixed harnesses)

| # | Phase | Harness | Role file | Model (intent) |
|---|---|---|---|---|
| 1 | Plan | Claude Code | [`roles/architect.md`](roles/architect.md) | Opus 4.8 / Fable 5 |
| 2 | Execute | Codex | [`roles/executor.md`](roles/executor.md) | GPT-5.6 Sol |
| 3 | Review | Claude Code | [`roles/reviewer.md`](roles/reviewer.md) | Opus 4.8 / Fable 5 |
| 4 | QA gate | Cursor CLI | [`roles/qa-gate.md`](roles/qa-gate.md) | Composer 2.5 (parent) |
| 5 | PR | Claude Code | (reviewer variant, PR step) | Opus 4.8 |

Ordering (review-before-QA) is a **run-1 choice, reversible per run** — testing the ordering is
part of the point. Phase 1's harness map is fixed for run 1; swapping a phase's harness is a
run-2+ experiment.

## Branch / PR convention

- **Scaffold + blueprint** may bootstrap `main` directly (there is no base to PR against yet).
- **All application code reaches `main` through a feature branch + PR.** Run 1 lands on
  `feat/subscription-crud`. `main` is protected by convention.
- The **PR is opened by Claude Code (phase 5), and only on a green QA verdict** (below).

## Handoff contracts (what crosses each boundary)

1. **Plan → Execute.** The Architect's plan in `docs/plans/`, containing an **Acceptance
   Criteria section written as verifiable pass/fail bullets**. This is mandatory: the QA gate
   returns `BLOCKED` without it, and criteria written *after* code exists degenerate into
   "assert whatever got built."
2. **Execute → Review.** Working tree on the feature branch + a short "what I built / what I
   skipped / where I deviated" note from the Executor.
3. **Review → QA.** Review sign-off (or fix list resolved) + the **QA contract** (below),
   assembled by Claude Code from the plan's acceptance criteria.
4. **QA → PR.** The machine-readable `QA_GATE_REPORT`. Claude opens the PR **iff**
   `gate_verdict: PASS` **and** `pr_recommendation: OPEN_PR`.

## WHAT vs HOW (QA ownership)

- **WHAT must be true → the Architect, at plan time** (acceptance criteria as pass/fail bullets).
- **HOW to verify → the QA lead, at gate time** (the parent Cursor agent running `qa-gate`:
  designs the test approach, fans out specialists, scopes regression to changed paths, aims the
  skeptic at the riskiest PASS claims, emits the verdict). The QA lead must **never invent
  acceptance criteria** not in the contract — that is scope-drift wearing a QA badge.

---

## Pane invocations (Herdr-ready)

Verified against live CLIs on 2026-07-16 (codex 0.144.0, cursor-agent 2026.07.13). The exact
Codex `-m` model string is confirmed at dry-run (step 5) — the intent is GPT-5.6 Sol.

### Phase 2 — Codex executor (headless)

Codex reads the repo-root **`AGENTS.md`** for its role. There is **no** `.codex/agents` persona
file — that surface does not exist in this Codex version (see `.codex/README.md`).

```bash
codex exec \
  -C /Users/jarod/Code/personal/agent-cost-tracker \
  -m <gpt-5.6-sol> \
  -s workspace-write \
  "Implement docs/plans/<run-1-plan>.md on branch feat/subscription-crud.
   Read AGENTS.md for your role. Follow the plan's Acceptance Criteria exactly.
   Do not open a PR."
```

Useful flags: `--json` (JSONL events), `-o <file>` (write final message), `--output-schema
<file>` (force a structured final response), `-p <profile>`.

### Phase 4 — Cursor QA gate (headless)

```bash
agent --workspace /Users/jarod/Code/personal/agent-cost-tracker \
  --model composer-2.5 --print --force --trust \
  "$(cat <<'EOF'
Run the qa-gate skill as the pre-PR QA team. Do not open a PR.

## Contract
- target: feat/subscription-crud @ <sha>
- base: main
- acceptance_criteria:
  - <pass/fail bullet from the run-1 plan>
  - <bullet>
- run: bun install && bun run dev — app at http://localhost:3000
- test: bun test  (or "discover from repo")
- ui: required
- auth_seed: none
- changed_paths: <optional>

Launch /qa-smoke, /qa-regression, and /qa-browser-e2e in parallel (skip e2e only if
ui is n/a and criteria have no UI). Then run /qa-skeptic-verifier on their reports.
Emit QA_GATE_REPORT only.
EOF
)"
```

`--print` = non-interactive; `--force` (aka `--yolo`) skips per-command allow prompts; `--trust`
trusts the workspace so headless specialists can start servers / run tests without blocking.

### Parsing the QA verdict (phase 5 gate)

Claude Code looks for exactly:

```text
**gate_verdict:** PASS | FAIL | BLOCKED
**pr_recommendation:** OPEN_PR | DO_NOT_OPEN_PR
```

| Result | Claude action |
|---|---|
| `PASS` + `OPEN_PR` | May open the PR |
| `FAIL` / `BLOCKED` / anything else | **Do not** open the PR |

## QA contract — the 5 required fields

If any is missing, the gate returns `gate_verdict: BLOCKED`:

1. **target** — branch and/or commit SHA
2. **base** — usually `main` (diff scope)
3. **acceptance_criteria** — pass/fail bullets from the plan
4. **run** — how to install/start the app (+ base URL if UI)
5. **test** — how to run automated tests, or `"discover from repo"`

Optional: `ui: required | n/a`, `auth_seed`, `changed_paths`.

## Model pins (verified on Jarod's Cursor Pro+; **dry-run before run 1** — silent-fallback trap)

| Agent | Model pin |
|---|---|
| qa-gate parent | `composer-2.5` |
| qa-smoke | `composer-2.5-fast` |
| qa-regression | `composer-2.5` |
| qa-browser-e2e | `claude-sonnet-5-thinking-high` |
| qa-skeptic-verifier | `claude-opus-4-8-thinking-high` |

**Trap:** when a pin is blocked or Max Mode is off, Cursor **silently falls back** to another
model. Run `agent models` and a cheap smoke prompt per specialist before run 1; a wrong model in
the gate is an invisible correctness hole.

## Browser E2E dependency

`qa-browser-e2e` needs Playwright / browser tooling in the Cursor CLI session. There is **no**
browser MCP at Cursor user level, so it is registered **project-scoped** in
[`../.cursor/mcp.json`](../.cursor/mcp.json) — never at user level (that repeats the wrong-scope
friction). Confirm availability inside the Cursor session before the gate; if unavailable, the
lane reports `BLOCKED` (not a silent PASS) and the ordering/tooling is a friction entry.
