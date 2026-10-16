import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, SignJWT } from "jose";
import { verifyCaller } from "../../supabase/functions/guest-ai-limiter/verify.js";
import {
  loadGuestConfig,
  createGuestApp,
  deviceCookie,
  guestRules,
} from "../src/guest.js";
const config = loadGuestConfig({
  NODE_ENV: "test",
  GEMINI_API_KEY: "synthetic-test-key-not-a-real-secret",
  CC_DEV_MEMORY_QUOTA: "true",
});
test("guest cookies are authenticated and expire; production cannot use memory quotas", () => {
  const hosted = loadGuestConfig({
    ...config,
    NODE_ENV: "production",
    CC_DEV_MEMORY_QUOTA: "false",
    GUEST_LIMITER_URL:
      "https://nxgbmuaycudgyrxzbuks.supabase.co/functions/v1/guest-ai-limiter",
    VERCEL_BRANCH_URL:
      "carbon-canvas1-git-codex-re-ee7ba0-minhdepzai863-codes-projects.vercel.app",
  });
  assert.ok(
    hosted.origins.includes(
      "https://carbon-canvas1-git-codex-re-ee7ba0-minhdepzai863-codes-projects.vercel.app",
    ),
  );
  const now = Date.now();
  const c = deviceCookie(config, null, now);
  assert.equal(deviceCookie(config, c.value, now).id, c.id);
  assert.equal(
    deviceCookie(config, c.value.slice(0, -1) + "z", now).fresh,
    true,
  );
  assert.equal(deviceCookie(config, c.value, now + 2592001000).fresh, true);
  assert.throws(() => loadGuestConfig({ ...config, NODE_ENV: "production" }));
  const r = guestRules(config, c.id, "127.0.0.1");
  assert.equal(r.length, 5);
  assert.ok(r.every((x) => /^[a-f0-9]{64}$/.test(x.key)));
  assert.equal(
    guestRules(
      { ...config, GEMINI_API_KEY: "another-synthetic-key" },
      c.id,
      "127.0.0.1",
    )[4].key,
    r[4].key,
  );
});
test("only verified Vercel project workloads can consume distributed budgets", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const payload = {
    owner_id: "team_xvwNs4n8v9KoZ82RwTHeS4lu",
    project_id: "prj_JDxayPsEudjSrKtQkJyQ0nAkLpJJ",
    environment: "preview",
  };
  const sign = (p = {}, o = {}) =>
    new SignJWT({ ...payload, ...p })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer(o.iss || "https://oidc.vercel.com")
      .setAudience(o.aud || "https://vercel.com/minhdepzai863-codes-projects")
      .setSubject(
        o.sub ||
          "owner:minhdepzai863-codes-projects:project:carbon-canvas1:environment:preview",
      )
      .setIssuedAt()
      .setExpirationTime(o.exp || "1h")
      .sign(privateKey);
  assert.equal(
    (await verifyCaller(await sign(), publicKey)).project_id,
    payload.project_id,
  );
  for (const [p, o] of [
    [{ project_id: "other" }, {}],
    [{ owner_id: "other" }, {}],
    [{ environment: "development" }, {}],
    [{}, { iss: "https://attacker.test" }],
    [{}, { aud: "other" }],
    [{}, { sub: "other" }],
    [{}, { exp: Math.floor(Date.now() / 1000) - 60 }],
  ])
    await assert.rejects(() =>
      sign(p, o).then((t) => verifyCaller(t, publicKey)),
    );
  await assert.rejects(() => verifyCaller("invalid", publicKey));
});
test("guest HTTP protects origin, private routes and device/IP quotas without login", async () => {
  let calls = 0;
  const { app } = createGuestApp(config, {
    generate: async () => {
      calls++;
      return "Synthetic tutor response";
    },
  });
  const s = app.listen(0, "127.0.0.1");
  await new Promise((r) => s.once("listening", r));
  const base = `http://127.0.0.1:${s.address().port}`;
  const post = (cookie = "", origin = "http://127.0.0.1:5173", extra = {}) =>
    fetch(base + "/api/ai/tutor", {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        Cookie: cookie,
        ...extra,
      },
      body: JSON.stringify({ history: [], message: "Explain bonding" }),
    });
  try {
    assert.equal((await fetch(base + "/api/me")).status, 404);
    assert.equal((await post("", "https://attacker.test")).status, 403);
    const first = await post();
    assert.equal(first.status, 200);
    const cookie = first.headers.getSetCookie()[0].split(";")[0];
    assert.match(cookie, /cc-guest=/);
    assert.match(first.headers.getSetCookie()[0], /HttpOnly/);
    for (let i = 0; i < 5; i++) assert.equal((await post(cookie)).status, 200);
    assert.equal((await post(cookie)).status, 429);
    // Clearing the signed cookie does not reset the IP allowance, even with forged proxy headers locally.
    for (let i = 0; i < 6; i++)
      assert.equal(
        (
          await post("", undefined, {
            "x-vercel-forwarded-for": `192.0.2.${i + 1}`,
          })
        ).status,
        200,
      );
    const denied = await post();
    assert.equal(denied.status, 429);
    assert.ok(Number(denied.headers.get("Retry-After")) > 0);
    assert.equal(calls, 12);
  } finally {
    await new Promise((r) => s.close(r));
  }
});
