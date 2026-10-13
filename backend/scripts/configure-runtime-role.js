import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db.js";
const config = loadConfig();
const url = new URL(config.DATABASE_URL);
const password = decodeURIComponent(url.password);
if (
  password.length < 20 ||
  decodeURIComponent(url.username).split(".")[0] !== "cc_runtime"
)
  throw new Error(
    "DATABASE_URL must use cc_runtime with a strong, unique password",
  );
const pool = createPool(config, true);
try {
  const { rows } = await pool.query(
    "SELECT format('ALTER ROLE cc_runtime LOGIN PASSWORD %L', $1::text) AS statement",
    [password],
  );
  await pool.query(rows[0].statement);
  console.log("Configured runtime role. No credentials displayed.");
} finally {
  await pool.end();
}
