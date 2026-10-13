import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db.js";
export async function migrate(pool) {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(81422599)");
    await client.query("CREATE SCHEMA IF NOT EXISTS cc_meta");
    await client.query("REVOKE ALL ON SCHEMA cc_meta FROM PUBLIC");
    await client.query(
      "CREATE TABLE IF NOT EXISTS cc_meta.schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())",
    );
    await client.query("REVOKE ALL ON cc_meta.schema_migrations FROM PUBLIC");
    await client.query(
      "ALTER TABLE cc_meta.schema_migrations ENABLE ROW LEVEL SECURITY",
    );
    const dir = new URL("../migrations/", import.meta.url);
    for (const name of (await readdir(dir))
      .filter((n) => /^\d+.*\.sql$/.test(n))
      .sort()) {
      const sql = await readFile(new URL(name, dir), "utf8");
      const checksum = createHash("sha256")
        .update(sql.replace(/\r\n/g, "\n"))
        .digest("hex");
      const previous = (
        await client.query(
          "SELECT checksum FROM cc_meta.schema_migrations WHERE name=$1",
          [name],
        )
      ).rows[0];
      if (previous) {
        if (previous.checksum !== checksum)
          throw new Error("Applied migration checksum mismatch: " + name);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO cc_meta.schema_migrations(name,checksum) VALUES($1,$2)",
          [name, checksum],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
      console.log("Applied migration " + name);
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(81422599)");
    client.release();
  }
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  const pool = createPool(loadConfig(), true);
  try {
    await migrate(pool);
  } finally {
    await pool.end();
  }
}
