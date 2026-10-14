import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { PastPaper } from "../content/pastPapers";
interface Assessment {
  id: string;
  status: "graded" | "needs-review";
  score: number | null;
  maximum: number | null;
  feedback: string;
  confidence: string;
  schemePages: number[];
  points: { id: string; available: number; awarded: number; reason: string }[];
}
export default function FreeResponseGrading({
  paper,
  reference,
  answer,
  onAnswer,
  ink,
}: {
  paper: PastPaper;
  reference: string;
  answer: string;
  onAnswer: (value: string) => void;
  ink: { image: string; page: number } | null;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [transcription, setTranscription] = useState("");
  const [uncertain, setUncertain] = useState<string[]>([]);
  const [result, setResult] = useState<Assessment | null>(null);
  const current = useRef(0);
  const gradedAnswer = useRef("");
  const storageKey = `cc-ai-feedback-v1:${paper.id}:${reference}`;
  useEffect(() => {
    current.current++;
    setConfirmed(false);
    setBusy("");
    setError("");
    setResult(null);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (
        saved?.answer === answer &&
        saved?.scheme === paper.markschemeSha256 &&
        Array.isArray(saved?.result?.points)
      ) {
        gradedAnswer.current = answer;
        setResult(saved.result);
      }
    } catch {
      /* Private browsing/storage limits do not prevent practice. */
    }
  }, [answer, storageKey, paper.markschemeSha256]);
  useEffect(
    () => () => {
      current.current++;
    },
    [],
  );
  const validRef = /^\d{1,2}(?:\([a-z0-9]{1,4}\))+$/.test(reference);
  return (
    <section className="ai-marking" aria-label="AI markscheme feedback">
      <h3>Markscheme feedback</h3>
      <p className="fine-print">
        AI feedback is advisory, not an official grade. It uses this paper's
        checked question PDF and matching markscheme. Guest testing has a
        limited AI allowance. Your answer and feedback are saved on this device.
      </p>
      {ink && (
        <div className="transcription-review">
          <h4>Handwriting from PDF page {ink.page}</h4>
          <p className="fine-print">
            Only the ink image is sent, not the locally loaded PDF. If the page
            has several answers, keep only this subpart in the confirmed answer
            below.
          </p>
          <button
            className="button secondary"
            disabled={!!busy}
            onClick={async () => {
              const request = ++current.current;
              setBusy("Reading handwriting…");
              setError("");
              try {
                const output = await api<{
                  transcription: string;
                  uncertainSpans: string[];
                  readable: boolean;
                }>("/api/ai/transcribe", { image: ink.image });
                if (request !== current.current) return;
                setTranscription(output.transcription);
                setUncertain(output.uncertainSpans);
                if (!output.readable)
                  setError(
                    "The model could not read this answer reliably. Type or correct it manually; no grade was issued.",
                  );
              } catch (e) {
                if (request === current.current)
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Handwriting could not be read.",
                  );
              } finally {
                if (request === current.current) setBusy("");
              }
            }}
          >
            Send ink for transcription
          </button>
          {transcription && (
            <>
              <label>
                Check and edit the recognised text
                <textarea
                  aria-label="Recognised handwriting"
                  rows={6}
                  maxLength={10000}
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                />
              </label>
              {uncertain.length > 0 && (
                <p role="status">
                  Check unclear symbols: {uncertain.join("; ")}
                </p>
              )}
              <button
                className="button secondary"
                disabled={!!busy || !transcription.trim()}
                onClick={() => {
                  onAnswer(transcription);
                  setTranscription("");
                  setUncertain([]);
                }}
              >
                Use corrected text as my answer
              </button>
            </>
          )}
        </div>
      )}
      <label className="confirmation-check">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />{" "}
        I have checked this subpart's answer, including equations, charges,
        units and working.
      </label>
      <button
        className="button"
        disabled={
          !!busy ||
          !confirmed ||
          !answer.trim() ||
          !validRef ||
          !paper.markschemeSha256
        }
        onClick={async () => {
          const request = ++current.current;
          gradedAnswer.current = answer;
          setBusy("Checking the matching markscheme…");
          setError("");
          try {
            const output = await api<Assessment>("/api/ai/grade", {
              paperId: paper.id,
              reference,
              answer,
              confirmed: true,
            });
            if (request === current.current) {
              setResult(output);
              try {
                localStorage.setItem(
                  storageKey,
                  JSON.stringify({
                    answer,
                    scheme: paper.markschemeSha256,
                    result: output,
                  }),
                );
              } catch {
                setError(
                  "Feedback is shown, but browser storage is full or unavailable. Copy it before leaving.",
                );
              }
            }
          } catch (e) {
            if (request === current.current)
              setError(
                e instanceof Error
                  ? e.message
                  : "Grading could not be completed. Your answer is unchanged.",
              );
          } finally {
            if (request === current.current) setBusy("");
          }
        }}
      >
        Request AI feedback for {reference}
      </button>
      {!validRef && (
        <p className="fine-print">
          Choose a specific subpart such as 1(a) or 1(a)(i), not a whole
          question.
        </p>
      )}
      {busy && <p role="status">{busy}</p>}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {result && gradedAnswer.current === answer && (
        <div className="marking-result" role="status">
          <h4>
            {result.status === "graded"
              ? `Advisory mark: ${result.score} / ${result.maximum}`
              : "Needs review — no score issued"}
          </h4>
          <p>{result.feedback}</p>
          <ul>
            {result.points.map((p) => (
              <li key={p.id}>
                {p.awarded}/{p.available} · {p.reason}
              </li>
            ))}
          </ul>
          <p className="fine-print">
            Model-assessed confidence: {result.confidence}. Markscheme PDF
            pages: {result.schemePages.join(", ") || "not established"}. This
            assessment is stored on this device; compare it with the scheme and
            seek teacher review when unsure.
          </p>
        </div>
      )}
    </section>
  );
}
