# .claude/agents/ — none provisioned for run 1

Claude Code runs the **Architect**, **Reviewer**, and **PR** phases inline (see repo-root
`CLAUDE.md`). Run 1's review is small enough to do in the main loop, so no custom review
subagents are provisioned yet.

If review grows (multiple lenses — correctness, silent-failure, type-design), provision
project-scoped review subagents here and record the blueprint→native step in `../../PROVISIONING.md`.
