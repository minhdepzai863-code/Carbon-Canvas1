import { z } from "zod";
import { PAST_PAPERS } from "../../content/pastPapers.ts";
import { fetchCheckedPdf } from "./ai.js";

// Individual source downloads, never arbitrary URLs or a public PDF mirror.
// Hash verification also protects the PDF.js renderer from changed source files.
export function installDocumentRoutes(app, quota, load = fetchCheckedPdf) {
  const cache = new Map();
  app.get(
    "/api/papers/:id/document",
    (req, res, next) => {
      if(req.headers["sec-fetch-site"] === "cross-site")return res.status(403).json({error:"Open documents from the same-origin practice workspace"});
      const { kind, download } = z
        .object({
          kind: z.enum(["question", "markscheme"]),
          download: z.literal("1").optional(),
        })
        .strict()
        .parse(req.query);
      const paper = PAST_PAPERS.find((p) => p.id === req.params.id);
      if (!paper)
        return res.status(404).json({ error: "Choose a supported past paper" });
      const scheme = kind === "markscheme";
      const sha = scheme ? paper.markschemeSha256 : paper.sha256;
      if (!sha)
        return res
          .status(409)
          .json({ error: "No checked source is available for this document" });
      res.locals.document = {
        url: scheme ? paper.markschemeUrl : paper.paperUrl,
        sha,
        filename: scheme
          ? paper.filename.replace("_qp_", "_ms_")
          : paper.filename,
        download,
      };
      next();
    },
    quota,
    async (_req, res) => {
      const doc = res.locals.document;
      let bytes = cache.get(doc.sha);
      if (!bytes) {
        bytes = await load(doc.url, doc.sha);
        if (cache.size >= 3) cache.delete(cache.keys().next().value);
        cache.set(doc.sha, bytes);
      }
      res
        .set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `${doc.download ? "attachment" : "inline"}; filename="${doc.filename}"`,
          "Cache-Control": "private, max-age=3600",
          "X-Content-SHA256": doc.sha,
        })
        .send(bytes);
    },
  );
}
