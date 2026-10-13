import express from "express";
import helmet from "helmet";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import { createAuth } from "./auth.js";
import { createLimiter } from "./rate-limit.js";
import { withUser } from "./db.js";
import { COURSES, getStudyGuide } from "../../content/curriculum.ts";
import {
  getQuestionBank,
  drawPracticeSet,
  paperSources,
} from "../../content/questionBank.ts";
import {
  PAST_PAPERS,
  publicPaper,
  gradeMcqPaper,
} from "../../content/pastPapers.ts";

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const password = z.string().min(12).max(128);
const origin = z.string().url();
const authBodies = {
  "/sign-up/email": z
    .object({
      email,
      password,
      name: z.string().trim().min(1).max(100),
      callbackURL: origin.optional(),
    })
    .strict(),
  "/sign-in/email": z
    .object({
      email,
      password: z.string().min(1).max(128),
      rememberMe: z.boolean().optional(),
      callbackURL: origin.optional(),
    })
    .strict(),
  "/sign-out": z.object({}).strict(),
  "/request-password-reset": z
    .object({ email, redirectTo: origin.optional() })
    .strict(),
  "/reset-password": z
    .object({ token: z.string().min(1).max(2048), newPassword: password })
    .strict(),
  "/send-verification-email": z
    .object({ email, callbackURL: origin.optional() })
    .strict(),
};
const course = z.enum(["ALEVEL", "IB"]);
const moduleBody = z.object({ course, moduleId: z.string().min(1).max(64) });
const stateBody = z
  .object({
    version: z.number().int().min(0),
    data: z
      .object({
        course,
        completed: z.array(z.string().max(64)).max(200),
        bookmarks: z.array(z.string().max(64)).max(200).default([]),
        savedStructures: z
          .array(
            z
              .object({
                id: z.string().max(64),
                name: z.string().max(200),
                smiles: z.string().max(4000),
              })
              .strict(),
          )
          .max(200)
          .default([]),
        flashcardSettings: z
          .object({
            batchSize: z.number().int().min(5).max(100),
            mode: z.enum(["all", "due", "unmastered"]),
          })
          .strict()
          .optional(),
      })
      .strict(),
  })
  .strict();

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const bad = (message) => {
  throw new HttpError(400, "INVALID_INPUT", message);
};
function requireModule(value) {
  if (!COURSES[value.course].modules.some((m) => m.id === value.moduleId))
    bad("Module does not belong to the selected course");
}
function publicQuestion(q) {
  const { correctAnswer, explanation, ...publicFields } = q;
  return publicFields;
}

export function createApp(pool, config) {
  const app = express();
  const auth = createAuth(pool, config);
  const limit = createLimiter(pool, config.BETTER_AUTH_SECRET);
  app.disable("x-powered-by");
  app.set(
    "trust proxy",
    config.trustedProxies?.length ? config.trustedProxies : false,
  );
  app.use(helmet({ referrerPolicy: { policy: "no-referrer" } }));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Request-Id", randomUUID());
    if (
      req.headers.origin &&
      ![config.FRONTEND_ORIGIN, config.BETTER_AUTH_URL].includes(
        req.headers.origin,
      )
    )
      return res
        .status(403)
        .json({ code: "UNTRUSTED_ORIGIN", error: "Origin not allowed" });
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !req.headers.origin)
      return res
        .status(403)
        .json({ code: "ORIGIN_REQUIRED", error: "Origin header required" });
    if (req.headers["sec-fetch-site"] === "cross-site")
      return res.status(403).json({
        code: "CROSS_SITE_REQUEST",
        error: "Use a same-site API deployment",
      });
    next();
  });
  app.use(
    cors({
      origin: [config.FRONTEND_ORIGIN, config.BETTER_AUTH_URL],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"],
      exposedHeaders: ["Retry-After"],
    }),
  );
  app.use(express.json({ limit: "64kb", strict: true }));
  const authHeaders = (req) => {
    const h = fromNodeHeaders(req.headers);
    h.delete("content-length");
    for (const name of [
      "x-forwarded-for",
      "x-real-ip",
      "cf-connecting-ip",
      "x-cc-client-ip",
      "authorization",
    ])
      h.delete(name);
    h.set("x-cc-client-ip", req.ip || req.socket.remoteAddress || "127.0.0.1");
    return h;
  };
  app.get("/api/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  app.all("/api/auth/*splat", async (req, res) => {
    const path = req.path.slice("/api/auth".length);
    if (req.method === "POST") {
      if (!authBodies[path])
        throw new HttpError(404, "NOT_FOUND", "Endpoint not available");
      if (!req.is("application/json"))
        throw new HttpError(415, "JSON_REQUIRED", "Use application/json");
      req.body = authBodies[path].parse(req.body ?? {});
      if (req.body.email) {
        const result = await limit("account:" + path + ":" + req.body.email, {
          window: 900,
          max: 10,
        });
        if (!result.allowed)
          return res
            .set("Retry-After", String(result.retryAfter))
            .status(429)
            .json({
              code: "RATE_LIMITED",
              error: "Too many attempts. Try again later.",
            });
      }
    } else if (
      req.method !== "GET" ||
      !["/verify-email", "/get-session", "/ok"].includes(path)
    )
      throw new HttpError(404, "NOT_FOUND", "Endpoint not available");
    const request = new Request(config.BETTER_AUTH_URL + req.originalUrl, {
      method: req.method,
      headers: authHeaders(req),
      ...(req.method === "POST" ? { body: JSON.stringify(req.body) } : {}),
    });
    const response = await auth.handler(request);
    const cookies = response.headers.getSetCookie();
    for (const [key, value] of response.headers)
      if (!["set-cookie", "content-length", "cache-control"].includes(key))
        res.set(key, value);
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    const retry = response.headers.get("x-retry-after");
    if (retry) res.set("Retry-After", retry);
    res.status(response.status).send(await response.text());
  });
  // Public reading data has no private answers/session information.
  app.get("/api/papers", (req, res) => {
    const value = z
      .object({
        format: z.enum(["mcq", "frq"]).optional(),
        year: z.coerce.number().int().min(2018).max(2026).optional(),
        session: z.enum(["march", "may-june", "oct-nov"]).optional(),
      })
      .strict()
      .parse(req.query);
    res.json({
      checkedOn: "2026-10-14",
      papers: PAST_PAPERS.filter(
        (p) =>
          (!value.format || p.format === value.format) &&
          (!value.year || p.year === value.year) &&
          (!value.session || p.session === value.session),
      ).map(publicPaper),
    });
  });
  app.get("/api/curricula", (_req, res) =>
    res.json(
      Object.fromEntries(
        Object.entries(COURSES).map(([key, c]) => [
          key,
          {
            ...c,
            questionSources: paperSources.filter((s) => s.course === key),
          },
        ]),
      ),
    ),
  );
  app.get("/api/study/:course/:moduleId", (req, res) => {
    const value = moduleBody.parse(req.params);
    requireModule(value);
    res.json(
      getStudyGuide(
        COURSES[value.course].modules.find((m) => m.id === value.moduleId),
        value.course,
      ),
    );
  });

  app.use("/api", async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: authHeaders(req),
      query: { disableCookieCache: true },
    });
    if (!session || new Date(session.session.expiresAt) <= new Date())
      return res
        .status(401)
        .json({ code: "UNAUTHENTICATED", error: "Sign in to continue" });
    if (!session.user.emailVerified)
      return res.status(403).json({
        code: "EMAIL_UNVERIFIED",
        error: "Verify your email before continuing",
      });
    res.locals.userId = session.user.id;
    res.locals.user = session.user;
    res.locals.expiresAt = session.session.expiresAt;
    const result = await limit("api:user:" + session.user.id, {
      window: 60,
      max: 120,
    });
    if (!result.allowed)
      return res
        .set("Retry-After", String(result.retryAfter))
        .status(429)
        .json({ code: "RATE_LIMITED", error: "Too many requests" });
    next();
  });
  app.get("/api/me", (_req, res) =>
    res.json({ user: res.locals.user, expiresAt: res.locals.expiresAt }),
  );
  app.get("/api/study-state", async (_req, res) => {
    const data = await withUser(
      pool,
      res.locals.userId,
      async (db) =>
        (
          await db.query(
            "SELECT data,version,updated_at FROM cc_app.study_state WHERE user_id=$1",
            [res.locals.userId],
          )
        ).rows[0],
    );
    res.json(data || { data: null, version: 0 });
  });
  app.put("/api/study-state", async (req, res) => {
    const value = stateBody.parse(req.body);
    for (const id of [...value.data.completed, ...value.data.bookmarks])
      if (
        !Object.values(COURSES).some((c) => c.modules.some((m) => m.id === id))
      )
        bad("Unknown module in study state");
    const row = await withUser(pool, res.locals.userId, async (db) => {
      if (value.version === 0)
        return (
          await db.query(
            `INSERT INTO cc_app.study_state(user_id,data) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING data,version,updated_at`,
            [res.locals.userId, JSON.stringify(value.data)],
          )
        ).rows[0];
      return (
        await db.query(
          `UPDATE cc_app.study_state SET data=$2,version=version+1,updated_at=now() WHERE user_id=$1 AND version=$3 RETURNING data,version,updated_at`,
          [res.locals.userId, JSON.stringify(value.data), value.version],
        )
      ).rows[0];
    });
    if (!row)
      throw new HttpError(
        409,
        "VERSION_CONFLICT",
        "State changed on another device. Reload before saving.",
      );
    res.json(row);
  });
  app.get("/api/cards", async (req, res) => {
    const value = moduleBody.parse(req.query);
    requireModule(value);
    const rows = await withUser(
      pool,
      res.locals.userId,
      async (db) =>
        (
          await db.query(
            "SELECT id,front,back,updated_at FROM cc_app.cards WHERE user_id=$1 AND course=$2 AND module_id=$3 ORDER BY created_at",
            [res.locals.userId, value.course, value.moduleId],
          )
        ).rows,
    );
    res.json(rows);
  });
  app.post("/api/cards", async (req, res) => {
    const value = moduleBody
      .extend({
        front: z.string().trim().min(1).max(2000),
        back: z.string().trim().min(1).max(8000),
      })
      .strict()
      .parse(req.body);
    requireModule(value);
    const row = await withUser(pool, res.locals.userId, async (db) => {
      // Serialize per-user quotas across instances.
      await db.query('SELECT id FROM cc_auth."user" WHERE id=$1 FOR UPDATE', [
        res.locals.userId,
      ]);
      if (
        Number(
          (
            await db.query(
              "SELECT count(*) FROM cc_app.cards WHERE user_id=$1",
              [res.locals.userId],
            )
          ).rows[0].count,
        ) >= 2000
      )
        throw new HttpError(409, "CARD_LIMIT", "Card limit reached");
      return (
        await db.query(
          "INSERT INTO cc_app.cards(id,user_id,course,module_id,front,back) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,front,back",
          [
            randomUUID(),
            res.locals.userId,
            value.course,
            value.moduleId,
            value.front,
            value.back,
          ],
        )
      ).rows[0];
    });
    res.status(201).json(row);
  });
  app.delete("/api/cards/:id", async (req, res) => {
    const id = z.uuid().parse(req.params.id);
    const count = await withUser(
      pool,
      res.locals.userId,
      async (db) =>
        (
          await db.query(
            "DELETE FROM cc_app.cards WHERE id=$1 AND user_id=$2",
            [id, res.locals.userId],
          )
        ).rowCount,
    );
    if (!count) throw new HttpError(404, "NOT_FOUND", "Card not found");
    res.status(204).end();
  });
  app.post("/api/card-reviews", async (req, res) => {
    const value = moduleBody
      .extend({
        cardId: z.string().min(1).max(150),
        rating: z.number().int().min(0).max(3),
      })
      .strict()
      .parse(req.body);
    requireModule(value);
    const row = await withUser(pool, res.locals.userId, async (db) => {
      const guide = getStudyGuide(
        COURSES[value.course].modules.find((m) => m.id === value.moduleId),
        value.course,
      );
      if (
        !guide.flashcards.some((c) => c.id === value.cardId) &&
        !(
          await db.query(
            "SELECT id FROM cc_app.cards WHERE id::text=$1 AND user_id=$2 AND module_id=$3 AND course=$4",
            [value.cardId, res.locals.userId, value.moduleId, value.course],
          )
        ).rowCount
      )
        bad("Unknown card");
      return (
        await db.query(
          `INSERT INTO cc_app.card_reviews(id,user_id,card_id,course,module_id,rating,due_at) VALUES($1,$2,$3,$4,$5,$6,now()+$7*interval '1 day') RETURNING id,due_at`,
          [
            randomUUID(),
            res.locals.userId,
            value.cardId,
            value.course,
            value.moduleId,
            value.rating,
            [0, 1, 3, 7][value.rating],
          ],
        )
      ).rows[0];
    });
    res.status(201).json(row);
  });
  app.get("/api/card-reviews", async (_req, res) =>
    res.json(
      await withUser(
        pool,
        res.locals.userId,
        async (db) =>
          (
            await db.query(
              "SELECT card_id,rating,reviewed_at,due_at FROM cc_app.card_reviews WHERE user_id=$1 ORDER BY reviewed_at DESC LIMIT 1000",
              [res.locals.userId],
            )
          ).rows,
      ),
    ),
  );
  app.get("/api/questions", (req, res) => {
    const value = moduleBody
      .extend({ limit: z.coerce.number().int().min(1).max(100).default(40) })
      .parse(req.query);
    requireModule(value);
    res.json({
      questions: getQuestionBank(value.course, value.moduleId)
        .slice(0, value.limit)
        .map(publicQuestion),
      sources: paperSources.filter((s) => s.course === value.course),
      reviewedThrough: 2026,
      coverage:
        "Not a complete archive through 2026; original items and licensed subsets only",
    });
  });
  app.post("/api/papers/:id/grade", async (req, res) => {
    const id = z
      .string()
      .regex(/^9701_[msw](?:18|19|2[0-6])_qp_1[1-9]$/)
      .parse(req.params.id);
    const value = z
      .object({
        answers: z.record(
          z.string().regex(/^(?:[1-9]|[1-3][0-9]|40)$/),
          z.enum(["A", "B", "C", "D"]),
        ),
      })
      .strict()
      .parse(req.body);
    const paper = PAST_PAPERS.find((p) => p.id === id);
    if (!paper || !paper.answerKey)
      throw new HttpError(
        404,
        "NO_ANSWER_KEY",
        "No verified key for this paper",
      );
    const result = gradeMcqPaper(paper, value.answers);
    const attemptId = randomUUID();
    await withUser(pool, res.locals.userId, (db) =>
      db.query(
        "INSERT INTO cc_app.paper_attempts(id,user_id,paper_id,marks,maximum,feedback,grading_method) VALUES($1,$2,$3,$4,$5,$6,'markscheme-answer-key')",
        [
          attemptId,
          res.locals.userId,
          paper.id,
          result.score,
          result.maximum,
          JSON.stringify({
            ...result,
            answerKeySha256: paper.answerKeySha256,
            serverComputed: true,
          }),
        ],
      ),
    );
    res.status(201).json({ attemptId, ...result });
  });
  app.post("/api/practice/sessions", async (req, res) => {
    const value = moduleBody
      .extend({
        count: z.number().int().min(1).max(40).default(10),
        source: z.enum(["mixed", "past-paper", "original"]).default("mixed"),
      })
      .strict()
      .parse(req.body);
    requireModule(value);
    const questions = drawPracticeSet(
      value.course,
      value.moduleId,
      value.count,
      value.source,
    );
    if (!questions.length)
      throw new HttpError(
        404,
        "NO_QUESTIONS",
        "No licensed or original questions available for this module",
      );
    const id = randomUUID();
    await withUser(pool, res.locals.userId, (db) =>
      db.query(
        "INSERT INTO cc_app.practice_sessions(id,user_id,course,module_id,questions) VALUES($1,$2,$3,$4,$5)",
        [
          id,
          res.locals.userId,
          value.course,
          value.moduleId,
          JSON.stringify(questions),
        ],
      ),
    );
    res.status(201).json({ id, questions: questions.map(publicQuestion) });
  });
  app.post("/api/practice/sessions/:id/submit", async (req, res) => {
    const id = z.uuid().parse(req.params.id);
    const value = z
      .object({
        answers: z
          .array(
            z
              .object({
                questionId: z.string().max(150),
                answer: z.string().max(2000),
              })
              .strict(),
          )
          .min(1)
          .max(40),
      })
      .strict()
      .parse(req.body);
    const result = await withUser(pool, res.locals.userId, async (db) => {
      const session = (
        await db.query(
          "SELECT * FROM cc_app.practice_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE",
          [id, res.locals.userId],
        )
      ).rows[0];
      if (!session)
        throw new HttpError(404, "NOT_FOUND", "Practice session not found");
      if (session.submitted_at) return session.result;
      if (new Date(session.expires_at) <= new Date())
        throw new HttpError(410, "SESSION_EXPIRED", "Practice session expired");
      const answers = new Map(
        value.answers.map((a) => [a.questionId, a.answer]),
      );
      if (
        answers.size !== value.answers.length ||
        answers.size !== session.questions.length ||
        session.questions.some((q) => !answers.has(q.bankId))
      )
        bad("Submit exactly one answer for each question");
      const feedback = session.questions.map((q) => ({
        questionId: q.bankId,
        correct: answers.get(q.bankId) === q.correctAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        source: q.source,
      }));
      const score = feedback.filter((f) => f.correct).length;
      const result = {
        score,
        maximum: feedback.length,
        percentage: Math.round((100 * score) / feedback.length),
        grading: "answer-key",
        feedback,
      };
      await db.query(
        "UPDATE cc_app.practice_sessions SET result=$1,submitted_at=now() WHERE id=$2 AND user_id=$3",
        [JSON.stringify(result), id, res.locals.userId],
      );
      return result;
    });
    res.json(result);
  });
  app.get("/api/practice/history", async (_req, res) =>
    res.json(
      await withUser(
        pool,
        res.locals.userId,
        async (db) =>
          (
            await db.query(
              "SELECT id,course,module_id,created_at,submitted_at,result FROM cc_app.practice_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100",
              [res.locals.userId],
            )
          ).rows,
      ),
    ),
  );
  app.post("/api/paper-attempts", async (req, res) => {
    const value = z
      .object({
        paperId: z.string().max(150),
        marks: z.number().nonnegative(),
        maximum: z.number().positive().max(500),
        feedback: z.string().max(8000).default(""),
      })
      .strict()
      .parse(req.body);
    if (
      value.marks > value.maximum ||
      !paperSources.some((p) => p.id === value.paperId)
    )
      bad("Invalid paper or score");
    const row = await withUser(
      pool,
      res.locals.userId,
      async (db) =>
        (
          await db.query(
            "INSERT INTO cc_app.paper_attempts(id,user_id,paper_id,marks,maximum,feedback) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,created_at",
            [
              randomUUID(),
              res.locals.userId,
              value.paperId,
              value.marks,
              value.maximum,
              value.feedback,
            ],
          )
        ).rows[0],
    );
    res.status(201).json({ ...row, grading: "self-reported" });
  });
  app.get("/api/paper-attempts", async (_req, res) =>
    res.json(
      await withUser(
        pool,
        res.locals.userId,
        async (db) =>
          (
            await db.query(
              "SELECT id,paper_id,marks,maximum,feedback,grading_method,created_at FROM cc_app.paper_attempts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100",
              [res.locals.userId],
            )
          ).rows,
      ),
    ),
  );
  app.use((_req, res) =>
    res.status(404).json({ code: "NOT_FOUND", error: "Endpoint not found" }),
  );
  app.use((error, _req, res, _next) => {
    if (error instanceof z.ZodError)
      return res.status(400).json({
        code: "INVALID_INPUT",
        error: "Invalid request data",
        fields: [...new Set(error.issues.map((i) => i.path.join(".")))],
      });
    if (error instanceof HttpError)
      return res
        .status(error.status)
        .json({ code: error.code, error: error.message });
    if (error.type === "entity.too.large")
      return res
        .status(413)
        .json({ code: "PAYLOAD_TOO_LARGE", error: "Request too large" });
    if (error.type === "entity.parse.failed")
      return res
        .status(400)
        .json({ code: "INVALID_JSON", error: "Malformed JSON" });
    console.error(
      "API request failed",
      res.getHeader("X-Request-Id"),
      error.name,
      error.code || "INTERNAL",
    );
    res.status(503).json({
      code: "SERVICE_UNAVAILABLE",
      error: "Service temporarily unavailable",
    });
  });
  return { app, auth };
}
