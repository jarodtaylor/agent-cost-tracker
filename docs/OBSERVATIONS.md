# OBSERVATIONS — deferred design + post-run review

A running log of design threads to revisit and questions to answer **after** runs, distinct from
`FRICTION.md` (live, one-line run friction). Captured from Jarod's north-star brain-dumps so they
don't get lost. **Nothing here is run-1 scope** unless promoted explicitly.

## Scope reminder — what run 1 is actually testing

Run 1's purpose is **mechanical**: does the loop work — Claude (plan) → Codex (execute) → Claude
(review) → Cursor (QA gate) → Claude (PR) — **regardless of output quality?** We run it knowing
the output will not be cohesive without strong memory contracts, durable specs, and mature
planning tooling. A messy pass that proves the plumbing + captures friction is a win. Quality
lift comes in later runs.

## Post-run review checklist (run the session back after each run)

> **Run 1 answers → [`runs/run-1/RETROSPECTIVE.md`](runs/run-1/RETROSPECTIVE.md) §2.**

- **Did Codex spawn its own subagents?** How many, and for what? Was the work parallelizable /
  fanned out, or sequential? Codex can orchestrate its own subagents — we want the *data* on what
  it does autonomously before deciding what to enforce.
- **What models + thinking levels did those subagents use?** Model-routing principle:
  **Codex Sol ≈ Fable/Opus** (heavy, best reasoning, most expensive) and **Codex 5.6 Terra ≈
  Sonnet** (faster/cheaper, very capable, often the *better* call). Just as we wouldn't use
  Fable/Opus for every delegated task, the Executor shouldn't burn Sol on work Terra handles well.
- **Handoff quality:** where did context/intent drift between harnesses? Which handoff was
  weakest?

## Deferred design threads (future runs / sessions)

### Codex Executor — orchestration & model routing
Once we have run data: decide whether to (a) let Codex route/spawn subagents autonomously, (b)
enforce model/effort choices in the Executor instructions, or (c) build **role-specific Codex
subagents** in `.codex/agents/` (Executor/Orchestrator, Frontend, Backend, …) and/or
**stack-specific skills**, or a combination. Data first, then decide. → **Run-1 data now in
[`runs/run-1/RETROSPECTIVE.md`](runs/run-1/RETROSPECTIVE.md) §2/§6:** Codex spawned **4 subagents
autonomously** (1 sequential data slice + a 3-way parallel simplify panel), all at **Sol/xhigh** — the
parallel pass ~3× output cost for 7 cleanups. Strong early evidence for option (b), enforcing tiers.

### Handoffs & drift — durable per-project handoff docs
Interim: a `HANDOFF.md` "brain" file each harness reads at start and updates at end (built /
decisions / open disagreements / state) so the next harness — and a returning Architect — gets
caught up in minutes instead of re-deriving context. This matures into real memory contracts.

### Planning tooling → durable planning docs (the real fix)
Today we use **no** workflow plugins (compound-engineering, superpowers, Addy Osmani's
agent-skills, etc.). The durable lift: something like **compound-engineering**, where
`ce-strategy` / `ce-brainstorm` / `ce-plan` (Architect/Advisor/Orchestrator = Claude) all emit
durable project docs, and `ce-work` / `ce-code-review` (Builder/Executor = Codex) are pointed at
`docs/plans/<feature>-<plan>.md`. Then the handoff *is* the doc, not an injected prompt. Either
adopt a plugin or build our own equivalent.

### Browser QA — Playwright MCP vs CLI vs codegen (trial & error)
Token economics (testdino.com/blog/playwright-tests-with-cursor): **MCP ≈114k tok/session** (live
DOM inspection, single-test debugging) · **CLI ≈27k tok** (~75% less; batch-generating 3+ tests)
· **codegen 0 tok** (recording known flows). Open question for the `qa-browser-e2e` lane: drive
acceptance flows live via MCP (pricey per gate), or generate persistent Playwright specs via
CLI/codegen that `qa-regression` then runs cheaply every gate? Decide with run data.

## Run-1 findings → Agent OS design threads (2026-07-19)

Elevated from `FRICTION.md` (raw log) into design questions **Agent OS** must answer. Surfacing these
before we build the real workflows is the whole point of the dogfood.

### Harness command-execution authorization (the biggest one)
The Cursor QA gate was **undriveable interactively through Herdr** — Cursor prompts per-command and
`send-keys` can't deliver its `Tab`/`Shift+Tab` approval chords (both collapse to a single-approve).
It only ran once launched with `--force` (unrestricted auto-run) + `--approve-mcps`, which required an
**explicit human authorization** (the permission classifier correctly gated the escalation). Agent OS
must define the *grant-autonomy* decision point per harness: per-command approval (doesn't scale
through a multiplexer), launch-time auto-run flags gated by a human/policy, or a smart-auto classifier
(`--auto-review`). This is a first-class policy surface, not an incidental flag.

### PR-feedback resolution is a real phase (now Phase 6 in `workflow.md`)
Decision captured: triage-always-orchestrator → route-by-nature (substantive→Executor, trivial/docs→
orchestrator) → scoped re-QA on behavior changes → terminate (never chase a green bot score) →
orchestrator owns threads + audit trail → deferrals feed the roadmap. Agent OS open Qs: is the triage
itself a gated artifact (like the plan's ACs)? who arbitrates contested defer/disregard calls? how are
deferrals tracked as a durable backlog rather than PR-thread ephemera? **Mechanics learned (round 1,
2026-07-19):** CodeRabbit auto-resolves + confirms its own threads on re-review; Copilot does not
(manual GraphQL `resolveReviewThread`). Disposition replies + fix commits all post under the **human's**
GitHub identity — Agent OS needs per-agent identities (bot app / scoped token per harness) for honest
attribution. First round was high-signal (4 comments, 0 noise, all fixed in one cycle) — but that's one
data point; the triage layer exists for the noisier PRs to come.

### Cross-harness contracts must be structured, not prose
The gate emitted `gate_verdict: PASS`, not the spec's literal `**gate_verdict:**` — a strict automated
parser would have mis-gated the PR. Verdicts/handoffs one harness parses from another's output can't
depend on markdown emphasis a TUI may re-render. Agent OS needs machine-readable contracts (fenced
block / structured output / exit code), not string-matching on rendered prose.

### Control-surface primitives for driving harness panes
Two gaps hit this run: (1) `send-keys` can't deliver modifier chords (Shift+Tab), and (2) completion
status is **focus-dependent** (`idle` in the active tab, `done` when backgrounded), so a naive
`--status idle` wait rides out its full timeout. Whatever drives harness panes in Agent OS needs
reliable chord delivery, unambiguous (focus-independent) completion signals, and content-sentinel waits.

## Run-1 observed data (for the post-run review checklist above)

- **QA gate fanned out 4 sub-agents** (qa-smoke, qa-regression, qa-browser-e2e, qa-skeptic-verifier),
  three lanes in parallel — Cursor orchestrated this itself from the `qa-gate` skill.
- **Codex executor** worked ~42 min single-session; whether it spawned its own subagents is **not
  observable from the pane** — open post-run-review Q (inspect the Codex session transcript).
- **Handoffs held via `HANDOFF.md`** across all five phases; no observed intent-drift between harnesses.
- **Bot PR review was high-signal** (4 comments, 0 noise) — one data point; the Phase-6 triage layer
  earns its keep on the noisier PRs to come.
