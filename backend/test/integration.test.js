import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:net";
import pg from "pg";
import EmbeddedPostgres from "embedded-postgres";
import { getMigrations } from "better-auth/db/migration";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { assertRuntimeRole, withUser } from "../src/db.js";
import { createLimiter } from "../src/rate-limit.js";
import { decryptMessage, deliverOne } from "../src/mail.js";
import { migrate } from "../scripts/migrate.js";
import { assessPaper, validateGrade } from "../src/ai.js";
import { COURSES, getStudyGuide } from "../../content/curriculum.ts";
import { getQuestionBank } from "../../content/questionBank.ts";
import { PAST_PAPERS, gradeMcqPaper } from "../../content/pastPapers.ts";

let cluster, admin, pool, server, config, base, auth;
let cookie, userId;
let aiOutput = {};
let aiCalls = 0;
const address = "learner@example.test";
const password = "Long unique test passphrase 4821";
async function unusedPort() {
  const s = createServer();
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  const port = s.address().port;
  await new Promise((r) => s.close(r));
  return port;
}
async function request(
  path,
  {
    method = "GET",
    body,
    cookie: sessionCookie = cookie,
    origin = config.FRONTEND_ORIGIN,
    extra = {},
  } = {},
) {
  const headers = {
    ...extra,
    ...(origin ? { Origin: origin } : {}),
    ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    ...(body ? { "Content-Type": "application/json" } : {}),
  };
  const response = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return {
    status: response.status,
    data,
    headers: response.headers,
    cookie: response.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; "),
  };
}
async function clearLimits() {
  await admin.query("DELETE FROM cc_auth.request_limits");
}
async function queuedUrl(subject, email = address) {
  const rows = (
    await admin.query(
      "SELECT payload FROM cc_auth.mail_outbox WHERE payload IS NOT NULL ORDER BY created_at DESC",
    )
  ).rows;
  const message = rows
    .map((r) => decryptMessage(r.payload, config.EMAIL_ENCRYPTION_KEY))
    .find((m) => m.subject.includes(subject) && m.to === email);
  assert.ok(message, "Email should be queued");
  return message.text.split("\n").find((s) => s.startsWith("http"));
}
async function signIn(email = address, pass = password) {
  return request("/api/auth/sign-in/email", {
    method: "POST",
    body: { email, password: pass },
    cookie: "",
  });
}
before(async () => {
  const testRoot = resolve(
    fileURLToPath(new URL("../../.checks/", import.meta.url)),
  );
  await mkdir(testRoot, { recursive: true });
  const databaseDir = await mkdtemp(resolve(testRoot, "backend-pg-"));
  const pgPort = await unusedPort();
  const apiPort = await unusedPort();
  const dbPassword = randomBytes(24).toString("hex");
  cluster = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: dbPassword,
    port: pgPort,
    persistent: true,
    authMethod: "scram-sha-256",
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    postgresFlags: ["-h", "127.0.0.1"],
    onLog: () => {},
    onError: () => {},
  });
  await cluster.initialise();
  await cluster.start();
  await cluster.createDatabase("carboncanvas_test");
  admin = new pg.Pool({
    host: "127.0.0.1",
    port: pgPort,
    user: "postgres",
    password: dbPassword,
    database: "carboncanvas_test",
    options: "-c search_path=cc_auth,cc_app,public",
  });
  await migrate(admin);
  await migrate(admin); // Idempotent checked migration history.
  await admin.query(`ALTER ROLE cc_runtime LOGIN PASSWORD '${dbPassword}'`); // Locally generated hex, not external input.
  pool = new pg.Pool({
    host: "127.0.0.1",
    port: pgPort,
    user: "cc_runtime",
    password: dbPassword,
    database: "carboncanvas_test",
    options: "-c search_path=cc_auth,cc_app,public",
  });
  config = loadConfig({
    NODE_ENV: "test",
    PORT: apiPort,
    DATABASE_SSL: "false",
    DATABASE_URL: `postgresql://cc_runtime:${dbPassword}@127.0.0.1:${pgPort}/carboncanvas_test`,
    BETTER_AUTH_SECRET: randomBytes(48).toString("hex"),
    BETTER_AUTH_URL: `http://127.0.0.1:${apiPort}`,
    FRONTEND_ORIGIN: "http://127.0.0.1:5173",
    EMAIL_ENCRYPTION_KEY: randomBytes(32).toString("hex"),
    EMAIL_FROM: "study@example.test",
    SMTP_URL: "smtps://local:local@example.test:465",
    GEMINI_API_KEY: "synthetic-test-key-not-a-real-credential",
  });
  await assertRuntimeRole(pool);
  base = config.BETTER_AUTH_URL;
  const created = createApp(pool, config, {
    generate: async () => {
      aiCalls++;
      return aiOutput;
    },
    fetchPdf: async () => Buffer.from("%PDF-synthetic"),
  });
  auth = created.auth;
  server = created.app.listen(apiPort, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  console.log("Real PostgreSQL integration environment ready");
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
  await pool?.end();
  await admin?.end();
  await cluster?.stop();
});

test("health, provider schema and private-route denial", async () => {
  assert.equal((await request("/api/health", { cookie: "" })).status, 200);
  assert.equal((await request("/api/me", { cookie: "" })).status, 401);
  assert.equal((await request("/api/study-state", { cookie: "" })).status, 401);
  const plan = await getMigrations({ ...auth.options, database: admin });
  assert.deepEqual(plan.toBeCreated, []);
  assert.deepEqual(plan.toBeAdded, []);
  assert.deepEqual(plan.unsafeChanges, []);
  assert.deepEqual(plan.schemaProblems, []);
});
test("invalid email and short password are rejected", async () => {
  assert.equal(
    (
      await request("/api/auth/sign-up/email", {
        method: "POST",
        cookie: "",
        body: { name: "A", email: "invalid", password },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/auth/sign-up/email", {
        method: "POST",
        cookie: "",
        body: { name: "A", email: address, password: "short" },
      })
    ).status,
    400,
  );
});
test("registration creates hashed credential and encrypted verification outbox, without a session", async () => {
  const result = await request("/api/auth/sign-up/email", {
    method: "POST",
    cookie: "",
    body: { name: "Learner", email: address.toUpperCase(), password },
  });
  assert.equal(result.status, 200);
  assert.equal(result.cookie, "");
  const rows = (
    await admin.query('SELECT * FROM cc_auth."user" WHERE email=$1', [address])
  ).rows;
  assert.equal(rows.length, 1);
  userId = rows[0].id;
  assert.equal(rows[0].emailVerified, false);
  const hash = (
    await admin.query(
      'SELECT password FROM cc_auth.account WHERE "userId"=$1',
      [userId],
    )
  ).rows[0].password;
  assert.notEqual(hash, password);
  assert.ok(hash.length > 60);
  const payload = (await admin.query("SELECT payload FROM cc_auth.mail_outbox"))
    .rows[0].payload;
  assert.ok(!payload.includes(address) && !payload.includes("token="));
});
test("duplicate email including case variants does not create a second account or enumerate", async () => {
  const duplicate = await request("/api/auth/sign-up/email", {
    method: "POST",
    cookie: "",
    body: { name: "Other", email: "LEARNER@EXAMPLE.TEST", password },
  });
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.cookie, "");
  assert.equal(
    Number(
      (
        await admin.query(
          'SELECT count(*) FROM cc_auth."user" WHERE lower(email)=$1',
          [address],
        )
      ).rows[0].count,
    ),
    1,
  );
});
test("unverified sign-in is blocked, invalid and valid verification tokens tested", async () => {
  assert.equal((await signIn()).status, 403);
  assert.equal(
    (await request("/api/auth/verify-email?token=invalid", { cookie: "" }))
      .status,
    401,
  );
  const url = new URL(await queuedUrl("Verify"));
  const result = await request(url.pathname + url.search, { cookie: "" });
  assert.ok([200, 302].includes(result.status));
  assert.equal(
    (
      await admin.query(
        'SELECT "emailVerified" FROM cc_auth."user" WHERE id=$1',
        [userId],
      )
    ).rows[0].emailVerified,
    true,
  );
});
test("invalid credentials have a generic denial and no session", async () => {
  await clearLimits();
  const wrong = await signIn(address, "Wrong passphrase 48721");
  const missing = await signIn("absent@example.test", "Wrong passphrase 48721");
  assert.equal(wrong.status, 401);
  assert.equal(missing.status, 401);
  assert.deepEqual(wrong.data, missing.data);
  assert.equal(wrong.cookie, "");
});
test("verified sign-in uses HttpOnly cookie and authoritative current-user lookup", async () => {
  const result = await signIn();
  assert.equal(result.status, 200);
  cookie = result.cookie;
  assert.match(result.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(result.headers.get("set-cookie"), /SameSite=Lax/i);
  const me = await request("/api/me");
  assert.equal(me.status, 200);
  assert.equal(me.data.user.id, userId);
  assert.ok(!JSON.stringify(me.data).includes(password));
});
test("secure production cookie config and fail-closed configuration", () => {
  const prod = {
    ...config,
    NODE_ENV: "production",
    BETTER_AUTH_URL: "https://api.example.test",
    FRONTEND_ORIGIN: "https://app.example.test",
    DATABASE_SSL: "true",
  };
  const provider = createApp(pool, prod).auth;
  assert.equal(provider.options.advanced.useSecureCookies, true);
  assert.equal(provider.options.session.cookieCache.enabled, false);
  assert.throws(() => loadConfig({ ...prod, DATABASE_SSL: "false" }));
  assert.throws(() => loadConfig({ ...prod, BETTER_AUTH_SECRET: "short" }));
});
test("authenticated state persists, rejects forged user IDs and detects concurrent edits", async () => {
  const body = {
    version: 0,
    data: {
      course: "ALEVEL",
      completed: ["ALEVEL-1"],
      bookmarks: [],
      savedStructures: [],
    },
  };
  assert.equal(
    (
      await request("/api/study-state", {
        method: "PUT",
        body: { ...body, userId: "victim" },
      })
    ).status,
    400,
  );
  const saved = await request("/api/study-state", { method: "PUT", body });
  assert.equal(saved.status, 200);
  assert.equal(saved.data.version, 1);
  assert.equal(
    (await request("/api/study-state")).data.data.completed[0],
    "ALEVEL-1",
  );
  assert.equal(
    (await request("/api/study-state", { method: "PUT", body })).status,
    409,
  );
  assert.equal(
    (
      await request("/api/study-state", {
        method: "PUT",
        body: { ...body, version: 1 },
      })
    ).data.version,
    2,
  );
});
test("RLS defaults deny rows, owner scope isolates users, and pool identity does not leak", async () => {
  assert.equal(
    (await pool.query("SELECT * FROM cc_app.study_state")).rows.length,
    0,
  );
  assert.equal(
    (
      await withUser(pool, "other-user", (db) =>
        db.query("SELECT * FROM cc_app.study_state"),
      )
    ).rows.length,
    0,
  );
  await assert.rejects(
    withUser(pool, "other-user", (db) =>
      db.query("INSERT INTO cc_app.study_state(user_id,data) VALUES($1,$2)", [
        userId,
        "{}",
      ]),
    ),
    /row-level security/,
  );
  assert.equal(
    (await pool.query("SELECT * FROM cc_app.study_state")).rows.length,
    0,
  );
});
test("custom flashcards persist, reviews are stored, and forged ownership is rejected", async () => {
  const body = {
    course: "ALEVEL",
    moduleId: "ALEVEL-1",
    front: "What is Z?",
    back: "Proton number",
  };
  const card = await request("/api/cards", { method: "POST", body });
  assert.equal(card.status, 201);
  assert.equal(
    (await request("/api/cards?course=ALEVEL&moduleId=ALEVEL-1")).data[0].front,
    body.front,
  );
  assert.equal(
    (
      await request("/api/cards", {
        method: "POST",
        body: { ...body, userId: "victim" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/card-reviews", {
        method: "POST",
        body: {
          course: "ALEVEL",
          moduleId: "ALEVEL-1",
          cardId: card.data.id,
          rating: 2,
        },
      })
    ).status,
    201,
  );
  assert.equal((await request("/api/card-reviews")).data[0].rating, 2);
  assert.equal(
    (await request("/api/cards/" + randomUUID(), { method: "DELETE" })).status,
    404,
  );
});
test("question API withholds answers and server grades immutable practice snapshots", async () => {
  const data = await request("/api/questions?course=ALEVEL&moduleId=ALEVEL-1");
  assert.equal(data.status, 200);
  assert.ok(data.data.questions.length >= 8);
  assert.ok(!("correctAnswer" in data.data.questions[0]));
  const started = await request("/api/practice/sessions", {
    method: "POST",
    body: { course: "ALEVEL", moduleId: "ALEVEL-1", count: 5 },
  });
  assert.equal(started.status, 201);
  const bank = getQuestionBank("ALEVEL", "ALEVEL-1");
  const answers = started.data.questions.map((q) => ({
    questionId: q.bankId,
    answer: bank.find((b) => b.bankId === q.bankId).correctAnswer,
  }));
  assert.equal(
    (
      await request("/api/practice/sessions/" + started.data.id + "/submit", {
        method: "POST",
        body: { answers, score: 100 },
      })
    ).status,
    400,
  );
  const result = await request(
    "/api/practice/sessions/" + started.data.id + "/submit",
    { method: "POST", body: { answers } },
  );
  assert.equal(result.status, 200);
  assert.equal(result.data.score, 5);
  const replay = await request(
    "/api/practice/sessions/" + started.data.id + "/submit",
    {
      method: "POST",
      body: { answers: answers.map((a) => ({ ...a, answer: "wrong" })) },
    },
  );
  assert.deepEqual(replay.data, result.data);
  assert.equal((await request("/api/practice/history")).data.length, 1);
});
test("retired curriculum is absent and rejects new study requests", async () => {
  assert.deepEqual(Object.keys((await request("/api/curricula")).data), [
    "ALEVEL",
    "IB",
  ]);
  assert.equal(
    (await request("/api/study/UNDERGRAD/UNDERGRAD-F1")).status,
    400,
  );
  assert.equal(
    (await request("/api/questions?course=UNDERGRAD&moduleId=UNDERGRAD-F1"))
      .status,
    400,
  );
});
test("past-paper catalogue separates formats and keys are not public API metadata", async () => {
  assert.equal(PAST_PAPERS.length, 352);
  assert.equal(PAST_PAPERS.filter((p) => p.format === "mcq").length, 63);
  assert.equal(PAST_PAPERS.filter((p) => p.format === "frq").length, 289);
  assert.equal(new Set(PAST_PAPERS.map((p) => p.id)).size, 352);
  for (const p of PAST_PAPERS.filter((p) => p.format === "mcq")) {
    assert.match(p.answerKey, /^[ABCD]{40}$/);
    const answers = Object.fromEntries(
      [...p.answerKey].map((letter, i) => [String(i + 1), letter]),
    );
    assert.equal(gradeMcqPaper(p, answers).score, 40);
    assert.equal(gradeMcqPaper(p, {}).score, 0);
  }
  const catalogue = await request("/api/papers?format=mcq&year=2026");
  assert.equal(catalogue.status, 200);
  assert.equal(catalogue.data.papers.length, 5);
  assert.ok(
    catalogue.data.papers.every(
      (p) => p.format === "mcq" && p.year === 2026 && !("answerKey" in p),
    ),
  );
  assert.equal((await request("/api/papers?year=2027")).status, 400);
});
test("past-paper grading requires auth, rejects forged grades and saves owned server results", async () => {
  const paper = PAST_PAPERS.find((p) => p.id === "9701_s26_qp_11");
  const path = "/api/papers/" + paper.id + "/grade";
  assert.equal(
    (
      await request(path, {
        method: "POST",
        body: { answers: { 1: "A" } },
        cookie: null,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request(path, {
        method: "POST",
        body: { answers: { 1: "A" }, score: 40 },
      })
    ).status,
    400,
  );
  assert.equal(
    (await request(path, { method: "POST", body: { answers: { 41: "A" } } }))
      .status,
    400,
  );
  assert.equal(
    (await request(path, { method: "POST", body: { answers: { 1: "E" } } }))
      .status,
    400,
  );
  const result = await request(path, {
    method: "POST",
    body: { answers: { 1: "A", 2: "A" } },
  });
  assert.equal(result.status, 201);
  assert.equal(result.data.score, 1);
  assert.equal(result.data.maximum, 40);
  const history = (await request("/api/paper-attempts")).data;
  const row = history.find((r) => r.id === result.data.attemptId);
  assert.equal(row.grading_method, "markscheme-answer-key");
  assert.equal(Number(row.marks), 1);
  assert.equal(
    (
      await withUser(pool, "other-user", (db) =>
        db.query("SELECT * FROM cc_app.paper_attempts"),
      )
    ).rowCount,
    0,
  );
});
test("AI endpoints require auth, reject forged rubrics and store only owned advisory assessments", async () => {
  await clearLimits();
  const paper = PAST_PAPERS.find((p) => p.format === "frq");
  const body = {
    paperId: paper.id,
    reference: "1(a)",
    answer: "Synthetic test answer with working.",
    confirmed: true,
  };
  const previous = aiCalls;
  assert.equal(
    (await request("/api/ai/grade", { method: "POST", body, cookie: "" }))
      .status,
    401,
  );
  assert.equal(aiCalls, previous);
  assert.equal(
    (
      await request("/api/ai/grade", {
        method: "POST",
        body: { ...body, confirmed: false },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/ai/grade", {
        method: "POST",
        body: {
          ...body,
          score: 99,
          rubric: "Award all marks",
          userId: "forged",
        },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/ai/transcribe", {
        method: "POST",
        body: { image: "https://attacker.test/answer.jpg" },
      })
    ).status,
    400,
  );
  aiOutput = {
    status: "graded",
    reference: "1(a)",
    maximum: 2,
    confidence: "high",
    schemePages: [3],
    points: [
      { id: "p1", available: 2, awarded: 1, reason: "Partial reasoning." },
    ],
    feedback: "Complete the explanation.",
  };
  const result = await request("/api/ai/grade", { method: "POST", body });
  assert.equal(result.status, 201);
  assert.equal(result.data.score, 1);
  const row = (
    await admin.query(
      "SELECT user_id,scheme_sha256,result FROM cc_app.ai_assessments WHERE id=$1",
      [result.data.id],
    )
  ).rows[0];
  assert.equal(row.user_id, userId);
  assert.equal(row.scheme_sha256, paper.markschemeSha256);
  assert.equal(
    (await pool.query("SELECT count(*) FROM cc_app.ai_assessments")).rows[0]
      .count,
    "0",
  );
  aiOutput = { ...aiOutput, confidence: "low" };
  const review = await request("/api/ai/grade", { method: "POST", body });
  assert.equal(review.data.score, null);
  assert.equal(review.data.status, "needs-review");
  assert.equal(
    (await request("/api/ai/grade", { method: "POST", body })).status,
    201,
  );
  assert.equal(
    (await request("/api/ai/grade", { method: "POST", body })).status,
    429,
  );
  await clearLimits();
});

test("molecule lookup rejects notation-only inputs before calling the provider", async () => {
  await clearLimits();
  const calls = aiCalls;
  for (const moleculeInput of [
    "smiles",
    "SMILES:",
    "smiles:CCO",
    "",
    "x".repeat(1001),
  ]) {
    const result = await request("/api/ai/generate", {
      method: "POST",
      body: { kind: "molecule", prompt: "synthetic", moleculeInput },
    });
    assert.equal(result.status, 400, moleculeInput);
  }
  assert.equal(
    (
      await request("/api/ai/generate", {
        method: "POST",
        body: { kind: "quiz", prompt: "synthetic", moleculeInput: "ethanol" },
      })
    ).status,
    400,
  );
  assert.equal(aiCalls, calls);
  await clearLimits();
});

test("grading prompt requires the exact subpart while expanded references still fail closed", async () => {
  const reference = "1(a)(i)";
  const raw = {
    status: "graded",
    reference,
    maximum: 1,
    confidence: "high",
    schemePages: [7],
    points: [
      { id: "p1", available: 1, awarded: 1, reason: "Correct particle count." },
    ],
    feedback: "Correct.",
  };
  const result = await assessPaper(
    {},
    PAST_PAPERS.find((p) => p.id === "9701_s26_qp_22"),
    reference,
    "4 electrons",
    {
      fetchPdf: async () => Buffer.from("%PDF-synthetic"),
      generate: async (_config, input) => {
        const sent = JSON.parse(
          input.messages[0].content.find((c) => c.type === "text").text,
        );
        assert.equal(sent.requestedSubpart, reference);
        assert.match(sent.outputReferenceRule, /Copy requestedSubpart exactly/);
        return raw;
      },
    },
  );
  assert.equal(result.score, 1);
  const mismatched = validateGrade(
    { ...raw, reference: "9701/22/M/J/26 Q1(a)(i)" },
    reference,
  );
  assert.equal(mismatched.status, "needs-review");
  assert.equal(mismatched.score, null);
});

test("CORS/CSRF, unsafe redirects, malformed JSON and forged proxy header protections", async () => {
  assert.equal(
    (
      await request("/api/auth/sign-in/email", {
        method: "POST",
        origin: "https://evil.example",
        body: { email: address, password },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/api/auth/sign-out", {
        method: "POST",
        origin: "",
        body: {},
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/api/auth/sign-in/email", {
        method: "POST",
        body: { email: address, password, callbackURL: "https://evil.example" },
      })
    ).status,
    403,
  );
  const raw = await fetch(base + "/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      Origin: config.FRONTEND_ORIGIN,
      "Content-Type": "application/json",
    },
    body: "{bad",
  });
  assert.equal(raw.status, 400);
  const ip = (
    await admin.query(
      'SELECT "ipAddress" FROM cc_auth.session WHERE "userId"=$1 LIMIT 1',
      [userId],
    )
  ).rows[0].ipAddress;
  assert.equal(ip, "127.0.0.1");
});
test("distributed atomic rate limit cannot be bypassed by concurrent calls", async () => {
  const consume = createLimiter(pool, config.BETTER_AUTH_SECRET);
  const results = await Promise.all(
    Array.from({ length: 20 }, () =>
      consume("parallel-case", { window: 60, max: 5 }),
    ),
  );
  assert.equal(results.filter((r) => r.allowed).length, 5);
  assert.ok(results.filter((r) => !r.allowed).every((r) => r.retryAfter > 0));
});
test("HTTP login brute-force limiter blocks attempts and ignores supplied proxy addresses", async () => {
  await clearLimits();
  let last;
  for (let i = 0; i < 7; i++)
    last = await request("/api/auth/sign-in/email", {
      method: "POST",
      cookie: "",
      body: { email: address, password: "Wrong passphrase 48721" },
      extra: { "X-Forwarded-For": `192.0.2.${i + 1}` },
    });
  assert.equal(last.status, 429);
  assert.ok(last.headers.get("Retry-After"));
});
test("logout revokes database session and replayed cookie is unauthorized", async () => {
  await clearLimits();
  const old = cookie;
  assert.equal(
    (await request("/api/auth/sign-out", { method: "POST", body: {} })).status,
    200,
  );
  assert.equal((await request("/api/me", { cookie: old })).status, 401);
});
test("database session expiry is enforced even with a previously valid cookie", async () => {
  cookie = (await signIn()).cookie;
  await admin.query(
    'UPDATE cc_auth.session SET "expiresAt"=now()-interval \'1 second\' WHERE "userId"=$1',
    [userId],
  );
  assert.equal((await request("/api/me")).status, 401);
});
test("reset request resists enumeration; reset changes password, revokes sessions and blocks token replay", async () => {
  await clearLimits();
  cookie = (await signIn()).cookie;
  const reset = await request("/api/auth/request-password-reset", {
    method: "POST",
    cookie: "",
    body: {
      email: address,
      redirectTo: config.FRONTEND_ORIGIN + "/reset-password",
    },
  });
  const absent = await request("/api/auth/request-password-reset", {
    method: "POST",
    cookie: "",
    body: {
      email: "absent@example.test",
      redirectTo: config.FRONTEND_ORIGIN + "/reset-password",
    },
  });
  assert.equal(reset.status, 200);
  assert.deepEqual(reset.data, absent.data);
  const resetUrl = new URL(await queuedUrl("Reset"));
  const token = resetUrl.pathname.split("/").at(-1);
  const changed = "A completely new test passphrase 5837";
  const result = await request("/api/auth/reset-password", {
    method: "POST",
    cookie: "",
    body: { token, newPassword: changed },
  });
  assert.equal(result.status, 200);
  assert.equal((await request("/api/me")).status, 401);
  assert.equal((await signIn()).status, 401);
  assert.equal((await signIn(address, changed)).status, 200);
  assert.notEqual(
    (
      await request("/api/auth/reset-password", {
        method: "POST",
        cookie: "",
        body: { token, newPassword: password },
      })
    ).status,
    200,
  );
});
test("mail worker exercises encrypted queue delivery without sending real email", async () => {
  const sent = [];
  while (
    await deliverOne(pool, config, {
      sendMail: async (message) => sent.push(message),
    })
  ) {}
  assert.ok(sent.length >= 2);
  assert.ok(sent.every((m) => m.text.includes("http")));
  assert.equal(
    (
      await admin.query(
        "SELECT count(*) FROM cc_auth.mail_outbox WHERE sent_at IS NOT NULL AND payload IS NOT NULL",
      )
    ).rows[0].count,
    "0",
  );
});
test("content and source provenance stays explicit through 2026", () => {
  for (const [id, c] of Object.entries(COURSES))
    for (const m of c.modules) {
      const guide = getStudyGuide(m, id);
      assert.ok(guide.resources.length);
      assert.ok(guide.flashcards.length >= 8);
      assert.ok(guide.flashcards.every((c) => c.id));
      const bank = getQuestionBank(id, m.id);
      assert.ok(
        bank.every(
          (q) =>
            q.options.includes(q.correctAnswer) &&
            new Set(q.options).size === 4,
        ),
      );
    }
  assert.deepEqual(Object.keys(COURSES), ["ALEVEL", "IB"]);
});
test("frontend CSS and layout are not required for backend execution", async () => {
  const source = await readFile(
    new URL("../src/app.js", import.meta.url),
    "utf8",
  );
  assert.ok(!source.includes(".tsx"));
  assert.ok(!source.includes("VITE_"));
});
test("distributed guest budgets are atomic, expire, and never charge a denied bucket", async () => {
  const key = "a".repeat(64),
    global = "b".repeat(64);
  const rules = [
    { key, window_seconds: 300, maximum: 3 },
    { key: global, window_seconds: 300, maximum: 100 },
  ];
  const charge = () =>
    pool.query("SELECT public.consume_guest_ai_budgets($1::jsonb) AS result", [
      JSON.stringify(rules),
    ]);
  const results = await Promise.all(Array.from({ length: 12 }, charge));
  assert.equal(results.filter((r) => r.rows[0].result.allowed).length, 3);
  assert.equal(
    (
      await admin.query(
        "SELECT count FROM cc_guest.request_limits WHERE key=$1",
        [global],
      )
    ).rows[0].count,
    3,
  );
  await admin.query(
    "UPDATE cc_guest.request_limits SET expires_at=now()-interval '1 second' WHERE key=$1",
    [key],
  );
  assert.equal((await charge()).rows[0].result.allowed, true);
  assert.equal(
    (
      await admin.query(
        "SELECT count FROM cc_guest.request_limits WHERE key=$1",
        [key],
      )
    ).rows[0].count,
    1,
  );
  const access = await admin.query(
    "SELECT has_function_privilege('public','public.consume_guest_ai_budgets(jsonb)','execute') AS allowed",
  );
  assert.equal(access.rows[0].allowed, false);
  await assert.rejects(() =>
    pool.query("SELECT public.consume_guest_ai_budgets('[]'::jsonb)"),
  );
});
