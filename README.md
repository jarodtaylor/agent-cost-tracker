# agent-cost-tracker

A small, genuinely-useful utility for tracking the cost of an AI/agent tooling stack —
subscriptions across harnesses and model providers (name, vendor, monthly cost, renewal
date, notes). One entity, one list view, add/edit/delete.

It is also a **multi-harness orchestration reference run**: the app is built by handing one
SDLC pass across three different agent harnesses, each owning one phase, with the handoffs
and friction captured as a first-class deliverable.

## The pipeline

| Phase | Harness | Role |
|---|---|---|
| Plan | Claude Code | Architect — writes the plan **with pass/fail acceptance criteria** |
| Execute | Codex | Executor — implements against the plan |
| Review | Claude Code | Reviewer — post-execution code review |
| QA gate | Cursor CLI | QA lead — fans out specialists, emits a machine-readable verdict |
| PR | Claude Code | Opens the PR **only** on `PASS` + `OPEN_PR` |

The full contract lives in [`blueprint/workflow.md`](blueprint/workflow.md).

## Repository shape

- **`blueprint/`** — the single source of truth: shared role intent + per-harness variants.
- Native harness config (`CLAUDE.md`, `AGENTS.md`, `.cursor/`, `.codex/`) is **provisioned
  from the blueprint** by hand. That hand-provisioning ceremony is the spec for an automated
  provisioner.
- **`HANDOFF.md`** — the project "brain": live state each harness reads at the start of its phase
  and updates at the end, so the loop carries intent instead of re-injecting it every prompt.
- **`FRICTION.md`** — append-only log of every rough edge in the run. A messy run that
  captures ten "ugh" moments beats a clean run that captures none.
- **`docs/plans/`** — run plans, each with acceptance criteria. **`docs/OBSERVATIONS.md`** —
  deferred design threads + post-run review questions.
- **`app/`** — the React Router application, routes, UI components, and data layer.
- **`drizzle/`** — checked-in SQLite migrations.

## Stack

Bun · React Router 7 · Tailwind + shadcn/ui · SQLite + Drizzle. Colorblind-safe from day one
(text labels + shape, never hue alone).

## Run locally

```sh
bun install
bun run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). It creates
`data/app.db` on first boot and applies checked-in migrations automatically. To add a few
example subscriptions, run `bun run db:seed`.

Database maintenance commands are available as `bun run db:generate`, `bun run db:push`, and
`bun run db:migrate`.

## Verify

```sh
bun test
bun run typecheck
bun run build
```

## Status

Run 1 subscription CRUD is implemented on `feat/subscription-crud`, has **passed the QA gate**
(`PASS` + `OPEN_PR`, all 11 acceptance criteria), and is open as
**PR [#1](https://github.com/jarodtaylor/agent-cost-tracker/pull/1)** awaiting merge.
