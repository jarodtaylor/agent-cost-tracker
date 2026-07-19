# Run 1 — Retrospective & Agent-OS design brief

> **The consolidated handoff for Agent OS.** Run 1 built subscription CRUD across four harnesses —
> **Claude** (architect / reviewer / orchestrator), **Codex** (executor), **Cursor** (QA gate),
> **Jarod** (merger) — to test whether the multi-harness SDLC loop *works mechanically*. This is the
> single entry point: it synthesizes what we learned and what Agent OS must decide, so design starts
> from evidence, not memory.
>
> **Source material it synthesizes:** [`blueprint/workflow.md`](../../../blueprint/workflow.md)
> (process SSOT) · [`FRICTION.md`](../../../FRICTION.md) (raw frictions) ·
> [`OBSERVATIONS.md`](../OBSERVATIONS.md) (design threads) · [`PROVISIONING.md`](../../../PROVISIONING.md) ·
> `docs/runs/run-1/` (durable evidence). **PR [#1](https://github.com/jarodtaylor/agent-cost-tracker/pull/1)**
> is the run's artifact-of-record (full pipeline incl. the review cycle).

---

## 1. What run 1 tested — and what it did NOT

Run 1's purpose was **mechanical**: does the loop run end-to-end across real harnesses, *regardless of
output quality*? (Per OBSERVATIONS: we knew output wouldn't be cohesive without memory contracts +
durable specs + mature planning; those are later runs.)

**Validated (the plumbing):** plan → execute → review → QA gate → PR → **PR-feedback (Phase 6)** →
merge, driven through Herdr, across 4 distinct harnesses/models, with `HANDOFF.md` carrying intent
between phases. The review cycle (bot comments → triage → route → fix → re-review → resolve) ran for real.

**Explicitly NOT tested — do not infer these work:**
- **Output quality / cohesion** — mechanical run only.
- **Memory contracts / durable specs** beyond the interim `HANDOFF.md` brain.
- **Multi-run continuity**, **per-phase harness swapping**, **model routing under load**.
- The **Cursor gate on a large/complex** diff (run 1 was ~2.5k LOC, high-signal). _(Codex subagent autonomy **was** exercised — 4 subagents, §2 — but only at small scale, one run, uniform model tier.)_
- **Cost / economics of the run** — not instrumented (a gap for a *cost-tracker* dogfood; see §6).

---

## 2. Post-run review checklist — answered

(The open questions from [`OBSERVATIONS.md`](../OBSERVATIONS.md) → "Post-run review checklist.")

**Codex execution facts** (from `~/.codex/sessions/2026/07/18/rollout-*.jsonl`, main session `…019f783c-f9eb…`, 994 lines spanning both runs):

- **Codex autonomously spawned 4 coding subagents** (`spawn_agent`, depth 1), coordinated via `send_message` / `wait_agent` / `list_agents`:
  - **1 sequential delegated slice** — `subscription_data`: a proof-first data-layer build (Drizzle schema/queries + red→green tests, 20 exec calls); the main thread **blocked** on it.
  - **3 parallel advisory reviewers** — `simplify_{reuse,quality,efficiency}`, spawned within 31s, run concurrently; each returned **findings only** (zero edits — the main thread applied the resulting 7 cleanups itself).
  - _(The two rollout files one second apart are NOT a subagent pair — the twin is an automated **Guardian** safety-judge. The main guardian judged **80 planned actions, all `allow`** — that's the "auto-approver" observed live. Every subagent gets its own guardian.)_
- **Model/effort: `gpt-5.6-sol` @ `xhigh` for the main session AND all 4 subagents, identically** (Codex `0.144.6`, `approval_policy:on-request`, `sandbox:workspace-write`). → **This is the model-routing anti-pattern OBSERVATIONS predicted** (Sol ≈ Fable/Opus; the Executor shouldn't burn it on work Terra handles) — see the cost line.
- **Tool usage:** Run 1 (impl) = 158 `exec` + 22 patch-applies + 7 `codebase-memory-mcp` calls + 191 reasoning steps; Run 2 (fix) = 21 exec + 3 patch-applies. Mostly **sequential** on the main thread; one parallel fan-out + one blocking delegated slice; **no parallel feature-code writing**.
- **Scale:** Run 1 = **42m 01s**, Run 2 (PR-fix) = **4m 49s** (same session, resumed); 2 user turns, 219 reasoning items.
- **Cost — real generation ≈ 235K output tokens across the 5 coding threads.** The parallel simplify pass alone was **~147K output** (3 forked-full-history agents at xhigh) — roughly **3× the main session's output cost, to produce 7 advisory cleanups**. Cumulative "context" figures (~24M on the main thread) are cache re-sends, **not** billable — do NOT infer the footprint from the main thread alone; guardians add further overhead.
- **Notable:** proof-first **TDD** throughout (the money-overflow test went red at `90071992547409.92`, green after the `BigInt` switch); multiple **root-caused self-corrections** (Vite 7 scaffold option, npm-cache ownership, `bun:sqlite` under SSR, watcher exhaustion); **doc verification** via `find-docs`/Context7 before scaffolding; followed repo skills explicitly (`ce-work` → parallel simplify → `ce-commit`; Run 2 used `ce-resolve-pr-feedback`); deliberately **opened no PR** (left for the Claude review harness).

**Handoff quality / weakest handoff (orchestrator assessment):** `HANDOFF.md` held across all phases —
no observed intent-drift; each harness picked up its predecessor's block and acted correctly. The
**weakest handoff was Plan → Execute on the operational unknowns**: the plan seeded the dev port as
`:3000` while HANDOFF guessed `:5173` (RR7 default) — Codex resolved it to 3000 in the `dev` script, but
the ambiguity shows the plan can't fully specify runtime facts it hasn't discovered yet. The **richest
context loss is structural**: the deepest reasoning (see §5) lived in the orchestrator's live session,
not in any handoff doc — which is exactly why this retro exists.

---

## 3. What worked

- **The loop held end-to-end.** Every phase produced its contract and the next consumed it. Role
  separation survived even into PR-feedback (Phase 6): Codex owned its code's fixes; Claude triaged +
  reviewed; Jarod stayed the merger.
- **`HANDOFF.md` as the brain** worked as an interim memory contract — cheap, legible, sufficient for one run.
- **Review-runs-the-build discipline** (the reviewer personally boots + runs tests, never signs off on
  code that merely *reads* correct) validated the risky `bun:sqlite`-tests / `better-sqlite3`-SSR driver
  split that unit tests alone wouldn't have caught.
- **The QA gate fanned out 4 specialists** (smoke, regression, browser-e2e, skeptic) from one skill, in
  parallel, and produced a real machine-readable verdict + browser evidence.
- **Codex orchestrated its own work autonomously** (§2) — spawned 4 subagents (a delegated data slice +
  a parallel simplify panel), worked proof-first TDD, and root-caused 4+ environment failures without
  hand-holding. The multi-harness model doesn't preclude *intra*-harness orchestration — it happened one layer down.
- **Bot PR review was high-signal** this round (6 comments, 0 noise). The Phase-6 triage layer still
  earned its keep by *declining* 2 (a re-flag of an already-logged item + a cosmetic nit) rather than churning.

---

## 4. What broke / was manual — the findings that shape Agent OS

Distilled from [`FRICTION.md`](../../../FRICTION.md) (14 entries); the load-bearing ones:

- **★ An interactive Cursor QA gate is undriveable through Herdr.** Cursor prompts per-command, and
  Herdr's `send-keys` can't deliver its `Tab`/`Shift+Tab` approval chords (both collapse to single-approve).
  The gate only ran once launched with `--force --approve-mcps`, which required **explicit human
  authorization**. This was the single biggest orchestration correction of the run.
- **Completion status is focus-dependent** (`idle` in the active tab, `done` backgrounded) — a naive
  `--status idle` wait rides out its full timeout. Fixed to poll `idle|done`.
- **The cross-harness verdict contract is fragile** — the gate emitted `gate_verdict: PASS`, not the
  spec's literal `**gate_verdict:**`; a strict automated parser would have mis-gated the PR.
- **No per-agent identity** — every commit and every PR reply posted under the *human's* GitHub account;
  the PR can't distinguish Claude from Codex without reading the body. CodeRabbit auto-resolves its
  threads on re-review; Copilot needs manual GraphQL resolution.
- **Provisioning drift** — every role file exists twice (`blueprint/` SSOT + hand-copied native config)
  with no sync; editing intent means editing two files. (`PROVISIONING.md` documents the mapping.)
- **The handoffs themselves are manual** — each `HANDOFF.md` update, each pane spawn, each dialog
  cleared exists *only because a human/orchestrator had to bridge two harnesses*. Every one is a place
  Agent OS could automate.

---

## 5. Key decisions + rationale (distilled from the session — the "why" that lives nowhere else)

The docs record *what* was decided; this records *why*, before the reasoning is lost:

- **Use `--force` despite `workflow.md` forbidding it.** The rule bundled `--force` with headless
  `--print`; but `--force` *keeps* the interactive TUI and full command visibility (audit trail intact) —
  it removes the *prompt*, not the *sight* — so it honored the rule's real intent ("Herdr wants
  interactive panes"). Blast radius = Codex's already-auto-approved execute. The right move was a human
  *authorization gate*, not avoidance. → SSOT corrected.
- **Phase-6 PR-feedback = triage-always-orchestrator + route-by-nature** (not "Claude fixes everything").
  Option "Claude fixes all" was rejected because it **breaks the role separation the dogfood exists to
  test** — Claude editing Codex's code blurs ownership. Route-by-nature (substantive app-code → Codex,
  batched; trivial/docs → Claude) is the Phase-3 review rule extended, giving efficiency *and* integrity.
  Triage is *always* the orchestrator's because bots are noisy and confidently wrong a real fraction of
  the time — the skeptic layer prevents bot-suggested *fixes that introduce bugs*.
- **Terminate rule over green-chasing.** Bots re-review every commit and lag by minutes; chasing a clean
  bot slate is an infinite loop. One substantive fix-cycle, then decline nits with rationale. (We slipped
  once — declared "ready" before the re-review settled — now codified: wait for the re-review to settle.)
- **Scoped re-QA, not a full re-gate, for contained fixes.** A full Cursor gate for two unit-tested
  one-file fixes is disproportionate; the reviewer's own tests+typecheck+build on the changed path is
  the right-sized verification.

---

## 6. Prioritized Agent-OS requirements (derived from the evidence)

Ranked by how hard run 1 hit the gap:

| Pri | Requirement | Evidence |
|-----|-------------|----------|
| **P0** | **Harness command-execution authorization model** — per-harness "grant autonomy" decision (per-command doesn't scale through a multiplexer; auto-run flags need a human/policy gate). | The loop *literally could not run* without solving this (`--force`). |
| **P0** | **Structured, machine-readable cross-harness contracts** (verdict/handoff = fenced block / exit code / structured output, not rendered prose). | Verdict nearly mis-parsed. |
| **P1** | **Durable, auto-captured per-phase evidence** (reports, screenshots, transcripts land in-repo automatically). | This very gap — the run's *proof* wasn't saved; recovered by hand for this doc. |
| **P1** | **Per-agent identities** (bot app / scoped token per harness) for honest attribution + automated thread resolution. | All commits/replies posted as the human. |
| **P1** | **Reliable pane-control primitives** — chord delivery, focus-independent completion signals, content-sentinel waits. | `send-keys` chords, `idle`/`done` ambiguity. |
| **P2** | **Provisioning from the SSOT** (kill the role-file×2 drift). | `blueprint/` ↔ native config, hand-synced. |
| **P2** | **Memory contracts / durable specs** beyond `HANDOFF.md` — the real quality lift for multi-run cohesion. | OBSERVATIONS thread; `HANDOFF.md` was interim-only. |
| **P2** | **Cost / economics instrumentation** — tokens/time/cost per phase, **live**. | Not captured live; reconstructed post-hoc from rollout logs (§2): ~235K generation output tokens, simplify pass ~3×. Agent OS must instrument this, not archaeology it. |
| **P2** | **Model-routing policy** — enforce or advise per-task tiers (Sol vs Terra; Opus vs Sonnet), incl. *inside* a harness's own subagents. | **Now evidence-backed (§2):** Codex ran all 4 subagents — incl. a 3-way *parallel simplify* pass — at Sol/xhigh; ~3× output cost for 7 cleanups. Uniform top-tier routing is real and wasteful. |

---

## 7. Evidence (durable, in-repo)

- **[`qa-gate-report.md`](qa-gate-report.md)** — the full `QA_GATE_REPORT` (reproduced verbatim from the
  gate agent's own session context; the live emission also persists in Cursor's `store.db`).
- **[`ac9-colorblind-list.png`](ac9-colorblind-list.png)** — browser screenshot from the `qa-browser-e2e`
  lane; AC9 (colorblind-safe) proof + evidence a real browser was driven (not a silent PASS).
- **PR [#1](https://github.com/jarodtaylor/agent-cost-tracker/pull/1)** — the whole pipeline as an
  artifact: 4 review comments fixed + 2 declined with rationale, all threads resolved.
- **Codex rollout logs** — `~/.codex/sessions/2026/07/{18,19}/rollout-*.jsonl` (on disk, not in repo;
  the §2 execution facts are extracted from these).

---

## 8. Carried to run 2

- **Delete-race → `useFetcher()` swap** — the one deferred *code* item (a stale second-tab delete 404s
  into a full-page error boundary; off every AC path).
- **Overflow error-message precision** (bot nit, disregarded) — optional polish if ever wanted.
- Everything in §6 P2/P3 is design work for Agent OS, not run-2 app scope.
