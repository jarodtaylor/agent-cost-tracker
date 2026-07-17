# Run 1 — repo bootstrap + subscription CRUD

> **Phase 1 (Architect) deliverable.** Executor implements this on branch
> `feat/subscription-crud`. The **Acceptance Criteria** section is the contract the Cursor QA
> gate verifies — do not add scope beyond it.

## Context / why

`agent-cost-tracker` needs its first working slice: a way to record what the AI/agent stack
costs. Run 1 delivers the minimum useful thing — one entity (a subscription) with full CRUD and
a list view — and, more importantly, exercises the multi-harness pipeline end to end for the
first time. **Done = the flow completed** (plan → execute → review → QA `PASS`+`OPEN_PR` → PR →
Jarod merges), not the app perfected.

## Scope

- Bootstrap the app: **Bun · React Router 7 (framework mode) · Tailwind + shadcn/ui · Drizzle +
  SQLite**.
- One entity: **Subscription** — `name`, `vendor`, `monthlyCost`, `renewalDate`, `notes?`,
  `createdAt`, `updatedAt`.
- **List view** at `/` showing all subscriptions.
- **Create / edit / delete** flows.
- Data-layer unit tests + typecheck.

## Non-goals (explicitly out — feature ladder for runs 2+)

- Renewal-soon flags / urgency badges. (Run 2)
- Monthly-spend total or chart. (Run 2)
- Usage notes / analytics. (Run 3)
- Auth, multi-user, deploy, CSV import. Not now.

## Stack notes for the Executor

- Use **React Router 7 framework mode** (loaders/actions, file or config routes) — verify the
  current project-setup + loader/action API via the `find-docs` skill before coding; do not rely
  on memory for RR7/Drizzle/shadcn signatures.
- SQLite via Drizzle; a local file DB (e.g. `./data/app.db`) that is gitignored (`*.db` already
  ignored). Provide a migration (`drizzle-kit`) and a `bun run db:push`/migrate script.
- `monthlyCost` stored as integer **cents** (avoid float money bugs); rendered as currency.
- `renewalDate` stored as ISO `YYYY-MM-DD`.
- shadcn/ui for form controls + table; Tailwind for layout.

## Build sequence

1. `bun init` / scaffold RR7 framework app; add Tailwind + shadcn/ui; confirm `bun run dev`
   serves a page.
2. Add Drizzle + SQLite; define the `subscriptions` schema; wire migrations; add
   `db:push`/`db:migrate` + `db:seed` (a few example rows) scripts.
3. Data layer: `listSubscriptions`, `getSubscription`, `createSubscription`,
   `updateSubscription`, `deleteSubscription` — pure functions over the db, unit-tested.
4. Routes: `/` (list + empty state), create (`/subscriptions/new`), edit
   (`/subscriptions/:id/edit`), delete (action). Use RR7 loaders/actions; server-side validation.
5. UI: a subscriptions **table** (name, vendor, monthly cost as currency, renewal date, notes),
   an **Add** button, per-row **Edit**/**Delete**. Empty state when no rows.
6. Validation: required `name`, `vendor`, `monthlyCost`, `renewalDate`; field-level errors;
   invalid input does not write.
7. Tests + typecheck green; short README run/test note.

## Acceptance Criteria

Each bullet is pass/fail and evidence-backed. A QA specialist confirms or refutes each.

- [ ] **AC1 — Boots.** `bun install && bun run dev` starts the app; `GET /` returns HTTP 200 and
  renders a page with a "Subscriptions" heading. *Evidence: HTTP status + heading text.*
- [ ] **AC2 — Empty state.** With an empty database, `/` shows a clear empty-state message (e.g.
  "No subscriptions yet"), not an error or blank page. *Evidence: visible text.*
- [ ] **AC3 — Create.** Submitting the add form with valid `name`, `vendor`, `monthlyCost`,
  `renewalDate` creates a row that then appears in the list with those values. *Evidence: item
  visible in list after submit.*
- [ ] **AC4 — Validation blocks bad input.** Submitting the add form with a required field empty
  (e.g. blank `name`) does **not** create a row and shows a field-level error. *Evidence: error
  text visible; list row-count unchanged.*
- [ ] **AC5 — Edit.** Editing a subscription's `monthlyCost` persists; the list shows the new
  value after a page reload. *Evidence: updated value visible post-reload.*
- [ ] **AC6 — Delete.** Deleting a subscription removes it from the list and it does not reappear
  after reload. *Evidence: item absent post-reload.*
- [ ] **AC7 — Persists across restart.** A created subscription survives a dev-server restart
  (SQLite file persistence). *Evidence: create → restart → still listed.*
- [ ] **AC8 — Currency formatting.** `monthlyCost` renders as currency (e.g. `$20.00`)
  consistently in the list. *Evidence: visible formatting; stored as integer cents.*
- [ ] **AC9 — Colorblind-safe.** No meaning is conveyed by hue alone anywhere in run 1; any
  color that carries meaning is paired with a text label or icon/shape. *Evidence: visual + code
  check.*
- [ ] **AC10 — Clean console.** The create → edit → delete flow produces no uncaught browser
  console errors. *Evidence: console clean on those paths.*
- [ ] **AC11 — Tests + types green.** `bun test` (data-layer CRUD unit tests) and the project
  typecheck both exit 0. *Evidence: exit codes.*

## QA contract seed (for phase 4)

- **target:** `feat/subscription-crud` @ `<sha>` · **base:** `main`
- **run:** `bun install && bun run dev` — app at `http://localhost:3000` (confirm the port the
  RR7 template uses; update if different)
- **test:** `bun test`; typecheck via the project's typecheck script
- **ui:** required · **auth_seed:** none

## Definition of done

Executor handoff note present → Claude review sign-off → Cursor `QA_GATE_REPORT` with
`gate_verdict: PASS` + `pr_recommendation: OPEN_PR` → Claude opens the PR → **Jarod merges.**
Every rough edge along the way → one line in `FRICTION.md`.
