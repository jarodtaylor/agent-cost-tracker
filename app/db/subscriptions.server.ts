import { asc, eq } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import * as schema from "./schema";
import { subscriptions, type Subscription } from "./schema";

type SubscriptionDatabase = BaseSQLiteDatabase<
  "sync",
  unknown,
  typeof schema
>;

type CreateSubscriptionInput = Pick<
  typeof subscriptions.$inferInsert,
  "name" | "vendor" | "monthlyCost" | "renewalDate" | "notes"
>;

type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;

export function listSubscriptions(db: SubscriptionDatabase): Subscription[] {
  return db.select().from(subscriptions).orderBy(asc(subscriptions.id)).all();
}

export function getSubscription(
  db: SubscriptionDatabase,
  id: number,
): Subscription | undefined {
  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .get();
}

export function createSubscription(
  db: SubscriptionDatabase,
  input: CreateSubscriptionInput,
): Subscription {
  return db.insert(subscriptions).values(input).returning().get();
}

export function updateSubscription(
  db: SubscriptionDatabase,
  id: number,
  input: UpdateSubscriptionInput,
): Subscription | undefined {
  return db
    .update(subscriptions)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning()
    .get();
}

export function deleteSubscription(
  db: SubscriptionDatabase,
  id: number,
): Subscription | undefined {
  return db
    .delete(subscriptions)
    .where(eq(subscriptions.id, id))
    .returning()
    .get();
}
