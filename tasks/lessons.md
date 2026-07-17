# Lessons — agent-cost-tracker

Project-specific patterns to prevent recurring mistakes. Reviewed at session start.

---

## L1 — Never claim a harness surface "does not exist" from a shallow live probe

**2026-07-17 · correction from Jarod · severity: high**

**What happened.** During scaffold I claimed Codex has no `.codex/agents` custom-agent format,
reasoning from (a) an empty `~/.codex/agents/` directory and (b) a top-level `codex --help` with
no `agents` subcommand. I published that as a "verified" finding across 8 files — and it was
**flat wrong**. Codex custom subagents are real, project-scoped `.codex/agents/*.toml` files
(docs: developers.openai.com/codex/agent-configuration/subagents). Jarod pointed me at the docs;
I then verified live by delegating to a provisioned `executor.toml`, which spawned and returned
its own instructions.

**Root cause.**
1. **Wrong altitude / wrong surface.** A CLI feature invoked via config files + delegation does
   not appear as a top-level `--help` subcommand. I probed the wrong surface and read the null
   result as absence.
2. **Empty ≠ absent.** An empty `~/.codex/agents/` means "none created yet," not "the feature
   doesn't exist."
3. **I skipped the authoritative docs** — and even rationalized it (the advisor called the docs
   check "optional confirmation"). For an *existence/absence* claim, docs are not optional; they
   are the gate. This directly violated my own standing rule: *never rely on training data / a
   cursory read for platform behavior — verify against current docs.*

**Rule for myself (prevent recurrence).**
- Before writing "**X does not exist**" / "**no such surface**" about any harness or tool, prove
  it against **authoritative vendor docs**, not just `ls` / `--help` / memory / a negative live
  probe. A negative live result is **not** proof of absence.
- A cursory scan produces **false absences** as readily as false presences. Treat both directions
  with equal suspicion.
- When a spec/vision doc asserts a surface exists and my quick probe disagrees, the doc wins until
  I've checked the *vendor's* docs — my probe is the suspect, not the spec.
- Prefer to **verify a positive** (create the artifact, exercise it) over inferring a negative.
  Here: authoring `executor.toml` and delegating to it settled the question in one command.

**Relation to prior art.** This is the *inverse* of the standing convention to verify harness
surfaces against **live instances**, which warns about false **presences** (disabled entries shown
as active). Same spine, opposite sign: verify against live **and** docs; absence needs doc-level
proof.
