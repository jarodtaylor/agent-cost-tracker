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
**stack-specific skills**, or a combination. Data first, then decide.

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
