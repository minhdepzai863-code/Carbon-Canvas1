import { loadConfig } from "./config.js";
import { createPool, assertRuntimeRole } from "./db.js";
import { createApp } from "./app.js";
import { createGuestApp, loadGuestConfig } from "./guest.js";
const guest = process.env.GUEST_AI_ENABLED === "true";
const config = guest ? loadGuestConfig() : loadConfig();
const pool = guest ? null : createPool(config);
if (pool) await assertRuntimeRole(pool);
const { app } = guest ? createGuestApp(config) : createApp(pool, config);
const server = app.listen(config.PORT, "127.0.0.1", () =>
  console.log(`CarbonCanvas API listening on port ${config.PORT}`),
);
server.requestTimeout = 120000;
server.headersTimeout = 10000;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(async () => {
      await pool?.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
