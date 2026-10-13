import { loadConfig } from "./config.js";
import { createPool, assertRuntimeRole } from "./db.js";
import { createApp } from "./app.js";
const config = loadConfig();
const pool = createPool(config);
await assertRuntimeRole(pool);
const { app } = createApp(pool, config);
const server = app.listen(config.PORT, "127.0.0.1", () =>
  console.log(`CarbonCanvas API listening on port ${config.PORT}`),
);
server.requestTimeout = 30000;
server.headersTimeout = 10000;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
