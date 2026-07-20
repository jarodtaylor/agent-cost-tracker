import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import * as schema from "./schema";
import { createSubscription, getSubscription } from "./subscriptions.server";

const migrationsFolder = join(import.meta.dir, "../../drizzle");

describe("subscription schema", () => {
  test("migrates a file database with persistence-compatible column types", () => {
    const directory = mkdtempSync(join(tmpdir(), "agent-cost-tracker-db-"));
    const databasePath = join(directory, "app.db");
    let firstClient: Database | undefined = new Database(databasePath, {
      create: true,
    });

    try {
      const firstDb = drizzle({ client: firstClient, schema });
      migrate(firstDb, { migrationsFolder });

      const columns = firstClient
        .query("pragma table_info(subscriptions)")
        .all() as Array<{ name: string; type: string; notnull: number }>;
      expect(
        Object.fromEntries(
          columns.map(({ name, type, notnull }) => [name, { type, notnull }]),
        ),
      ).toMatchObject({
        id: { type: "INTEGER", notnull: 1 },
        name: { type: "TEXT", notnull: 1 },
        vendor: { type: "TEXT", notnull: 1 },
        monthly_cost: { type: "INTEGER", notnull: 1 },
        renewal_date: { type: "TEXT", notnull: 1 },
        notes: { type: "TEXT", notnull: 0 },
        created_at: { type: "INTEGER", notnull: 1 },
        updated_at: { type: "INTEGER", notnull: 1 },
      });

      const created = createSubscription(firstDb, {
        name: "Cursor Pro",
        vendor: "Anysphere",
        monthlyCost: 2_000,
        renewalDate: "2026-09-01",
      });
      firstClient.close();
      firstClient = undefined;

      const reopenedClient = new Database(databasePath);
      try {
        const reopenedDb = drizzle({ client: reopenedClient, schema });
        expect(getSubscription(reopenedDb, created.id)).toEqual(created);
      } finally {
        reopenedClient.close();
      }
    } finally {
      firstClient?.close(false);
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
