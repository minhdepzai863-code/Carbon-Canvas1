import { useCallback, useEffect, useState } from "react";
import LocalPaperReader from "./LocalPaperReader";
import FreeResponseGrading from "./FreeResponseGrading";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import {
  PAST_PAPERS,
  SESSION_NAMES,
  COMPONENT_NAMES,
  paperLabel,
  gradeMcqPaper,
  type PastPaper,
  type PaperFormat,
} from "../content/pastPapers";

interface Attempt {
  answers: Record<string, string>;
  submitted: boolean;
  marks: string;
  maximum: string;
  notes: string;
}
const emptyAttempt = (): Attempt => ({
  answers: {},
  submitted: false,
  marks: "",
  maximum: "",
  notes: "",
});
function readAttempt(p: PastPaper): Attempt {
  try {
    const raw = JSON.parse(
      localStorage.getItem(`cc-paper-v1:${p.id}`) || "null",
    );
    if (!raw || typeof raw !== "object") return emptyAttempt();
    const answers: Record<string, string> = {};
    if (
      raw.answers &&
      typeof raw.answers === "object" &&
      !Array.isArray(raw.answers)
    )
      for (const [key, value] of Object.entries(raw.answers).slice(0, 100))
        if (
          /^\d{1,2}(?:\([a-z0-9]{1,4}\))*$/.test(key) &&
          typeof value === "string"
        )
          answers[key] = value.slice(0, 10000);
    const text = (v: unknown, size: number) =>
      typeof v === "string" ? v.slice(0, size) : "";
    return {
      answers,
      submitted: raw.submitted === true,
      marks: text(raw.marks, 6),
      maximum: text(raw.maximum, 6),
      notes: text(raw.notes, 5000),
    };
  } catch {
    return emptyAttempt();
  }
}

function PaperAttempt({ paper }: { paper: PastPaper }) {
  const [attempt, setAttempt] = useState(() => readAttempt(paper));
  const [question, setQuestion] = useState(1);
  const [reference, setReference] = useState("1");
  const [showScheme, setShowScheme] = useState(false);
  const [localLoaded, setLocalLoaded] = useState(false);
  const localReady = useCallback(() => setLocalLoaded(true), []);
  const [storageError, setStorageError] = useState("");
  const [inkImage, setInkImage] = useState<{
    image: string;
    page: number;
  } | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(`cc-paper-v1:${paper.id}`, JSON.stringify(attempt));
      setStorageError("");
    } catch {
      setStorageError(
        "This browser could not save your answers. Keep a copy before leaving this page.",
      );
    }
  }, [attempt, paper.id]);
  const answerRef = paper.format === "mcq" ? String(question) : reference;
  const validRef = /^\d{1,2}(?:\([a-z0-9]{1,4}\))*$/.test(answerRef);
  const changeAnswer = (value: string) => {
    if (!validRef) return;
    if (
      value &&
      !(answerRef in attempt.answers) &&
      Object.keys(attempt.answers).length >= 100
    ) {
      setStorageError(
        "This paper already has 100 saved subparts. Combine related working or clear an unused answer before adding another.",
      );
      return;
    }
    setAttempt((a) => {
      const answers = { ...a.answers };
      if (value) answers[answerRef] = value;
      else delete answers[answerRef];
      return { ...a, submitted: false, answers };
    });
  };
  const graded =
    paper.format === "mcq" && paper.answerKey && attempt.submitted
      ? gradeMcqPaper(paper, attempt.answers)
      : null;
  const currentFeedback = graded?.feedback[question - 1];
  const marks = Number(attempt.marks);
  const maximum = Number(attempt.maximum || paper.maximumMark || "");
  const validMarks =
    attempt.marks !== "" &&
    Number.isFinite(marks) &&
    Number.isFinite(maximum) &&
    maximum > 0 &&
    maximum <= 200 &&
    marks >= 0 &&
    marks <= maximum;
  const pdfUrl = showScheme ? paper.markschemeUrl : paper.paperUrl;
  return (
    <section className="quiz-panel paper-panel">
      <div className="section-heading">
        <h2>{paperLabel(paper)}</h2>
        <span className="tag">{COMPONENT_NAMES[paper.component[0]]}</span>
      </div>
      <p className="fine-print">
        Original paper, not AI-generated. Diagrams and question numbering stay
        in their original PDF layout.
      </p>
      <div className="study-actions">
        <a
          className="button secondary"
          href={`/api/papers/${paper.id}/document?kind=question&download=1`}
          download={paper.filename}
        >
          Download question PDF <ExternalLink size={14} />
        </a>
        {paper.markschemeUrl && (
          <a
            className="button secondary"
            href={`/api/papers/${paper.id}/document?kind=markscheme&download=1`}
            download={paper.filename.replace("_qp_", "_ms_")}
          >
            Download markscheme PDF <ExternalLink size={14} />
          </a>
        )}
        <a href={paper.paperUrl} target="_blank" rel="noreferrer">
          Open question paper <ExternalLink size={14} />
        </a>
        {paper.markschemeUrl && (
          <a href={paper.markschemeUrl} target="_blank" rel="noreferrer">
            Open markscheme <ExternalLink size={14} />
          </a>
        )}
        {paper.markschemeUrl && (
          <button
            className="button secondary"
            onClick={() => {
              setLocalLoaded(false);
              setShowScheme((v) => !v);
            }}
          >
            {showScheme ? "Show question paper" : "Show markscheme"}
          </button>
        )}
      </div>
      <p className="fine-print">
        The checked PDF opens below and is retained on this device. If the
        source is unavailable, use the original links or select a downloaded
        copy.
      </p>
      <LocalPaperReader
        key={pdfUrl}
        filename={
          showScheme ? paper.filename.replace("_qp_", "_ms_") : paper.filename
        }
        sha256={showScheme ? paper.markschemeSha256 : paper.sha256}
        documentUrl={`/api/papers/${paper.id}/document?kind=${showScheme ? "markscheme" : "question"}`}
        firstPage={showScheme ? 1 : 2}
        onLoaded={localReady}
        onInk={
          !showScheme && paper.format === "frq"
            ? (image, page) => setInkImage({ image, page })
            : undefined
        }
      />
      {!localLoaded && (
        <details className="source-preview">
          <summary>Preview the source-hosted PDF</summary>
          <p className="fine-print">
            Some browsers cannot embed this host. Load the downloaded PDF above
            for reliable reading and annotation.
          </p>
          <iframe
            key={pdfUrl}
            className="paper-document"
            src={`${pdfUrl}#page=${showScheme ? 1 : 2}&view=FitH`}
            title={`${showScheme ? "Markscheme" : "Question paper"}: ${paperLabel(paper)}`}
            referrerPolicy="no-referrer"
          />
        </details>
      )}
      {storageError && (
        <p role="alert" className="notice error">
          {storageError}
        </p>
      )}
      <div className="paper-answer-area">
        {paper.format === "mcq" ? (
          <>
            <div className="question-position">
              <label>
                Question number
                <select
                  aria-label="Question number"
                  value={question}
                  onChange={(e) => setQuestion(Number(e.target.value))}
                >
                  {Array.from({ length: 40 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                      {attempt.answers[String(i + 1)] ? " — answered" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <span>
                {
                  Object.values(attempt.answers).filter((v) =>
                    /^[ABCD]$/.test(v),
                  ).length
                }{" "}
                / 40 answered
              </span>
            </div>
            <h3>Answer to question {question}</h3>
            <p className="fine-print">
              Read question {question} in the paper above, then record its
              option here.
            </p>
            <div
              className="quiz-options paper-options"
              role="group"
              aria-label={`Answer to question ${question}`}
            >
              {["A", "B", "C", "D"].map((letter) => (
                <button
                  key={letter}
                  aria-pressed={attempt.answers[answerRef] === letter}
                  className={`quiz-option${attempt.answers[answerRef] === letter ? " selected" : ""}${currentFeedback?.correctAnswer === letter ? " correct" : ""}`}
                  onClick={() => changeAnswer(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
            <div className="study-actions">
              <button
                className="button secondary"
                disabled={!attempt.answers[answerRef]}
                onClick={() => changeAnswer("")}
              >
                Clear this answer
              </button>
              <button
                className="button secondary"
                disabled={question === 1}
                onClick={() => setQuestion((q) => q - 1)}
              >
                <ArrowLeft size={16} /> Previous question
              </button>
              <button
                className="button secondary"
                disabled={question === 40}
                onClick={() => setQuestion((q) => q + 1)}
              >
                Next question <ArrowRight size={16} />
              </button>
              <button
                className="button"
                disabled={
                  !paper.answerKey ||
                  !Object.values(attempt.answers).some((v) =>
                    /^[ABCD]$/.test(v),
                  )
                }
                onClick={() => setAttempt((a) => ({ ...a, submitted: true }))}
              >
                Grade multiple choice
              </button>
            </div>
            {graded && (
              <div className="answer-explanation" role="status">
                <h3>
                  {graded.score} / 40 ({graded.percentage}%)
                </h3>
                <p>
                  {graded.answered} answered; unanswered questions score zero.
                  Markscheme answer-key grading, not AI grading or an official
                  examination result.
                </p>
                <p>
                  Question {question}:{" "}
                  {currentFeedback?.correct ? "Correct" : "Review"}. Answer:{" "}
                  {currentFeedback?.correctAnswer}.
                </p>
                <details>
                  <summary>Review all 40 answers</summary>
                  <ol className="paper-feedback">
                    {graded.feedback.map((f) => (
                      <li key={f.question}>
                        Your answer: {f.answer || "unanswered"}; correct answer:{" "}
                        {f.correctAnswer}. {f.correct ? "Correct" : "Review"}
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            )}
            {!paper.answerKey && (
              <p className="notice">
                No validated answer key is available. Use the linked markscheme
                to self-mark.
              </p>
            )}
          </>
        ) : (
          <>
            <h3>Free-response working</h3>
            <p>
              Save written working by question or subpart. Draw or annotate in
              the PDF above, or type your answer below. Practical papers require
              supervised laboratory work—do not attempt experiments from this
              screen.
            </p>
            <label>
              Question / subpart
              <input
                aria-label="Question or subpart"
                value={reference}
                maxLength={40}
                placeholder="e.g. 1(a)(i)"
                onChange={(e) =>
                  setReference(e.target.value.replace(/ /g, "").toLowerCase())
                }
              />
            </label>
            {!validRef && (
              <p role="alert">Use a reference such as 1, 1(a), or 1(a)(i).</p>
            )}
            <label>
              Your answer
              <textarea
                aria-label="Free-response answer"
                rows={7}
                maxLength={10000}
                disabled={!validRef}
                value={attempt.answers[answerRef] || ""}
                onChange={(e) => changeAnswer(e.target.value)}
                placeholder="Include your reasoning, equations, units and working."
              />
            </label>
            {Object.keys(attempt.answers).length > 0 && (
              <label>
                Saved question answers
                <select
                  aria-label="Saved question answers"
                  value={reference in attempt.answers ? reference : ""}
                  onChange={(e) => setReference(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a saved answer
                  </option>
                  {Object.keys(attempt.answers).map((ref) => (
                    <option key={ref} value={ref}>
                      {ref}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <details className="paper-self-mark">
              <summary>Self-assess using the markscheme</summary>
              <p>
                Compare each part with the matching scheme, including units,
                significant figures, method marks and alternatives. This is a
                self-reported score, independent of advisory AI feedback.
              </p>
              <label>
                Marks awarded for the whole paper
                <input
                  aria-label="Marks awarded"
                  type="number"
                  min={0}
                  max={maximum || undefined}
                  step={0.5}
                  value={attempt.marks}
                  onChange={(e) =>
                    setAttempt((a) => ({
                      ...a,
                      submitted: false,
                      marks: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Maximum paper marks
                <input
                  aria-label="Maximum paper marks"
                  type="number"
                  min={1}
                  max={200}
                  value={attempt.maximum || paper.maximumMark || ""}
                  onChange={(e) =>
                    setAttempt((a) => ({
                      ...a,
                      submitted: false,
                      maximum: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Corrections and feedback
                <textarea
                  aria-label="Corrections and feedback"
                  rows={4}
                  maxLength={5000}
                  value={attempt.notes}
                  onChange={(e) =>
                    setAttempt((a) => ({ ...a, notes: e.target.value }))
                  }
                />
              </label>
              <button
                className="button"
                disabled={!validMarks}
                onClick={() => setAttempt((a) => ({ ...a, submitted: true }))}
              >
                Save self-assessment
              </button>
              {attempt.submitted && validMarks && (
                <p role="status">
                  Self-assessed: {marks} / {maximum} (
                  {Math.round((marks / maximum) * 100)}%). Saved in this
                  browser.
                </p>
              )}
            </details>
            <FreeResponseGrading
              key={reference}
              paper={paper}
              reference={reference}
              answer={attempt.answers[answerRef] || ""}
              onAnswer={changeAnswer}
              ink={inkImage}
            />
          </>
        )}
      </div>
      <p className="fine-print">
        Answers and your latest assessment are saved per paper in this browser,
        not synced to an account. Local scores are editable and are not
        authoritative grades. Checked 14 October 2026.
      </p>
    </section>
  );
}

export default function PastPaperPractice() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [format, setFormat] = useState<PaperFormat>(() => {
    try {
      return (
        PAST_PAPERS.find(
          (p) => p.id === localStorage.getItem("cc-last-paper-v1"),
        )?.format || "mcq"
      );
    } catch {
      return "mcq";
    }
  });
  const [year, setYear] = useState("all");
  const [session, setSession] = useState("all");
  const [component, setComponent] = useState("all");
  const availableSessions = new Set(
    PAST_PAPERS.filter(
      (p) =>
        p.format === format &&
        (year === "all" || p.year === Number(year)) &&
        (component === "all" || p.component[0] === component),
    ).map((p) => p.session),
  );
  useEffect(() => {
    if (session !== "all" && !availableSessions.has(session)) setSession("all");
  }, [format, year, component, session]);
  const [paperId, setPaperId] = useState(() => {
    try {
      return localStorage.getItem("cc-last-paper-v1") || "";
    } catch {
      return "";
    }
  });
  const filtered = PAST_PAPERS.filter(
    (p) =>
      p.format === format &&
      (year === "all" || p.year === Number(year)) &&
      (session === "all" || p.session === session) &&
      (component === "all" || p.component[0] === component),
  );
  const paper = filtered.find((p) => p.id === paperId) || filtered[0];
  useEffect(() => {
    if (paper) {
      try {
        localStorage.setItem("cc-last-paper-v1", paper.id);
      } catch {}
    }
  }, [paper]);
  return (
    <div className="practice-layout">
      <aside className="practice-context paper-context">
        <h2>Cambridge 9701 past papers</h2>
        <p>2018–2026 · {PAST_PAPERS.length} question papers</p>
        <button
          className="button secondary paper-filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="paper-filter-fields"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          {filtersOpen ? "Hide filters" : "Change paper"}
        </button>
        <div
          id="paper-filter-fields"
          className={`paper-filter-fields${filtersOpen ? " is-open" : ""}`}
        >
          <label>
            Question format
            <select
              aria-label="Question format"
              value={format}
              onChange={(e) => {
                setFormat(e.target.value as PaperFormat);
                setComponent("all");
              }}
            >
              <option value="mcq">Multiple choice — Paper 1</option>
              <option value="frq">Free response — Papers 2–5</option>
            </select>
          </label>
          <label>
            Year
            <select
              aria-label="Paper year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="all">All years</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            Exam session
            <select
              aria-label="Exam session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="all">All sessions</option>
              {Object.entries(SESSION_NAMES)
                .filter(([value]) => availableSessions.has(value))
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          {format === "frq" && (
            <label>
              Paper type
              <select
                aria-label="Paper type"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
              >
                <option value="all">All free-response papers</option>
                {["2", "3", "4", "5"].map((c) => (
                  <option key={c} value={c}>
                    Paper {c} — {COMPONENT_NAMES[c]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Paper and variant
            <select
              aria-label="Paper and variant"
              value={paper?.id || ""}
              onChange={(e) => setPaperId(e.target.value)}
              disabled={!filtered.length}
            >
              {!filtered.length && (
                <option value="">No papers in this selection</option>
              )}
              {filtered.map((p) => (
                <option key={p.id} value={p.id}>
                  {paperLabel(p)}
                </option>
              ))}
            </select>
          </label>
          <p className="fine-print">
            {filtered.length} matching papers. No October/November 2026 papers
            were listed. Older papers may assess retired syllabus content. This
            is a third-party archive, not an exam-board-endorsed bank.
          </p>
          <a
            href="https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-chemistry-9701"
            target="_blank"
            rel="noreferrer"
          >
            PapaCambridge source archive
          </a>
        </div>
      </aside>
      {paper ? (
        <PaperAttempt key={paper.id} paper={paper} />
      ) : (
        <section className="quiz-panel empty-state">
          <h2>No papers match these filters</h2>
          <p>
            Try another year or session. Not every session has all variants.
          </p>
        </section>
      )}
    </div>
  );
}
