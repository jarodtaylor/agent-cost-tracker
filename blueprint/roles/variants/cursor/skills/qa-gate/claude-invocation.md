# Claude Code → Cursor CLI invocation

Use this after Codex finishes and Claude's own code review is done. Verified command shape
against cursor-agent 2026.07.13.

## Command

```bash
agent --workspace <repo> --model composer-2.5 --print --force --trust -p "$(cat <<'EOF'
Run the qa-gate skill as the pre-PR QA team. Do not open a PR.

## Contract
- target: <branch> @ <sha>
- base: main
- acceptance_criteria:
  - <bullet from the plan>
  - <bullet>
- run: <e.g. bun install && bun run dev — app at http://localhost:3000>
- test: <e.g. bun test / "discover from repo">
- ui: required | n/a
- auth_seed: <or none>
- changed_paths: <optional>

Launch /qa-smoke, /qa-regression, and /qa-browser-e2e in parallel (skip e2e only if ui is n/a and criteria have no UI). Then run /qa-skeptic-verifier on their reports. Emit QA_GATE_REPORT only.
EOF
)"
```

Flags: `--print` = non-interactive; `--force` (aka `--yolo`) skips per-command allow prompts;
`--trust` trusts the workspace so specialists can start servers / run tests headless.

## Parsing

Claude should look for:

- `**gate_verdict:** PASS|FAIL|BLOCKED`
- `**pr_recommendation:** OPEN_PR|DO_NOT_OPEN_PR`

Only open a PR when both are `PASS` and `OPEN_PR`.

## Notes

- Agents are **project-scoped** here (`<repo>/.cursor/agents/`), overriding any user-level ones.
- Ensure Max Mode / plan access matches the pinned models, or Cursor will silently fall back —
  dry-run `agent models` first.
- `qa-browser-e2e` needs a browser MCP; this repo registers one project-scoped in
  `.cursor/mcp.json`.
