import { z } from "zod";
import { isIP } from "node:net";

export function loadConfig(env = process.env) {
  const schema = z.object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().min(0).max(65535).default(3001),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    FRONTEND_ORIGIN: z.string().url(),
    EMAIL_ENCRYPTION_KEY: z.string().regex(/^[a-f\d]{64}$/i),
    EMAIL_FROM: z.string().min(5).max(254),
    SMTP_URL: z.string().url(),
    GEMINI_API_KEY: z.string().min(20).optional(),
    GEMINI_MODEL: z
      .enum(["gemini-3.8-flash", "gemini-3.5-flash-lite"])
      .default("gemini-3.8-flash"),
    DB_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
    DATABASE_SSL: z.enum(["true", "false"]).default("true"),
    DATABASE_CA_FILE: z.string().optional(),
    TRUSTED_PROXY_CIDRS: z.string().default(""),
  });
  const result = schema.safeParse(env);
  if (!result.success)
    throw new Error(
      "Invalid server environment: " +
        result.error.issues.map((i) => i.path.join(".")).join(", "),
    );
  const c = result.data;
  for (const key of ["BETTER_AUTH_URL", "FRONTEND_ORIGIN"]) {
    const url = new URL(c[key]);
    if (url.origin !== c[key] || url.username || url.password)
      throw new Error(`${key} must be an exact origin without a path`);
    if (c.NODE_ENV === "production" && url.protocol !== "https:")
      throw new Error(`${key} requires HTTPS in production`);
  }
  if (!["postgres:", "postgresql:"].includes(new URL(c.DATABASE_URL).protocol))
    throw new Error("DATABASE_URL must be PostgreSQL");
  if (!["smtp:", "smtps:"].includes(new URL(c.SMTP_URL).protocol))
    throw new Error("SMTP_URL must be an SMTP endpoint");
  if (c.BETTER_AUTH_SECRET.includes("REPLACE_"))
    throw new Error("Replace the auth secret placeholder");
  if (c.NODE_ENV === "production" && c.DATABASE_SSL !== "true")
    throw new Error("Production database requires verified TLS");
  c.trustedProxies = c.TRUSTED_PROXY_CIDRS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const cidr of c.trustedProxies) {
    const [address, prefix, extra] = cidr.split("/");
    const version = isIP(address);
    if (
      !version ||
      extra ||
      (prefix !== undefined &&
        (!/^\d+$/.test(prefix) ||
          +prefix < (version === 4 ? 8 : 32) ||
          +prefix > (version === 4 ? 32 : 128)))
    )
      throw new Error("Use narrow explicit proxy IPs/CIDRs");
  }
  return c;
}
