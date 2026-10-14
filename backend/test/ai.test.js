import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fetchCheckedPdf, validateGrade } from "../src/ai.js";
import { COURSES, getStudyGuide } from "../../content/curriculum.ts";
import { getLessonChapter } from "../../content/lessonChapters.ts";
import { PAST_PAPERS } from "../../content/pastPapers.ts";
import katex from "katex";
import "katex/contrib/mhchem";
const source =
  "https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/9701_s26_ms_21.pdf";
const bytes = Buffer.from("%PDF-1.7\nChecked synthetic test PDF data");
const hash = createHash("sha256").update(bytes).digest("hex");
const grade = {
  status: "graded",
  reference: "1(a)",
  maximum: 2,
  confidence: "high",
  schemePages: [3],
  points: [
    { id: "p1", available: 1, awarded: 1, reason: "Correct principle." },
    { id: "p2", available: 1, awarded: 0, reason: "Unit missing." },
  ],
  feedback: "Check units.",
};
test("advisory grade totals are computed by server and ambiguous output receives no score", () => {
  assert.equal(validateGrade(grade, "1(a)").score, 1);
  for (const invalid of [
    { ...grade, maximum: 3 },
    { ...grade, reference: "1(b)" },
    { ...grade, confidence: "low" },
    { ...grade, schemePages: [] },
    { ...grade, points: [{ ...grade.points[0], awarded: 2 }, grade.points[1]] },
    { ...grade, points: [grade.points[0], grade.points[0]] },
  ]) {
    const result = validateGrade(invalid, "1(a)");
    assert.equal(result.status, "needs-review");
    assert.equal(result.score, null);
    assert.deepEqual(result.points, []);
  }
});
test("document reads require fixed archive host, bounded PDF bytes and matching hash", async () => {
  let calls = 0;
  const fetcher = async (_url, options) => {
    calls++;
    assert.equal(options.redirect, "error");
    return new Response(bytes, {
      headers: { "Content-Type": "application/pdf" },
    });
  };
  assert.deepEqual(await fetchCheckedPdf(source, hash, fetcher), bytes);
  await assert.rejects(
    fetchCheckedPdf("https://attacker.test/x.pdf", hash, fetcher),
    { code: "INVALID_SOURCE" },
  );
  await assert.rejects(fetchCheckedPdf(source, undefined, fetcher), {
    code: "UNCHECKED_SCHEME",
  });
  assert.equal(calls, 1);
  await assert.rejects(fetchCheckedPdf(source, "0".repeat(64), fetcher), {
    code: "SOURCE_CHANGED",
  });
  await assert.rejects(
    fetchCheckedPdf(
      source,
      hash,
      async () => new Response("<html>Error</html>"),
    ),
    { code: "SOURCE_CHANGED" },
  );
  await assert.rejects(
    fetchCheckedPdf(
      source,
      hash,
      async () =>
        new Response(bytes, { headers: { "Content-Length": "15000001" } }),
    ),
    { code: "SOURCE_UNAVAILABLE" },
  );
});
test("all 63 active modules have original lessons and every authored equation typesets", () => {
  let count = 0;
  for (const [course, details] of Object.entries(COURSES))
    for (const module of details.modules) {
      const guide = getStudyGuide(module, course);
      const chapter = getLessonChapter(module, guide);
      count++;
      assert.ok(chapter.opening.length > 100, module.id);
      assert.equal(chapter.example.steps.length, 3);
      assert.ok(guide.flashcards.length >= 8, module.id);
      const strings = [
        chapter.opening,
        chapter.approach,
        chapter.example.problem,
        ...chapter.example.steps,
        chapter.example.answer,
        ...guide.flashcards.flatMap((c) => [c.term, c.definition]),
      ];
      for (const text of strings)
        for (const match of text.matchAll(/\$([^$]+)\$/g))
          assert.doesNotThrow(
            () =>
              katex.renderToString(match[1], {
                throwOnError: true,
                trust: false,
              }),
            `${module.id}: ${match[1]}`,
          );
    }
  assert.equal(count, 63);
  assert.ok(
    PAST_PAPERS.every((p) => /^[a-f0-9]{64}$/.test(p.markschemeSha256)),
  );
});
