import { loadConfig } from "../src/config.js";
import { createPool, assertRuntimeRole } from "../src/db.js";
const pool = createPool(loadConfig());
await assertRuntimeRole(pool);
try {
  await pool.query('DELETE FROM cc_auth.session WHERE "expiresAt"<now()');
  await pool.query('DELETE FROM cc_auth.verification WHERE "expiresAt"<now()');
  await pool.query("DELETE FROM cc_auth.request_limits WHERE expires_at<now()");
  await pool.query(
    "DELETE FROM cc_auth.mail_outbox WHERE sent_at<now()-interval '7 days' OR created_at<now()-interval '2 days'",
  );
  console.log("Expired authentication records removed. Study data retained.");
} finally {
  await pool.end();
}
