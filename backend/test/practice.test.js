import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { acceptsInkPointer } from "../../services/inkInput.ts";
import { createGuestApp, loadGuestConfig, guestRules } from "../src/guest.js";

test("Pencil takes precedence over a palm, even when Safari marks it non-primary", () => {
  const pen = { pointerId: 2, pointerType: "pen", isPrimary: false, button: 0 };
  const touch = {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
  };
  assert.equal(
    acceptsInkPointer("pen", pen, { id: 1, type: "touch" }, 0, 1000),
    true,
  );
  assert.equal(
    acceptsInkPointer("pen", touch, { id: 2, type: "pen" }, 1000, 1010),
    false,
  );
  assert.equal(acceptsInkPointer("pen", touch, null, 1000, 1100), false);
  assert.equal(acceptsInkPointer("pen", touch, null, 1000, 1900), true);
  assert.equal(acceptsInkPointer("pan", pen, null, 0, 1000), false);
  assert.equal(
    acceptsInkPointer("pen", { ...touch, isPrimary: false }, null, 0, 1000),
    false,
  );
  assert.equal(
    acceptsInkPointer(
      "pen",
      { ...touch, pointerType: "mouse", button: 2 },
      null,
      0,
      1000,
    ),
    false,
  );
  assert.equal(acceptsInkPointer("erase", pen, null, 0, 1000), true);
});
test("HTML drawing surface prevents touch scrolling before gesture start and uses matched Safari PDF bundles", async () => {
  const source = await readFile(
    new URL("../../components/LocalPaperReader.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /useState<InkTool>\("pen"\)/);
  assert.match(source, /touchAction: tool === "pan" \? "auto" : "none"/);
  assert.match(source, /touchstart.*preventScroll.*passive: false/s);
  assert.match(source, /touchmove.*preventScroll.*passive: false/s);
  assert.match(source, /legacy\/build\/pdf.worker.min.mjs/);
  assert.match(source, /import\("pdfjs-dist\/legacy\/build\/pdf.mjs"\)/);
});
test("checked document endpoint rejects arbitrary sources and downloads matching QP/MS without AI", async () => {
  const config = loadGuestConfig({
    NODE_ENV: "test",
    CC_DEV_MEMORY_QUOTA: "true",
    GEMINI_API_KEY: "synthetic-test-key-not-secret",
    GEMINI_MODEL: "gemini-3.6-flash",
  });
  let loads = 0;
  const sources = [];
  const { app } = createGuestApp(config, {
    fetchPdf: async (url, sha) => {
      loads++;
      sources.push({ url, sha });
      return Buffer.from("%PDF-synthetic fixture");
    },
    generate: () => assert.fail("Paper download must not call the model"),
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}/api/papers/`;
  try {
    assert.equal((await fetch(base+"9701_s26_qp_21/document?kind=question",{headers:{"Sec-Fetch-Site":"cross-site"}})).status,403);
    assert.equal(
      (await fetch(base + "bad/document?kind=question")).status,
      404,
    );
    assert.equal(
      (
        await fetch(
          base +
            "9701_s26_qp_21/document?kind=question&url=https://attacker.test",
        )
      ).status,
      400,
    );
    assert.equal(
      (await fetch(base + "9701_s26_qp_21/document?kind=invalid")).status,
      400,
    );
    const qp = await fetch(
      base + "9701_s26_qp_21/document?kind=question&download=1",
    );
    assert.equal(qp.status, 200);
    assert.match(
      qp.headers.get("Content-Disposition"),
      /attachment; filename="9701_s26_qp_21.pdf"/,
    );
    assert.match(qp.headers.get("Content-Type"), /application\/pdf/);
    assert.match(qp.headers.get("Cache-Control"), /private/);
    const cookie = qp.headers.getSetCookie()[0].split(";")[0];
    const same = await fetch(base + "9701_s26_qp_21/document?kind=question", {
      headers: { Cookie: cookie },
    });
    assert.equal(same.status, 200);
    assert.equal(loads, 1);
    const ms = await fetch(base + "9701_s26_qp_21/document?kind=markscheme", {
      headers: { Cookie: cookie },
    });
    assert.equal(ms.status, 200);
    assert.match(ms.headers.get("Content-Disposition"), /9701_s26_ms_21.pdf/);
    assert.equal(loads, 2);
    assert.ok(
      sources.every(
        (s) =>
          s.url.startsWith("https://pastpapers.papacambridge.com/") &&
          /^[a-f0-9]{64}$/.test(s.sha),
      ),
    );
    assert.notEqual(
      guestRules(config, "device", "ip")[4].key,
      guestRules(config, "device", "ip", "documents")[3].key,
    );
  } finally {
    await new Promise((r) => server.close(r));
  }
});
