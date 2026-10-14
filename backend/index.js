import { loadConfig } from "./src/config.js";
import { createPool, assertRuntimeRole } from "./src/db.js";
import { createApp } from "./src/app.js";
import { createGuestApp, loadGuestConfig } from "./src/guest.js";

// One lazy initialization per warm service instance; no filesystem writes or
// migrations on a request. A missing/unsafe environment fails closed.
let initialization;
async function initialize() {
  if (process.env.GUEST_AI_ENABLED === "true")
    return createGuestApp(
      loadGuestConfig({
        ...process.env,
        NODE_ENV:
          process.env.VERCEL === "1" ? "production" : process.env.NODE_ENV,
      }),
    ).app;
  const config = loadConfig();
  const pool = createPool(config);
  try {
    await assertRuntimeRole(pool);
    return createApp(pool, config).app;
  } catch (error) {
    await pool.end();
    throw error;
  }
}
export default async function handler(req, res) {
  try {
    initialization ||= initialize().catch((error) => {
      initialization = undefined;
      throw error;
    });
    const app = await initialization;
    app(req, res);
  } catch (error) {
    console.error("Backend initialization unavailable", error.name);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        code: "SERVER_NOT_READY",
        error:
          "The secure backend is not configured yet. Your local work is unchanged.",
      }),
    );
  }
}
