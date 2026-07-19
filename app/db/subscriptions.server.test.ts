import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import * as schema from "./schema";
import {
  createSubscription,
  deleteSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscription,
} from "./subscriptions.server";

const migrationsFolder = join(import.meta.dir, "../../drizzle");

function createTestDatabase() {
  const client = new Database(":memory:");
  const db = drizzle({ client, schema });
  migrate(db, { migrationsFolder });

  return { client, db };
}

const claudePro = {
  name: "Claude Pro",
  vendor: "Anthropic",
  monthlyCost: 2_000,
  renewalDate: "2026-08-01",
  notes: "Primary coding assistant",
};

describe("subscription data layer", () => {
  test("creates, lists, and gets subscriptions using cents and ISO dates", () => {
    const { client, db } = createTestDatabase();

    try {
      const created = createSubscription(db, claudePro);
      createSubscription(db, {
        name: "ChatGPT Plus",
        vendor: "OpenAI",
        monthlyCost: 2_000,
        renewalDate: "2026-08-15",
      });

      expect(created).toMatchObject(claudePro);
      expect(created.id).toBeGreaterThan(0);
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);

      expect(getSubscription(db, created.id)).toEqual(created);
      expect(listSubscriptions(db).map(({ name }) => name)).toEqual([
        "Claude Pro",
        "ChatGPT Plus",
      ]);

      const stored = client
        .query(
          "select typeof(monthly_cost) as cost_type, renewal_date from subscriptions where id = ?",
        )
        .get(created.id) as { cost_type: string; renewal_date: string };
      expect(stored).toEqual({
        cost_type: "integer",
        renewal_date: "2026-08-01",
      });
    } finally {
      client.close();
    }
  });

  test("updates a subscription and refreshes its updated timestamp", () => {
    const { client, db } = createTestDatabase();

    try {
      const created = createSubscription(db, claudePro);
      const updated = updateSubscription(db, created.id, {
        monthlyCost: 2_500,
        notes: null,
      });

      expect(updated).toMatchObject({
        ...claudePro,
        monthlyCost: 2_500,
        notes: null,
      });
      expect(updated?.updatedAt).toBeInstanceOf(Date);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime(),
      );
      expect(getSubscription(db, created.id)).toEqual(updated);
    } finally {
      client.close();
    }
  });

  test("deletes a subscription and returns the deleted record", () => {
    const { client, db } = createTestDatabase();

    try {
      const created = createSubscription(db, claudePro);

      expect(deleteSubscription(db, created.id)).toEqual(created);
      expect(getSubscription(db, created.id)).toBeUndefined();
      expect(listSubscriptions(db)).toEqual([]);
    } finally {
      client.close();
    }
  });

  test("returns undefined for missing lookups, updates, and deletes", () => {
    const { client, db } = createTestDatabase();

    try {
      expect(getSubscription(db, 404)).toBeUndefined();
      expect(
        updateSubscription(db, 404, { monthlyCost: 1_500 }),
      ).toBeUndefined();
      expect(deleteSubscription(db, 404)).toBeUndefined();
    } finally {
      client.close();
    }
  });
});
