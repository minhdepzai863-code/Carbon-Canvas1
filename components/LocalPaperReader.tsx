import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export default function LocalPaperReader({
  filename,
  sha256,
  firstPage = 2,
  onLoaded,
}: {
  filename: string;
  sha256?: string;
  firstPage?: number;
  onLoaded: () => void;
}) {
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(firstPage);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [zoom, setZoom] = useState(100);
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(0);
  useEffect(
    () => () => {
      latest.current++;
    },
    [],
  );
  useEffect(() => {
    if (!bytes) return;
    let cancelled = false;
    let task: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    setLoading(true);
    void import("pdfjs-dist")
      .then(async (lib) => {
        if (cancelled) return;
        lib.GlobalWorkerOptions.workerSrc = workerUrl;
        task = lib.getDocument({
          data: bytes.slice(),
          useSystemFonts: true,
        });
        const doc = await task.promise;
        if (!cancelled) {
          setPdf(doc);
          setPage(Math.min(firstPage, doc.numPages));
          setLoading(false);
          onLoaded();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "This PDF could not be opened. Use the source link or another copy.",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [bytes, firstPage, onLoaded]);
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let cancelled = false;
    let rendering:
      | ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]>
      | undefined;
    const element = canvas.current;
    void pdf
      .getPage(page)
      .then(async (p) => {
        if (cancelled) return;
        const view = p.getViewport({ scale: 1.6 });
        element.width = view.width;
        element.height = view.height;
        const context = element.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");
        rendering = p.render({
          canvas: element,
          canvasContext: context,
          viewport: view,
        });
        await rendering.promise;
        const content = await p.getTextContent();
        if (!cancelled)
          setText(
            content.items.map((i) => ("str" in i ? i.str : "")).join(" "),
          );
      })
      .catch((e) => {
        if (!cancelled && e.name !== "RenderingCancelledException")
          setError("This page could not be rendered. Try the source PDF link.");
      });
    return () => {
      cancelled = true;
      rendering?.cancel();
    };
  }, [pdf, page]);
  return (
    <div className="local-paper-reader">
      <label>
        Open a downloaded PDF locally
        <input
          aria-label="Open downloaded PDF locally"
          type="file"
          accept=".pdf,application/pdf"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const request = ++latest.current;
            setError("");
            if (file.name !== filename) {
              setError(`Choose the matching file: ${filename}`);
              return;
            }
            if (file.size > 20_000_000) {
              setError("Choose a PDF smaller than 20 MB.");
              return;
            }
            try {
              const data = new Uint8Array(await file.arrayBuffer());
              if (String.fromCharCode(...data.slice(0, 5)) !== "%PDF-")
                throw new Error("Invalid PDF");
              if (sha256) {
                const digest = await crypto.subtle.digest("SHA-256", data);
                const actual = [...new Uint8Array(digest)]
                  .map((b) => b.toString(16).padStart(2, "0"))
                  .join("");
                if (actual !== sha256) {
                  if (request === latest.current)
                    setError(
                      "This file differs from the checked archive copy. Use the matching downloaded file or the source link.",
                    );
                  return;
                }
              }
              if (request === latest.current) setBytes(data);
            } catch {
              if (request === latest.current)
                setError("This file could not be read as a PDF.");
            }
          }}
        />
      </label>
      <p className="fine-print">
        Select {filename} from your download. The file is read on your device,
        never uploaded. It must be selected again after a reload; your answers
        remain saved.
      </p>
      {loading && <p role="status">Opening local PDF…</p>}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {pdf && (
        <>
          <div className="study-actions">
            <button
              className="button secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous PDF page
            </button>
            <label>
              PDF page
              <select
                aria-label="PDF page"
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              >
                {Array.from({ length: pdf.numPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button secondary"
              disabled={page === pdf.numPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next PDF page
            </button>
            <span>
              Page {page} of {pdf.numPages}
            </span>
            <label>
              PDF zoom
              <select
                aria-label="PDF zoom"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              >
                {[100, 150, 200, 250, 300].map((z) => (
                  <option key={z} value={z}>
                    {z === 100 ? "Fit width" : z + "%"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="paper-canvas-viewport">
            <canvas
              ref={canvas}
              className="paper-canvas"
              style={{ width: zoom + "%" }}
              role="img"
              aria-label={`${filename}, page ${page}. Question diagrams and equations.`}
            />
          </div>
          <details>
            <summary>Accessible text on this page</summary>
            <p className="paper-extracted-text">
              {text || "Loading page text…"}
            </p>
            <p className="fine-print">
              Extraction can lose equation layout. Check the rendered page for
              diagrams and scientific notation.
            </p>
          </details>
        </>
      )}
    </div>
  );
}
