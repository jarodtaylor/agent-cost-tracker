import { data, redirect } from "react-router";

import { PageShell } from "~/components/page-shell";
import { SubscriptionForm } from "~/components/subscription-form";
import { db } from "~/db/db.server";
import { createSubscription } from "~/db/subscriptions.server";
import { parseSubscriptionForm } from "~/lib/subscription-form.server";

import type { Route } from "./+types/subscriptions.new";

export function meta() {
  return [{ title: "Add subscription | Agent Cost Tracker" }];
}

export async function action({ request }: Route.ActionArgs) {
  const result = parseSubscriptionForm(await request.formData());

  if (!result.success) {
    return data(result, { status: 400 });
  }

  createSubscription(db, result.data);
  return redirect("/");
}

export default function NewSubscription({ actionData }: Route.ComponentProps) {
  const failedSubmission = actionData?.success === false ? actionData : undefined;

  return (
    <PageShell
      eyebrow="Subscriptions"
      title="Add subscription"
      description="Record a recurring agent tool, provider, or model plan."
    >
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <SubscriptionForm
          submitLabel="Add subscription"
          errors={failedSubmission?.errors}
          values={failedSubmission?.values}
        />
      </section>
    </PageShell>
  );
}
