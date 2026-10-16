import { loadConfig } from "../src/config.js";
import { createPool, assertRuntimeRole } from "../src/db.js";
import { createTransport, deliverOne } from "../src/mail.js";
const config = loadConfig();
const pool = createPool(config);
await assertRuntimeRole(pool);
const transport = createTransport(config);
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopping = true;
  });
while (!stopping) {
  if (!(await deliverOne(pool, config, transport)))
    await new Promise((resolve) => setTimeout(resolve, 2000));
}
transport.close();
await pool.end();
