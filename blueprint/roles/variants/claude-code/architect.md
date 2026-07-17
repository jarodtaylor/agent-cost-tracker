# Variant: Architect — Claude Code

Implements [`roles/architect.md`](../../architect.md) in Claude Code. Provisioned into the
repo-root `CLAUDE.md` (Architect section).

## How Claude Code runs this phase

1. **Plan mode.** Enter plan mode for the run; the plan is the deliverable, not code.
2. **Write the plan to `docs/plans/`** with the filename convention `YYYY-MM-DD-NNN-<slug>.md`.
3. Use the acceptance-criteria template below — the gate hard-requires it.

## Acceptance-criteria template (copy into every plan)

```markdown
## Acceptance Criteria
Each bullet is pass/fail and evidence-backed. A QA specialist confirms or refutes each with a
command, an HTTP status, or a visible UI outcome.

- [ ] AC1 — <observable fact>. Evidence: <how to check>.
- [ ] AC2 — <observable fact>. Evidence: <how to check>.
...
- [ ] ACn — No console errors on the exercised flows. Evidence: browser console clean.
```

Rules:
- No bullet may be subjective ("looks good", "is fast enough"). If you can't name the evidence,
  it isn't an acceptance criterion yet.
- UI criteria must include the **colorblind-safe** check (labels + shape, never hue alone) as an
  explicit bullet where color conveys meaning.
- Keep the set minimal — enough to prove the plan's scope, no gold-plating.

## Handoff

The plan path is what the Executor pane receives (`codex exec … "Implement docs/plans/<file>"`).
The acceptance criteria are lifted verbatim into the QA contract at phase 4.
