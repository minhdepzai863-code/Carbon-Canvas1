import pg from "pg";
import { readFileSync } from "node:fs";

export function createPool(config, migration = false) {
  const connectionString = migration
    ? process.env.MIGRATION_DATABASE_URL
    : config.DATABASE_URL;
  if (!connectionString)
    throw new Error("MIGRATION_DATABASE_URL is required for migrations");
  const url = new URL(connectionString);
  // URL SSL parameters can override pg's explicit ssl config. Reject them rather than silently weakening validation.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    if (url.searchParams.has(key))
      throw new Error(
        `Remove ${key} from DATABASE_URL; configure DATABASE_SSL and DATABASE_CA_FILE`,
      );
  }
  const pool = new pg.Pool({
    connectionString,
    max: config.DB_POOL_MAX,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    options: "-c search_path=cc_auth,cc_app,public -c statement_timeout=10000",
    ssl:
      config.DATABASE_SSL === "true"
        ? {
            rejectUnauthorized: true,
            ...(config.DATABASE_CA_FILE
              ? { ca: readFileSync(config.DATABASE_CA_FILE, "utf8") }
              : {}),
          }
        : false,
  });
  pool.on("error", () => console.error("Database connection failure")); // Never log URLs, tokens or query parameters.
  return pool;
}

export async function assertRuntimeRole(pool) {
  const { rows } = await pool.query(
    `SELECT current_user AS name, rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user`,
  );
  if (
    rows[0]?.name !== "cc_runtime" ||
    rows[0].rolsuper ||
    rows[0].rolbypassrls
  )
    throw new Error("Use the non-owner cc_runtime role for DATABASE_URL");
  if (
    (await pool.query("SHOW server_encoding")).rows[0].server_encoding !==
    "UTF8"
  )
    throw new Error("Database must use UTF8 for scientific notation");
  const owned = await pool.query(
    "SELECT 1 FROM pg_tables WHERE schemaname IN ('cc_app','cc_auth') AND tableowner=current_user LIMIT 1",
  );
  if (owned.rowCount)
    throw new Error(
      "Runtime role must not own application or authentication tables",
    );
}

export async function withUser(pool, userId, callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('cc.user_id',$1,true)", [userId]);
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
