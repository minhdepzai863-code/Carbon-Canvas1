import express from "express";
import helmet from "helmet";
import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";
import { z } from "zod";
import { AIError, installAIRoutes } from "./ai.js";
import { installDocumentRoutes } from "./documents.js";

export function loadGuestConfig(env = process.env) {
  const config = z
    .object({
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      PORT: z.coerce.number().int().min(0).max(65535).default(3001),
      GEMINI_API_KEY: z.string().min(20),
      GEMINI_MODEL: z
        .enum(["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"])
        .default("gemini-3.6-flash"),
      FRONTEND_ORIGIN: z.string().url().optional(),
      VERCEL: z.string().optional(),
      VERCEL_URL: z.string().optional(),
      VERCEL_BRANCH_URL: z.string().optional(),
      VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
      GUEST_LIMITER_URL: z
        .literal(
          "https://nxgbmuaycudgyrxzbuks.supabase.co/functions/v1/guest-ai-limiter",
        )
        .optional(),
      CC_DEV_MEMORY_QUOTA: z.enum(["true", "false"]).optional(),
    })
    .parse(env);
  if (config.GEMINI_API_KEY.includes("REPLACE_"))
    throw new Error("Configure the server AI key");
  if (
    config.NODE_ENV === "production" &&
    (!config.GUEST_LIMITER_URL || config.CC_DEV_MEMORY_QUOTA === "true")
  )
    throw new Error(
      "Production guest mode requires distributed quota enforcement",
    );
  const origins = [
    config.FRONTEND_ORIGIN,
    ...[
      config.VERCEL_URL,
      config.VERCEL_BRANCH_URL,
      config.VERCEL_PROJECT_PRODUCTION_URL,
    ]
      .filter(Boolean)
      .map((host) => `https://${host}`),
  ];
  if (config.NODE_ENV !== "production")
    origins.push("http://127.0.0.1:5173", "http://localhost:5173");
  config.origins = origins.filter(Boolean).map((origin) => {
    const u = new URL(origin);
    if (
      u.origin !== origin ||
      u.username ||
      u.password ||
      (config.NODE_ENV === "production" && u.protocol !== "https:")
    )
      throw new Error("Use exact trusted origins");
    return origin;
  });
  if (!config.origins.length)
    throw new Error("Configure a trusted frontend origin");
  return config;
}
function hmac(config, domain, text) {
  // Domain-separated subkeys keep cookies and privacy-preserving quota keys
  // cryptographically separate. Root material remains an environment secret.
  const key = createHmac("sha256", config.GEMINI_API_KEY)
    .update(`carboncanvas/${domain}/v1`)
    .digest();
  return createHmac("sha256", key).update(text).digest("hex");
}
export function deviceCookie(config, raw, now = Date.now()) {
  const match = raw?.match(/^([a-f0-9-]{36})\.(\d{10})\.([a-f0-9]{64})$/);
  if (match) {
    const age = Math.floor(now / 1000) - Number(match[2]);
    const valid = hmac(config, "guest-cookie", `${match[1]}.${match[2]}`);
    if (
      age >= -60 &&
      age < 2592000 &&
      timingSafeEqual(Buffer.from(valid), Buffer.from(match[3]))
    )
      return { id: match[1], value: raw, fresh: false };
  }
  const id = randomUUID();
  const data = `${id}.${Math.floor(now / 1000)}`;
  return {
    id,
    value: `${data}.${hmac(config, "guest-cookie", data)}`,
    fresh: true,
  };
}
export function guestRules(config, id, ip, purpose = "ai") {
  if (purpose === "documents")
    return [
      {
        key: hmac(config, "paper-device-burst", id),
        window_seconds: 300,
        maximum: 30,
      },
      {
        key: hmac(config, "paper-device-day", id),
        window_seconds: 86400,
        maximum: 100,
      },
      {
        key: hmac(config, "paper-ip-day", ip),
        window_seconds: 86400,
        maximum: 300,
      },
      {
        key: createHash("sha256")
          .update("carboncanvas1/guest-document-budget/v1")
          .digest("hex"),
        window_seconds: 86400,
        maximum: 500,
      },
    ];
  const rule = (domain, text, window_seconds, maximum) => ({
    key: hmac(config, domain, text),
    window_seconds,
    maximum,
  });
  return [
    rule("guest-device-burst", id, 300, 6),
    rule("guest-device-day", id, 86400, 20),
    rule("guest-ip-burst", ip, 300, 12),
    rule("guest-ip-day", ip, 86400, 60),
    {
      key: createHash("sha256")
        .update("carboncanvas1/guest-global-ai-budget/v1")
        .digest("hex"),
      window_seconds: 86400,
      maximum: 200,
    },
  ];
}
export async function remoteGuestQuota(config, rules, request) {
  const token = request.headers["x-vercel-oidc-token"];
  if (!config.GUEST_LIMITER_URL || typeof token !== "string")
    throw new AIError(
      503,
      "QUOTA_UNAVAILABLE",
      "The testing quota service is unavailable. Your work remains saved on this device.",
    );
  const response = await fetch(config.GUEST_LIMITER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new AIError(
      503,
      "QUOTA_UNAVAILABLE",
      "The testing quota service is unavailable. Your work remains saved on this device.",
    );
  return z
    .object({
      allowed: z.boolean(),
      retryAfter: z.number().int().positive().nullable(),
    })
    .parse(await response.json());
}
export function createGuestApp(config, { checkQuota, ...aiDependencies } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Request-Id", randomUUID());
    if (req.headers.origin && !config.origins.includes(req.headers.origin))
      return res.status(403).json({ error: "Origin not allowed" });
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (!req.headers.origin || req.headers["sec-fetch-site"] === "cross-site")
    )
      return res.status(403).json({ error: "Use the same-origin app" });
    next();
  });
  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", mode: "guest-testing", storage: "device-local" }),
  );
  const memory = new Map(); // Explicit localhost development only, never deployed.
  const localQuota = async (rules) => {
    const now = Date.now();
    for (const r of rules) {
      const previous = memory.get(r.key);
      if (previous && previous.expires > now && previous.count >= r.maximum)
        return {
          allowed: false,
          retryAfter: Math.ceil((previous.expires - now) / 1000),
        };
    }
    for (const r of rules) {
      const previous = memory.get(r.key);
      memory.set(
        r.key,
        previous && previous.expires > now
          ? { ...previous, count: previous.count + 1 }
          : { count: 1, expires: now + r.window_seconds * 1000 },
      );
    }
    return { allowed: true, retryAfter: null };
  };
  const enforceBudget = (purpose) => async (req, res, next) => {
    const raw = (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("cc-guest="))
      ?.slice(9);
    const device = deviceCookie(config, raw);
    if (device.fresh)
      res.cookie("cc-guest", device.value, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2592000000,
        path: "/",
      });
    const forwarded =
      config.VERCEL === "1" ? req.headers["x-vercel-forwarded-for"] : undefined;
    const ip =
      typeof forwarded === "string" && isIP(forwarded)
        ? forwarded
        : req.socket.remoteAddress || "unknown";
    const rules = guestRules(config, device.id, ip, purpose);
    const allowed = await (
      checkQuota ||
      (config.NODE_ENV !== "production" && config.CC_DEV_MEMORY_QUOTA === "true"
        ? localQuota
        : (rules) => remoteGuestQuota(config, rules, req))
    )(rules);
    if (!allowed.allowed)
      return res
        .set("Retry-After", String(allowed.retryAfter))
        .status(429)
        .json({
          code: purpose === "ai" ? "AI_RATE_LIMITED" : "DOCUMENT_RATE_LIMITED",
          error:
            purpose === "ai"
              ? "The guest testing AI allowance is reached. Try again later; your work is saved on this device."
              : "The paper download allowance is reached. Use a retained PDF or the original source link; your saved answers and ink are unchanged.",
        });
    res.locals.userId = device.id;
    next();
  };
  installDocumentRoutes(
    app,
    enforceBudget("documents"),
    aiDependencies.fetchPdf,
  );
  installAIRoutes(app, {
    config,
    jsonParser: express.json({ limit: "3mb", strict: true }),
    quotaOverride: enforceBudget("ai"),
    persistAssessments: false,
    ...aiDependencies,
  });
  app.use((_req, res) =>
    res.status(404).json({
      code: "NOT_FOUND",
      error: "Account endpoints are disabled in guest testing mode",
    }),
  );
  app.use((error, _req, res, _next) => {
    if (error instanceof z.ZodError)
      return res
        .status(400)
        .json({ code: "INVALID_INPUT", error: "Invalid request data" });
    if (error instanceof AIError)
      return res
        .status(error.status)
        .json({ code: error.code, error: error.message });
    if (error.type === "entity.too.large")
      return res.status(413).json({ error: "Request too large" });
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ error: "Malformed JSON" });
    console.error(
      "Guest API failed",
      res.getHeader("X-Request-Id"),
      error.name,
    );
    res.status(503).json({
      error:
        "The AI service is temporarily unavailable. Your local work is unchanged.",
    });
  });
  return { app };
}
