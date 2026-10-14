import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  cachePaper,
  cachedPaper,
  forgetPaper,
  readInk,
  saveInk,
  type PaperInk,
  type InkStroke,
} from "../services/paperStorage";
import { exportAnnotatedPaper, renderInkImage } from "../services/paperExport";

export default function LocalPaperReader({
  filename,
  sha256,
  firstPage = 2,
  onLoaded,
  onInk,
}: {
  filename: string;
  sha256?: string;
  firstPage?: number;
  onLoaded: () => void;
  onInk?: (image: string, page: number) => void;
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
  const [ink, setInk] = useState<PaperInk>(() => readInk(filename));
  const [tool, setTool] = useState<"pan" | "pen" | "erase">("pan");
  const [draft, setDraft] = useState<InkStroke | null>(null);
  const [redo, setRedo] = useState<InkStroke[]>([]);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState("");
  const active = useRef<{ id: number; stroke: InkStroke } | null>(null);
  const strokes = ink[String(page)] || [];
  useEffect(() => {
    try {
      saveInk(filename, ink);
    } catch {
      setError(
        "Ink could not be saved. Download an annotated copy before leaving.",
      );
    }
  }, [ink, filename]);
  useEffect(() => {
    let cancelled = false;
    const request = ++latest.current;
    void cachedPaper(filename)
      .then(async (data) => {
        if (
          !data ||
          data.length > 20000000 ||
          String.fromCharCode(...data.slice(0, 5)) !== "%PDF-"
        )
          return;
        if (sha256) {
          const digest = await crypto.subtle.digest(
            "SHA-256",
            data.slice().buffer,
          );
          if (
            [...new Uint8Array(digest)]
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("") !== sha256
          )
            return;
        }
        if (!cancelled && request === latest.current) {
          setBytes(data);
          setNotice("PDF restored from this device.");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [filename, sha256]);
  useEffect(() => {
    const cancel = () => {
      active.current = null;
      setDraft(null);
    };
    cancel();
    setRedo([]);
    window.addEventListener("blur", cancel);
    return () => window.removeEventListener("blur", cancel);
  }, [page, tool]);
  const commit = (next: InkStroke[]) => {
    setInk((value) => ({ ...value, [page]: next }));
    setRedo([]);
  };
  const point = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return {
      x: +Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)).toFixed(
        5,
      ),
      y: +Math.max(0, Math.min(1, (e.clientY - box.top) / box.height)).toFixed(
        5,
      ),
    };
  };
  const start = (e: PointerEvent<SVGSVGElement>) => {
    if (
      tool === "pan" ||
      !e.isPrimary ||
      active.current ||
      (e.pointerType === "mouse" && e.button !== 0)
    )
      return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    active.current = {
      id: e.pointerId,
      stroke: { points: [point(e)], color: "#173d42", width: 0.0024 },
    };
    setDraft(active.current.stroke);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (active.current?.id !== e.pointerId) return;
    e.preventDefault();
    if (active.current.stroke.points.length >= 3000) return;
    active.current.stroke.points.push(point(e));
    setDraft({
      ...active.current.stroke,
      points: [...active.current.stroke.points],
    });
  };
  const finish = (e: PointerEvent<SVGSVGElement>) => {
    if (active.current?.id !== e.pointerId) return;
    const stroke = active.current.stroke;
    active.current = null;
    setDraft(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (tool === "erase")
      commit(
        strokes.filter(
          (s) =>
            !s.points.some((p) =>
              stroke.points.some(
                (q) => Math.hypot(p.x - q.x, p.y - q.y) < 0.02,
              ),
            ),
        ),
      );
    else if (
      strokes.length >= 500 ||
      Object.values(ink)
        .flat()
        .reduce((n, s) => n + s.points.length, 0) +
        stroke.points.length >
        100000
    )
      setError(
        "Ink limit reached. Export a copy before clearing some strokes.",
      );
    else commit([...strokes, stroke]);
  };
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
      <details className="paper-file-options" open={!bytes}>
        <summary>
          {bytes
            ? "Local document options"
            : "Open the checked PDF on this device"}
        </summary>
        <label>
          {bytes ? "Replace local PDF" : "Load this paper to read and annotate"}
          <input
            aria-label="Open downloaded PDF locally"
            type="file"
            accept=".pdf,application/pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
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
                if (request === latest.current) {
                  setBytes(data);
                  try {
                    await cachePaper(filename, data);
                    if (request === latest.current)
                      setNotice(
                        "PDF retained on this device. Ink saves automatically.",
                      );
                  } catch {
                    if (request === latest.current)
                      setNotice(
                        "Opened PDF, but this browser could not retain the file. Ink saves separately.",
                      );
                  }
                }
              } catch {
                if (request === latest.current)
                  setError("This file could not be read as a PDF.");
              }
            }}
          />
        </label>
        <p className="fine-print">
          Select {filename} from your download. The original PDF stays on your
          device. Only ink is uploaded if you explicitly request AI
          transcription. Up to 20 recently opened PDFs are retained on this
          device; ink and answers save separately.
        </p>
        {bytes && (
          <button
            className="button secondary"
            onClick={async () => {
              try {
                await forgetPaper(filename);
                setNotice(
                  "Removed the retained PDF; saved ink and answers are unchanged.",
                );
              } catch {
                setError("The retained PDF could not be removed.");
              }
            }}
          >
            Forget retained PDF
          </button>
        )}
      </details>
      {notice && (
        <p className="fine-print" role="status">
          {notice}
        </p>
      )}
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
          <div className="annotation-toolbar" aria-label="Annotation tools">
            <div role="group" aria-label="Annotation mode">
              {(["pan", "pen", "erase"] as const).map((t) => (
                <button
                  key={t}
                  className="button secondary"
                  aria-pressed={tool === t}
                  onClick={() => setTool(t)}
                >
                  {t === "pan" ? "Pan" : t === "pen" ? "Pen" : "Eraser"}
                </button>
              ))}
            </div>
            <button
              className="button secondary"
              disabled={!strokes.length}
              onClick={() => {
                setInk((v) => ({ ...v, [page]: strokes.slice(0, -1) }));
                setRedo((r) => [...r, strokes.at(-1)!]);
              }}
            >
              Undo ink
            </button>
            <button
              className="button secondary"
              disabled={!redo.length}
              onClick={() => {
                setInk((v) => ({ ...v, [page]: [...strokes, redo.at(-1)!] }));
                setRedo((r) => r.slice(0, -1));
              }}
            >
              Redo ink
            </button>
            <button
              className="button secondary"
              disabled={!strokes.length}
              onClick={() => {
                if (
                  window.confirm(
                    "Clear ink on this page? Export a copy first if you need it.",
                  )
                )
                  commit([]);
              }}
            >
              Clear page ink
            </button>
            <button
              className="button secondary"
              disabled={exporting}
              onClick={async () => {
                if (!bytes) return;
                setExporting(true);
                try {
                  await exportAnnotatedPaper(bytes, ink, filename);
                  setNotice(
                    "Downloaded an annotated copy. The original is unchanged.",
                  );
                } catch (e) {
                  console.error(
                    "Annotated PDF export failed",
                    e instanceof Error ? e.message : "Unknown error",
                  );
                  setError(
                    "Export failed. Your saved ink has not been removed.",
                  );
                } finally {
                  setExporting(false);
                }
              }}
            >
              {exporting ? "Exporting…" : "Download annotated PDF"}
            </button>
            {onInk && (
              <button
                className="button"
                disabled={!strokes.length}
                onClick={() =>
                  onInk(
                    renderInkImage(
                      strokes,
                      canvas.current?.width || 1200,
                      canvas.current?.height || 1600,
                    ),
                    page,
                  )
                }
              >
                Recognise this page's handwriting
              </button>
            )}
          </div>
          <p className="fine-print">
            Pan scrolls with a finger; Pen draws with a stylus, mouse or single
            touch. Eraser removes strokes. Use Pan for zooming and scrolling on
            iPad.
          </p>
          <div className="paper-canvas-viewport">
            <div className="annotated-page" style={{ width: zoom + "%" }}>
              <canvas
                ref={canvas}
                className="paper-canvas"
                role="img"
                aria-label={`${filename}, page ${page}. Question diagrams and equations.`}
              />
              <svg
                className={`paper-ink tool-${tool}`}
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                aria-label="Annotation drawing surface"
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={finish}
                onPointerCancel={() => {
                  active.current = null;
                  setDraft(null);
                }}
                onLostPointerCapture={() => {
                  active.current = null;
                  setDraft(null);
                }}
              >
                {[...strokes, ...(draft && tool === "pen" ? [draft] : [])].map(
                  (s, i) =>
                    s.points.length === 1 ? (
                      <circle
                        key={i}
                        cx={s.points[0].x * 1000}
                        cy={s.points[0].y * 1000}
                        r={s.width * 500}
                        fill={s.color}
                      />
                    ) : (
                      <polyline
                        key={i}
                        points={s.points
                          .map((p) => `${p.x * 1000},${p.y * 1000}`)
                          .join(" ")}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={s.width * 1000}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ),
                )}
              </svg>
            </div>
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
