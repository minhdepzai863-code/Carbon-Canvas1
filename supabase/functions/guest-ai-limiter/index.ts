import { verifyCaller } from "./verify.js";

// No student answers or provider keys travel through this function. Machine
// authentication replaces the default Supabase-user JWT gate, not app sign-in.
Deno.serve(async (request) => {
  const respond = (status: number, value: unknown) =>
    Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
  if (request.method !== "POST")
    return respond(405, { error: "POST required" });
  const token = request.headers
    .get("Authorization")
    ?.match(/^Bearer (\S+)$/)?.[1];
  if (!token || token.length > 12000)
    return respond(401, { error: "Machine authentication required" });
  try {
    await verifyCaller(token);
  } catch {
    return respond(401, { error: "Untrusted workload" });
  }
  try {
    if (Number(request.headers.get("Content-Length") || 0) > 4096)
      return respond(413, { error: "Request too large" });
    const raw = await request.text();
    if (raw.length > 4096) return respond(413, { error: "Request too large" });
    const { rules } = JSON.parse(raw);
    if (
      !Array.isArray(rules) ||
      rules.length < 1 ||
      rules.length > 5 ||
      rules.some(
        (r) =>
          !/^[a-f0-9]{64}$/.test(r.key) ||
          !Number.isInteger(r.window_seconds) ||
          r.window_seconds < 1 ||
          r.window_seconds > 86400 ||
          !Number.isInteger(r.maximum) ||
          r.maximum < 1 ||
          r.maximum > 500,
      )
    )
      return respond(400, { error: "Invalid quota rules" });
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const base = Deno.env.get("SUPABASE_URL");
    if (!key || !base)
      return respond(503, { error: "Quota service unavailable" });
    const response = await fetch(
      `${base}/rest/v1/rpc/consume_guest_ai_budgets`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_rules: rules }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok)
      return respond(503, { error: "Quota service unavailable" });
    return respond(200, await response.json());
  } catch {
    return respond(503, { error: "Quota service unavailable" });
  }
});
