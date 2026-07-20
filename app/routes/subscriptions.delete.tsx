import { data, redirect } from "react-router";

import { db } from "~/db/db.server";
import { deleteSubscription } from "~/db/subscriptions.server";
import { requireSubscriptionId } from "~/lib/subscription-route.server";

import type { Route } from "./+types/subscriptions.delete";

export function action({ params }: Route.ActionArgs) {
  const deleted = deleteSubscription(db, requireSubscriptionId(params.id));
  if (!deleted) {
    throw data("Subscription not found.", { status: 404 });
  }

  return redirect("/");
}
