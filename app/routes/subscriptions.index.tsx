import { PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { PageShell } from "~/components/page-shell";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { db } from "~/db/db.server";
import { listSubscriptions } from "~/db/subscriptions.server";
import { formatCurrency } from "~/lib/currency";

import type { Route } from "./+types/subscriptions.index";

export function meta() {
  return [
    { title: "Subscriptions | Agent Cost Tracker" },
    { name: "description", content: "Track recurring agent tooling costs." },
  ];
}

export function loader() {
  return { subscriptions: listSubscriptions(db) };
}

export default function SubscriptionsIndex({ loaderData }: Route.ComponentProps) {
  const { subscriptions } = loaderData;

  return (
    <PageShell
      title="Subscriptions"
      description="Keep the recurring tools behind your agent stack in one straightforward ledger."
    >
      <div className="mb-5 flex justify-end">
        <Button asChild>
          <Link to="/subscriptions/new">
            <Plus aria-hidden="true" />
            Add subscription
          </Link>
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <section className="rounded-2xl border border-dashed bg-card/85 px-6 py-14 text-center shadow-sm">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full border bg-muted">
            <PackageOpen aria-hidden="true" className="size-6 text-muted-foreground" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">No subscriptions yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add the first recurring tool or model plan to start your cost ledger.
          </p>
          <Button asChild className="mt-6">
            <Link to="/subscriptions/new">
              <Plus aria-hidden="true" />
              Add your first subscription
            </Link>
          </Button>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-label="Subscriptions list">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Monthly cost</TableHead>
                <TableHead>Renewal date</TableHead>
                <TableHead className="min-w-56">Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-semibold">{subscription.name}</TableCell>
                  <TableCell>{subscription.vendor}</TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatCurrency(subscription.monthlyCost)}
                  </TableCell>
                  <TableCell>
                    <time dateTime={subscription.renewalDate}>{subscription.renewalDate}</time>
                  </TableCell>
                  <TableCell className="max-w-72 whitespace-normal text-muted-foreground">
                    {subscription.notes || <span aria-label="No notes">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/subscriptions/${subscription.id}/edit`}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>
                      <Form
                        method="post"
                        action={`/subscriptions/${subscription.id}/delete`}
                        onSubmit={(event) => {
                          if (!window.confirm(`Delete ${subscription.name}?`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <Button type="submit" variant="destructive" size="sm">
                          <Trash2 aria-hidden="true" />
                          Delete
                        </Button>
                      </Form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </PageShell>
  );
}
