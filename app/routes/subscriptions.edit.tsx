import { data, redirect } from "react-router";

import { PageShell } from "~/components/page-shell";
import { SubscriptionForm } from "~/components/subscription-form";
import { db } from "~/db/db.server";
import { getSubscription, updateSubscription } from "~/db/subscriptions.server";
import { parseSubscriptionForm } from "~/lib/subscription-form.server";
import { requireSubscriptionId } from "~/lib/subscription-route.server";

import type { Route } from "./+types/subscriptions.edit";

export function meta({ data: loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.subscription.name ?? "Edit subscription"} | Agent Cost Tracker` }];
}

export function loader({ params }: Route.LoaderArgs) {
  const subscription = getSubscription(db, requireSubscriptionId(params.id));
  if (!subscription) {
    throw data("Subscription not found.", { status: 404 });
  }
  return { subscription };
}

export async function action({ params, request }: Route.ActionArgs) {
  const id = requireSubscriptionId(params.id);
  const result = parseSubscriptionForm(await request.formData());

  if (!result.success) {
    return data(result, { status: 400 });
  }

  const subscription = updateSubscription(db, id, result.data);
  if (!subscription) {
    throw data("Subscription not found.", { status: 404 });
  }

  return redirect("/");
}

export default function EditSubscription({ loaderData, actionData }: Route.ComponentProps) {
  const { subscription } = loaderData;
  const failedSubmission = actionData?.success === false ? actionData : undefined;

  return (
    <PageShell
      eyebrow="Subscriptions"
      title={`Edit ${subscription.name}`}
      description="Update the recurring cost or account details for this subscription."
    >
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <SubscriptionForm
          submitLabel="Save changes"
          errors={failedSubmission?.errors}
          values={
            failedSubmission?.values ?? {
              name: subscription.name,
              vendor: subscription.vendor,
              monthlyCost: (subscription.monthlyCost / 100).toFixed(2),
              renewalDate: subscription.renewalDate,
              notes: subscription.notes ?? "",
            }
          }
        />
      </section>
    </PageShell>
  );
}
