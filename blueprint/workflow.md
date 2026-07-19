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

**The carrier is [`HANDOFF.md`](../HANDOFF.md) — the project brain.** Every phase reads it at
start and updates it at end (`## Now`, `## Latest handoff`, one `## Log` line). The pane prompt
points at `HANDOFF.md` + the plan; it does **not** re-inject the whole task. What each boundary
adds *on top of* the running brain:

1. **Plan → Execute.** The Architect's plan in `docs/plans/`, containing an **Acceptance
   Criteria section written as verifiable pass/fail bullets**. This is mandatory: the QA gate
   returns `BLOCKED` without it, and criteria written *after* code exists degenerate into
   "assert whatever got built." Architect seeds `HANDOFF.md` (Plan → Execute block).
2. **Execute → Review.** Working tree on the feature branch + the Executor's handoff block in
   `HANDOFF.md` (built · decisions · open disagreements · next).
3. **Review → QA.** Review sign-off (or fix list resolved) written to `HANDOFF.md` + the **QA
   contract** (below), assembled by Claude Code from the plan's acceptance criteria.
4. **QA → PR.** The machine-readable `QA_GATE_REPORT` (verdict also summarized into `HANDOFF.md`).
   Claude opens the PR **iff** `gate_verdict: PASS` **and** `pr_recommendation: OPEN_PR`.

## WHAT vs HOW (QA ownership)

- **WHAT must be true → the Architect, at plan time** (acceptance criteria as pass/fail bullets).
- **HOW to verify → the QA lead, at gate time** (the parent Cursor agent running `qa-gate`:
  designs the test approach, fans out specialists, scopes regression to changed paths, aims the
  skeptic at the riskiest PASS claims, emits the verdict). The QA lead must **never invent
  acceptance criteria** not in the contract — that is scope-drift wearing a QA badge.

---

## Orchestration — the Herdr loop (Claude drives)

**Claude Code owns the run end to end through Herdr.** It spawns the Executor and QA panes,
watches them, runs the review ↔ fix cycle, and opens the PR. **Verified live in a Herdr pane on
2026-07-18** (herdr 0.7.4) — the pattern below came from actually driving a Codex pane, which
corrected several assumptions.

Herdr primitives Claude uses (the control target is the **pane id**, read from JSON — never guess):

| Need | Command |
|---|---|
| Split a sibling pane | `herdr pane split --current --direction down\|right --no-focus` → read `result.pane.pane_id` |
| Launch an agent (interactive) | `herdr pane run <pid> "codex"` (bare executable; Codex defaults to `gpt-5.6-sol`) |
| Wait for a status transition | `herdr wait agent-status <pid> --status idle\|working\|done --timeout <ms>` |
| Wait until output appears | `herdr wait output <pid> --match '<text>' --regex --timeout <ms>` |
| **Submit a prompt / feedback** | **Codex:** `herdr pane run <pid> "<text>"` (text+Enter submits). **Cursor:** `pane run` only *types* — its bundled Enter becomes a newline in the composer; follow with a discrete `herdr pane send-keys <pid> Enter` to submit. |
| Press a key (dialogs / submit) | `herdr pane send-keys <pid> <key>` — a **bare** keypress (e.g. `a`, `Enter`). Use for selecting dialog options and for submitting to Cursor's composer. |
| Read a pane | `herdr pane read <pid> --source visible --lines <N>` — use **`visible`** for an agent TUI (`recent` is empty; TUIs use the alternate buffer). |

**Verified gotchas (each bit me live):**

- **`idle` ≠ ready — and dialog keystrokes are agent-specific.** A freshly launched agent can
  report `idle` while sitting on a **dialog**. Always `pane read --source visible` after idle and
  clear it **before** sending the task. Codex's *directory-trust* prompt (numbered) accepts with
  `pane run <pid> "1"`. Cursor's *MCP-approval* prompt (letter keys — it prompts to approve the
  project `playwright` MCP on every launch) accepts only with a **bare** `pane send-keys <pid> a`;
  `pane run "a"` does **not** work (its Enter breaks the selection). Both verified live.
- **Codex may auto-update on launch** (it upgraded 0.144.0 → 0.144.6 mid-verification and dropped
  to a shell). Re-check `pane get <pid>` shows `agent: codex` before proceeding.
- **Codex is eager and auto-approved.** Given a trivial prompt it read `AGENTS.md` and ran
  `git switch -c feat/subscription-crud` itself (an auto-approver allowed the command). Desired
  during the real run — just expect it, and don't be surprised by branch/command side effects.
- Completion reports `idle` in the watched/active tab, `done` in a background tab — treat either as
  complete.

### The loop

1. **Plan.** Write the plan + seed `HANDOFF.md`. No pane yet.
2. **Execute — spawn Codex, clear its dialog, submit, watch.**
   ```bash
   PID=$(herdr pane split --current --direction down --no-focus | jq -r .result.pane.pane_id)
   herdr pane rename "$PID" executor
   herdr pane run "$PID" "codex"
   herdr wait agent-status "$PID" --status idle --timeout 60000
   herdr pane read  "$PID" --source visible --lines 20     # inspect: trust dialog?
   herdr pane run   "$PID" "1"                              # accept Codex directory-trust (if shown)
   herdr pane run   "$PID" "Read HANDOFF.md and the plan it points to. Implement on feat/subscription-crud per your AGENTS.md role and the plan's Acceptance Criteria. Do not open a PR. Update HANDOFF.md when done."
   herdr wait agent-status "$PID" --status working --timeout 30000
   herdr wait agent-status "$PID" --status idle    --timeout 1800000   # or --status done if backgrounded
   ```
3. **Review ↔ fix (loop until clean).**
   ```text
   read HANDOFF.md (Executor block) + `git diff main...feat/subscription-crud`
   review vs acceptance criteria + standards
   while issues:
       herdr pane run "$PID" "<numbered fix list>"
       herdr wait agent-status "$PID" --status working ; herdr wait agent-status "$PID" --status idle
       re-review the new diff
   write the Review → QA block to HANDOFF.md
   ```
4. **QA gate — spawn Cursor *in auto-run mode*, submit the contract, watch for the verdict.**
   Interactive Cursor prompts **per command**, and Herdr's `send-keys` **cannot** deliver Cursor's
   approval chords — `Tab` ("allowlist") and `Shift+Tab` ("Run Everything") both collapse to a
   single-approve, so the gate is **undriveable** one command at a time (proven live 2026-07-19).
   Launch with **`--force`** (= the dialog's "Run Everything"; keeps the interactive TUI — this is
   NOT `--print` headless, so it honors "Herdr wants interactive panes") and **`--approve-mcps`**
   (auto-approves the project `playwright` MCP, so no launch dialog). `--force` removes the *prompt*,
   not the *visibility*: every command still streams to the pane. Do **not** add `--sandbox` (the
   ACs need the dev server to bind `:3000` and write `data/app.db`).
   ```bash
   CPID=$(herdr pane split --current --direction right --no-focus | jq -r .result.pane.pane_id)
   herdr pane rename "$CPID" qa-gate
   herdr pane run       "$CPID" "agent --model composer-2.5 --force --approve-mcps"
   herdr wait agent-status "$CPID" --status idle --timeout 60000   # TUI ready (corner shows "Run Everything")
   herdr pane read      "$CPID" --source visible --lines 20        # confirm composer ready, no MCP dialog
   herdr pane run       "$CPID" "<qa-gate contract prompt — see Pane details>"
   herdr pane send-keys "$CPID" Enter                              # Cursor: pane run TYPES; discrete Enter SUBMITS
   # completion, not content: the parent returns to idle (active tab) / done (backgrounded) when the
   # gate finishes. Do NOT `wait output --match gate_verdict` — the submitted contract text contains
   # "gate_verdict", so it false-matches immediately. Poll status for idle|done instead.
   herdr wait agent-status "$CPID" --status idle --timeout 1800000
   herdr pane read      "$CPID" --source visible --lines 70        # capture QA_GATE_REPORT (verdict at the tail)
   ```
5. **PR.** Parse `gate_verdict` + `pr_recommendation`; on `PASS` + `OPEN_PR`, `gh pr create …` and
   update `HANDOFF.md`. On `FAIL`/`BLOCKED`, re-enter the loop with the blockers — do **not** open
   the PR.

---

## Pane details — interactive launch, the prompt to send, and the contract

Per Herdr's `SKILL.md` and verified live: **launch each pane's bare interactive executable — no
task in argv, no non-interactive flags — then drive it with `herdr pane run <pid> "<text>"`** (the
loop above has the exact spawn → clear-dialog → submit sequence). A model pin is optional (Codex
defaults to `gpt-5.6-sol`; Cursor takes `--model composer-2.5`). CLIs verified 2026-07-18: codex
0.144.6, cursor-agent 2026.07.13, herdr 0.7.4.

### Phase 2 — Codex (Executor)

Codex has **two** real role surfaces (see `.codex/README.md`): the interactive session reads
repo-root **`AGENTS.md`** (project context — the driver here), and the Executor is **also** a
project-scoped custom subagent at **`.codex/agents/executor.toml`** (spawnable via delegation). The
task text `pane run` submits:

> Read HANDOFF.md and the plan it points to. Implement on feat/subscription-crud per your AGENTS.md
> role and the plan's Acceptance Criteria. Do not open a PR. Update HANDOFF.md when done.

### Phase 4 — Cursor (QA gate)

Verified live 2026-07-19: launch `agent --model composer-2.5 --force --approve-mcps`. The TUI opens
straight on the composer (corner shows **"Run Everything"**); model resolves to **Composer 2.5** (no
fallback), and `--approve-mcps` clears the project `playwright` MCP with no dialog. Then `pane run`
the contract **and follow with `pane send-keys <pid> Enter`** to submit it (Cursor's `pane run` only
*types*; the discrete Enter submits — see the loop). The contract:

```text
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

Launch /qa-smoke, /qa-regression, and /qa-browser-e2e in parallel (skip e2e only if ui is n/a
and criteria have no UI). Then run /qa-skeptic-verifier on their reports. Emit QA_GATE_REPORT only.
```

**Resolved live 2026-07-19 (this WAS the run-1 confirmation item):** the QA specialists **do** hit
per-command approval prompts during the gate (git/lsof/bun/playwright), and Herdr's `send-keys`
**cannot** clear them — `Tab`/`Shift+Tab` both register as a single-approve, so "allowlist" never
sticks and "Run Everything" never triggers. The **only** way to drive the gate through Herdr is to
launch with `--force --approve-mcps` (above). This does **not** violate "Herdr wants interactive
panes": `--force`/`--yolo` keep the interactive TUI and full command visibility — only `--print`
(headless) and `--trust` (which requires `--print`) are the forms to avoid.

> Non-Herdr one-shot forms exist (`codex exec …`, `agent --print …`) for CI or standalone smokes —
> the step-5 dry-run used them — but they are **not** the Herdr loop.

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

`qa-browser-e2e` needs Playwright tooling in the Cursor CLI session. Two forms are installed as
**project skills** (`skills-lock.json`, reinstallable via `npx skills add`):

- **Playwright CLI / codegen** (`playwright-cli` skill) — ~75% fewer tokens; prefer for exercising
  known acceptance flows and any bulk work.
- **Playwright MCP** (`@playwright/mcp`, project-scoped in [`../.cursor/mcp.json`](../.cursor/mcp.json)
  — never user level, that repeats the wrong-scope friction) — for live DOM inspection / debugging.

Match tool to need (economics: MCP ≈114k tok/session, CLI ≈27k, codegen 0 — see `docs/OBSERVATIONS.md`).
Confirm availability inside the Cursor session before the gate; if unavailable, the lane reports
`BLOCKED` (not a silent PASS) and the tooling is a friction entry.

## Dry-run verification (2026-07-16, pre-run-1)

Each pane smoke-tested standalone (checklist step 5). All green:

- **Codex executor — AGENTS.md path.** `codex exec -m gpt-5.6-sol -s read-only` auto-loaded
  `AGENTS.md` and correctly recited the Executor role ("I must never open or merge a PR"). Model
  header showed `gpt-5.6-sol`; pin holds.
- **Codex executor — subagent path.** `codex exec … "delegate to the custom agent named
  'executor'"` spawned the `.codex/agents/executor.toml` subagent, which returned its own name +
  rule #1 verbatim. The TOML custom-agent format works end to end. (A passive "list your agents"
  prompt returns "none configured" — subagents surface via delegation, not self-report.)
- **Cursor model pins** — `agent models` lists 189 models; all four QA pins resolve **exactly**
  (`composer-2.5`, `composer-2.5-fast`, `claude-sonnet-5-thinking-high`,
  `claude-opus-4-8-thinking-high`). No silent fallback.
- **Cursor discovery** — `agent --workspace . --model composer-2.5 --print` discovered all four
  project-scoped subagents with correct pins + the `qa-gate` skill.
- **Still open for run 1:** whether the project-scoped Playwright MCP actually loads *inside* a
  Cursor gate session (the smoke didn't drive a browser — no app yet). Confirm at the first real
  gate; `BLOCKED`, not silent PASS, if not.
