import { data } from "react-router";

export function requireSubscriptionId(value: string | undefined) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw data("Subscription not found.", { status: 404 });
  }
  return id;
}
