import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

const databasePath = join(process.cwd(), "data", "app.db");
const migrationsFolder = join(process.cwd(), "drizzle");

mkdirSync(dirname(databasePath), { recursive: true });

const client = new Database(databasePath);
client.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle({ client, schema });

migrate(db, { migrationsFolder });
