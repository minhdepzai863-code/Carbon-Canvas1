import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Atom,
  BookOpen,
  FlaskConical,
  Combine,
  MessageCircle,
  Archive,
  ArrowRight,
  Menu,
  X,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  Search,
  Bookmark,
  Sun,
  Moon,
  Layers,
  GraduationCap,
  Beaker,
  Plus,
  Library,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import {
  AppView,
  type MoleculeData,
  type ArchiveItem,
  type Module,
  type QuizData,
  type ReactionData,
  type ReactionSimulation,
} from "./types";
import {
  COURSES,
  getStudyGuide,
  REVIEW_DATE,
  type CourseId,
} from "./content/curriculum";
import { getReference } from "./content/molecules";
import { normalizeMolecule } from "./services/chemistry";
import * as gemini from "./services/geminiService";
import MoleculeVisualizer from "./components/MoleculeVisualizer";
import Flashcards from "./components/Flashcards";
import SourceList from "./components/SourceList";
import { SCIENCE_SKILLS } from "./scienceSkills";

const NAV = [
  { view: AppView.DASHBOARD, label: "Workspace", icon: Layers },
  { view: AppView.STUDY_HUB, label: "Study hub", icon: BookOpen },
  { view: AppView.MOLECULE_VIEWER, label: "Molecule lab", icon: Atom },
  {
    view: AppView.REACTION_SIMULATOR,
    label: "Reaction simulator",
    icon: Combine,
  },
  { view: AppView.REACTION_TUTOR, label: "Mechanism tutor", icon: Beaker },
  {
    view: AppView.QUIZ_ARENA,
    label: "Practice questions",
    icon: GraduationCap,
  },
  { view: AppView.CHAT_TUTOR, label: "Ask a tutor", icon: MessageCircle },
  { view: AppView.ARCHIVE, label: "Saved structures", icon: Archive },
];
interface Progress {
  completed: string[];
  scores: Record<string, number>;
  quizzes: number;
  total: number;
}
const blankProgress: Progress = {
  completed: [],
  scores: {},
  quizzes: 0,
  total: 0,
};
function readSaved<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={"button" + (secondary ? " secondary" : "")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Conditions({
  value,
  onChange,
  disabled = false,
}: {
  value: gemini.ReactionConditions;
  onChange: (v: gemini.ReactionConditions) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="conditions" disabled={disabled}>
      <legend>Reaction conditions</legend>
      <label>
        Temperature (°C)
        <input
          type="number"
          value={value.temp}
          required
          min={-273.15}
          step="any"
          onChange={(e) => onChange({ ...value, temp: e.target.valueAsNumber })}
        />
      </label>
      <label>
        Pressure (atm)
        <input
          type="number"
          value={value.pressure}
          required
          min={0.0001}
          step="any"
          onChange={(e) =>
            onChange({ ...value, pressure: e.target.valueAsNumber })
          }
        />
      </label>
      <label>
        Solvent
        <input
          value={value.solvent}
          onChange={(e) => onChange({ ...value, solvent: e.target.value })}
          placeholder="Not specified"
        />
      </label>
      <label>
        Catalyst
        <input
          value={value.catalyst}
          onChange={(e) => onChange({ ...value, catalyst: e.target.value })}
          placeholder="None specified"
        />
      </label>
    </fieldset>
  );
}
function MoleculeFacts({ data }: { data: MoleculeData }) {
  return (
    <aside className="molecule-facts">
      <div className="section-heading">
        <h2>{data.name}</h2>
        <span className="tag">
          {data.provenance === "reference"
            ? "Reference example"
            : data.provenance === "user"
              ? "Your structure"
              : "AI prediction"}
        </span>
      </div>
      <p>{data.description}</p>
      {data.formula && (
        <dl className="facts-row">
          <div>
            <dt>Formula</dt>
            <dd className="formula">{data.formula}</dd>
          </div>
          <div>
            <dt>Heavy atoms</dt>
            <dd>{data.atoms.filter((a) => a.element !== "H").length}</dd>
          </div>
        </dl>
      )}
      <div className="graph-check">
        <Check size={16} />
        <span>Graph passes valence and aromaticity checks</span>
      </div>
      {data.geometry ? (
        <div className="geometry-note">
          <h3>Molecular geometry</h3>
          <strong>{data.geometry.shape}</strong>
          <div className="angle-value">{data.geometry.angle}</div>
          <p>{data.geometry.note}</p>
          <a
            href={data.geometry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Geometry source <ExternalLink size={13} />
          </a>
        </div>
      ) : (
        <p className="fine-print">
          No measured 3D geometry is assigned. A valid molecular graph does not
          establish stability or reaction feasibility.
        </p>
      )}
      {data.sourceUrl && (
        <a
          className="text-link"
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the reference <ExternalLink size={14} />
        </a>
      )}
      <details className="structure-details">
        <summary>Structure notation and charges</summary>
        <code>{data.smiles || "Graph representation"}</code>
        <p>
          {data.atoms
            .filter((a) => a.formalCharge)
            .map(
              (a) =>
                a.element +
                ": " +
                ((a.formalCharge || 0) > 0 ? "+" : "") +
                a.formalCharge,
            )
            .join(", ") || "No nonzero formal charges in this representation."}
        </p>
      </details>
    </aside>
  );
}

export default function App() {
  const [view, setView] = useState(AppView.DASHBOARD);
  const [mobileNav, setMobileNav] = useState(false);
  const [courseId, setCourseId] = useState<CourseId>(() => {
    const saved = readSaved<CourseId>("cc-course-v2", "ALEVEL");
    return COURSES[saved] ? saved : "ALEVEL";
  });
  const course = COURSES[courseId];
  const [selectedId, setSelectedId] = useState(course.modules[0].id);
  const [progress, setProgress] = useState<Progress>(() =>
    readSaved("cc-progress-v2", blankProgress),
  );
  const [archive, setArchive] = useState<ArchiveItem[]>(() =>
    readSaved("cc-archive-v2", []),
  );
  const [dark, setDark] = useState(() => readSaved("cc-night-v2", false));
  const [query, setQuery] = useState("");
  const [studyTab, setStudyTab] = useState<"notes" | "recall" | "sources">(
    "notes",
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [molecule, setMolecule] = useState<MoleculeData | null>(null);
  const [molInput, setMolInput] = useState("Benzene");
  const [molLoading, setMolLoading] = useState(false);
  const [reagent, setReagent] = useState("");
  const [a, setA] = useState("ethanoic acid");
  const [b, setB] = useState("ethanol");
  const [conditions, setConditions] = useState<gemini.ReactionConditions>({
    temp: 78,
    pressure: 1,
    catalyst: "sulfuric acid",
    solvent: "ethanol",
  });
  const [simulation, setSimulation] = useState<ReactionSimulation | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [mechanismQuery, setMechanismQuery] = useState(
    "SN2 reaction of bromomethane with hydroxide",
  );
  const [mechanism, setMechanism] = useState<ReactionData | null>(null);
  const [mechLoading, setMechLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizModule, setQuizModule] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const moleculeRequest = useRef(0);
  const quizRequest = useRef(0);
  const simulationRequest = useRef(0);
  const chatEnd = useRef<HTMLDivElement>(null);
  const selected =
    course.modules.find((m) => m.id === selectedId) || course.modules[0];
  const guide = useMemo(
    () => getStudyGuide(selected, courseId),
    [selected, courseId],
  );
  const completed = course.modules.filter((m) =>
    progress.completed.includes(m.id),
  ).length;
  const nextModule =
    course.modules.find((m) => !progress.completed.includes(m.id)) ||
    course.modules[0];
  const percentage = Math.round((completed / course.modules.length) * 100);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "night" : "day";
    localStorage.setItem("cc-night-v2", JSON.stringify(dark));
  }, [dark]);
  useEffect(() => {
    localStorage.setItem("cc-progress-v2", JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem("cc-archive-v2", JSON.stringify(archive));
  }, [archive]);
  useEffect(() => {
    localStorage.setItem("cc-course-v2", JSON.stringify(courseId));
  }, [courseId]);
  useEffect(() => {
    let active = true;
    normalizeMolecule(getReference("benzene")!)
      .then((value) => {
        if (active) setMolecule(value);
      })
      .catch(() => {
        if (active)
          setError(
            "The molecule engine could not load. Refresh the page to retry.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, view]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const navigate = (target: AppView) => {
    setView(target);
    setMobileNav(false);
    setError("");
  };
  const selectModule = (id: string) => {
    quizRequest.current++;
    setQuizLoading(false);
    setSelectedId(id);
    setQuiz(null);
    setQuizDone(false);
  };
  const chooseCourse = (id: CourseId) => {
    setCourseId(id);
    selectModule(COURSES[id].modules[0].id);
    setStudyTab("notes");
    setQuery("");
    setError("");
  };
  const openModule = (module: Module) => {
    selectModule(module.id);
    setStudyTab("notes");
    navigate(AppView.STUDY_HUB);
  };
  const getError = (e: unknown) =>
    e instanceof Error
      ? e.message
      : "This request could not complete. Check your connection and try again.";
  const loadMolecule = async (input = molInput) => {
    const request = ++moleculeRequest.current;
    setMolLoading(true);
    setError("");
    setMolInput(input);
    try {
      const value = await gemini.generateMoleculeData(input);
      if (request === moleculeRequest.current) setMolecule(value);
    } catch (e) {
      if (request === moleculeRequest.current) setError(getError(e));
    } finally {
      if (request === moleculeRequest.current) setMolLoading(false);
    }
  };
  const save = () => {
    if (!molecule) return;
    if (archive.some((item) => item.data.smiles === molecule.smiles)) {
      setNotice("This structure is already saved.");
      return;
    }
    setArchive((items) => [
      {
        id: crypto.randomUUID(),
        name: molecule.name,
        timestamp: Date.now(),
        data: molecule,
      },
      ...items,
    ]);
    setNotice("Structure saved in this browser.");
  };
  const predict = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !a.trim() ||
      !b.trim() ||
      !Number.isFinite(conditions.temp) ||
      !Number.isFinite(conditions.pressure)
    )
      return;
    const request = ++simulationRequest.current;
    setSimLoading(true);
    setSimulation(null);
    setError("");
    try {
      const result = await gemini.predictReaction(a, b, conditions);
      if (request === simulationRequest.current) setSimulation(result);
    } catch (err) {
      if (request === simulationRequest.current) setError(getError(err));
    } finally {
      if (request === simulationRequest.current) setSimLoading(false);
    }
  };
  const invalidateSimulation = () => {
    simulationRequest.current++;
    setSimulation(null);
    setSimLoading(false);
  };
  const updateConditions = (value: gemini.ReactionConditions) => {
    invalidateSimulation();
    setConditions(value);
  };
  const startQuiz = async () => {
    const request = ++quizRequest.current;
    setQuizLoading(true);
    setQuiz(null);
    setError("");
    setQuizDone(false);
    setAnswer(null);
    setScore(0);
    setQuizIndex(0);
    setQuizModule(selected.id);
    try {
      const result = await gemini.generateQuiz(
        selected.title,
        course.name +
          " " +
          course.version +
          ". " +
          selected.level +
          ". Notes: " +
          JSON.stringify(guide.keyPoints),
      );
      if (
        result.questions.length !== 5 ||
        result.questions.some(
          (q) =>
            q.type !== "mcq" ||
            q.options?.length !== 4 ||
            !q.options.includes(q.correctAnswer),
        )
      )
        throw new Error(
          "The generated question set is inconsistent. Generate a new set.",
        );
      if (request === quizRequest.current) setQuiz(result);
    } catch (err) {
      if (request === quizRequest.current) setError(getError(err));
    } finally {
      if (request === quizRequest.current) setQuizLoading(false);
    }
  };
  const nextQuestion = () => {
    if (!quiz) return;
    if (quizIndex < quiz.questions.length - 1) {
      setQuizIndex((i) => i + 1);
      setAnswer(null);
      return;
    }
    const result = Math.round((score / quiz.questions.length) * 100);
    setQuizDone(true);
    setProgress((p) => ({
      ...p,
      quizzes: p.quizzes + 1,
      total: p.total + result,
      scores: { ...p.scores, [quizModule || selected.id]: result },
    }));
  };
  const sendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatLoading(true);
    setError("");
    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
    setMessages((old) => [...old, { role: "user", text }]);
    try {
      const reply = await gemini.chatWithTutor(
        history,
        "Course: " +
          course.name +
          "; active module: " +
          selected.title +
          "; notes: " +
          JSON.stringify(guide.keyPoints) +
          "\nQuestion: " +
          text,
      );
      setMessages((old) => [...old, { role: "model", text: reply }]);
    } catch (err) {
      setError(getError(err));
    } finally {
      setChatLoading(false);
    }
  };
  const renderModules = (items: Module[]) => (
    <div className="module-list">
      {items.map((module) => (
        <button
          className="module-row"
          key={module.id}
          onClick={() => openModule(module)}
        >
          <span
            className={
              "module-code" +
              (progress.completed.includes(module.id) ? " complete" : "")
            }
          >
            {progress.completed.includes(module.id) ? (
              <Check size={17} />
            ) : (
              module.code
            )}
          </span>
          <span className="module-title">
            <strong>{module.title}</strong>
            <small>
              {module.group} · {module.level}
            </small>
          </span>
          {progress.scores[module.id] !== undefined && (
            <span className="module-score">{progress.scores[module.id]}%</span>
          )}
          <ChevronRight size={16} />
        </button>
      ))}
    </div>
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={"sidebar" + (mobileNav ? " open" : "")}>
        <a
          className="brand"
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            navigate(AppView.DASHBOARD);
          }}
        >
          <span className="brand-mark">
            <Atom size={24} />
          </span>
          <span>
            CarbonCanvas<small>Chemistry workspace</small>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        >
          <X size={21} />
        </button>
        <nav aria-label="Main navigation">
          {NAV.map(({ view: target, label, icon: Icon }) => (
            <button
              className={"nav-item" + (view === target ? " active" : "")}
              key={target}
              aria-current={view === target ? "page" : undefined}
              onClick={() => navigate(target)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="course-caption">
            <BookOpen size={16} />
            <span>
              {course.shortName}
              <small>{course.version}</small>
            </span>
          </div>
          <button className="nav-item" onClick={() => setDark((v) => !v)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{dark ? "Light workspace" : "Night workspace"}</span>
          </button>
          <p>
            Learn the reasoning.
            <br />
            Check the evidence.
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{NAV.find((n) => n.view === view)?.label}</strong>
          </div>
          <label className="course-picker">
            <GraduationCap size={18} />
            <span className="sr-only">Active curriculum</span>
            <select
              aria-label="Active curriculum"
              value={courseId}
              onChange={(e) => chooseCourse(e.target.value as CourseId)}
            >
              <option value="ALEVEL">Cambridge 9701</option>
              <option value="IB">IB Diploma</option>
              <option value="UNDERGRAD">Undergraduate</option>
            </select>
          </label>
        </header>
        <main id="main-content" className="main-content">
          {error && (
            <div className="notice error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="toast" role="status">
              <Check size={17} />
              {notice}
            </div>
          )}
          {view === AppView.DASHBOARD && (
            <>
              <PageHeading
                title="Your chemistry workspace"
                description="Build understanding, one structure and one idea at a time."
              />
              <div className="overview-grid">
                <section className="continue-study">
                  <div className="study-meta">
                    <span className="tag copper">{nextModule.level}</span>
                    <span>
                      {course.shortName} / {nextModule.code}
                    </span>
                  </div>
                  <h2>{nextModule.title}</h2>
                  <p>{nextModule.description}</p>
                  <Button onClick={() => openModule(nextModule)}>
                    Open study notes <ArrowRight size={17} />
                  </Button>
                  <div className="study-progress">
                    <span>
                      {completed} of {course.modules.length} modules reviewed
                    </span>
                    <span>{percentage}%</span>
                    <progress
                      value={completed}
                      max={course.modules.length}
                      aria-label="Modules reviewed"
                    />
                  </div>
                </section>
                <section className="reference-preview">
                  <div className="section-heading">
                    <h3>Structure in focus</h3>
                    <span className="tag">Benzene</span>
                  </div>
                  <MoleculePreview />
                  <div className="preview-caption">
                    <p>One ring, six equivalent bonds.</p>
                    <button
                      className="text-link"
                      onClick={() => {
                        void loadMolecule("benzene");
                        navigate(AppView.MOLECULE_VIEWER);
                      }}
                    >
                      Explore the structure <ArrowRight size={15} />
                    </button>
                  </div>
                </section>
              </div>
              <div className="workspace-lower">
                <section>
                  <div className="section-heading">
                    <div>
                      <h2>Your learning pathway</h2>
                      <p>{course.version}</p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => navigate(AppView.STUDY_HUB)}
                    >
                      Browse all modules <ArrowRight size={15} />
                    </button>
                  </div>
                  {renderModules(course.modules.slice(0, 5))}
                </section>
                <aside className="workspace-notes">
                  <h2>Keep the evidence close</h2>
                  <p>
                    Study notes cite their sources. Molecule drawings preserve
                    charges and bond orders. Predictions stay labelled as
                    predictions.
                  </p>
                  <div className="session-stat">
                    <span>Practice sets completed</span>
                    <strong>{progress.quizzes}</strong>
                  </div>
                  <div className="session-stat">
                    <span>Average practice score</span>
                    <strong>
                      {progress.quizzes
                        ? Math.round(progress.total / progress.quizzes) + "%"
                        : "—"}
                    </strong>
                  </div>
                  <div className="session-stat">
                    <span>Saved structures</span>
                    <strong>{archive.length}</strong>
                  </div>
                  <a
                    className="text-link"
                    href={course.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View the course source <ExternalLink size={14} />
                  </a>
                </aside>
              </div>
            </>
          )}
          {view === AppView.STUDY_HUB && (
            <>
              <PageHeading
                title="Study hub"
                description="Source-linked notes and active recall for your current course."
              />
              <div className="study-layout">
                <aside className="module-browser">
                  <div className="browser-heading">
                    <h2>{course.shortName}</h2>
                    <p>{course.version}</p>
                  </div>
                  <label className="search-field">
                    <Search size={17} />
                    <span className="sr-only">Search modules</span>
                    <input
                      aria-label="Search modules"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Find a module…"
                    />
                  </label>
                  <div className="study-module-list">
                    {course.modules
                      .filter((m) =>
                        (m.title + " " + m.code + " " + m.group)
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((m) => (
                        <button
                          key={m.id}
                          className={
                            "study-module" +
                            (m.id === selected.id ? " selected" : "")
                          }
                          onClick={() => {
                            selectModule(m.id);
                            setStudyTab("notes");
                          }}
                        >
                          <span>{m.code}</span>
                          <span>
                            {m.title}
                            <small>{m.level}</small>
                          </span>
                          {progress.completed.includes(m.id) && (
                            <Check size={14} />
                          )}
                        </button>
                      ))}
                    {!course.modules.some((m) =>
                      (m.title + " " + m.code + " " + m.group)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    ) && (
                      <p className="empty-search">
                        No modules match. Try another term.
                      </p>
                    )}
                  </div>
                </aside>
                <article className="study-article">
                  <div className="study-meta">
                    <span className="tag">{selected.level}</span>
                    <span>
                      {selected.group} / {selected.code}
                    </span>
                  </div>
                  <h2>{selected.title}</h2>
                  <p className="article-summary">{guide.summary}</p>
                  <div
                    className="article-tabs"
                    role="tablist"
                    aria-label="Study material"
                  >
                    {(["notes", "recall", "sources"] as const).map((tab) => (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={studyTab === tab}
                        aria-controls={"study-" + tab}
                        id={"tab-" + tab}
                        onClick={() => setStudyTab(tab)}
                      >
                        {tab === "notes"
                          ? "Study notes"
                          : tab === "recall"
                            ? "Flashcards"
                            : "Sources"}
                        {tab === "recall" && (
                          <span>{guide.flashcards.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div
                    role="tabpanel"
                    id={"study-" + studyTab}
                    aria-labelledby={"tab-" + studyTab}
                  >
                    {studyTab === "notes" && (
                      <>
                        <h3>Core ideas</h3>
                        <div className="lesson-concepts">
                          {guide.flashcards.map((card) => (
                            <section key={card.term}>
                              <h4>{card.term}</h4>
                              <p>{card.definition}</p>
                            </section>
                          ))}
                        </div>
                        <div className="mistake-note">
                          <h3>Watch for this</h3>
                          {guide.commonMistakes.map((point) => (
                            <p key={point}>{point}</p>
                          ))}
                        </div>
                        <div className="study-actions">
                          <Button onClick={() => setStudyTab("recall")}>
                            Practise with flashcards <ArrowRight size={16} />
                          </Button>
                          <Button
                            secondary
                            onClick={() => {
                              setProgress((p) => ({
                                ...p,
                                completed: p.completed.includes(selected.id)
                                  ? p.completed.filter(
                                      (id) => id !== selected.id,
                                    )
                                  : [...p.completed, selected.id],
                              }));
                            }}
                          >
                            {progress.completed.includes(selected.id) ? (
                              <>
                                <Check size={16} /> Reviewed
                              </>
                            ) : (
                              "Mark as reviewed"
                            )}
                          </Button>
                        </div>
                        <p className="fine-print">
                          Starter notes, not a complete course textbook.{" "}
                          {course.note}
                        </p>
                        <h3>Read further</h3>
                        <SourceList sources={guide.resources} />
                      </>
                    )}
                    {studyTab === "recall" && (
                      <Flashcards
                        cards={guide.flashcards}
                        topic={selected.title}
                      />
                    )}
                    {studyTab === "sources" && (
                      <>
                        <h3>Sources and course coverage</h3>
                        <p>{course.note}</p>
                        <p className="fine-print">
                          Original concise notes checked against the linked
                          syllabus and textbook material. Revision-provider
                          pages are external reading resources. Last content
                          review: {REVIEW_DATE}.
                        </p>
                        <SourceList sources={guide.resources} />
                        <h3>Scientific workflows</h3>
                        <p>
                          Explore the source instructions for compound lookup
                          and scientific review. These GitHub links are
                          reference workflows; the app does not execute them.
                        </p>
                        <div className="skill-links">
                          {SCIENCE_SKILLS.map((skill) => (
                            <a
                              key={skill.name}
                              href={skill.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <strong>{skill.name}</strong>
                              <p>{skill.description}</p>
                              <ExternalLink size={15} />
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </article>
              </div>
            </>
          )}
          {view === AppView.MOLECULE_VIEWER && (
            <>
              <PageHeading
                title="Molecule lab"
                description="Read bond orders, preserve formal charges, and separate structure from geometry."
              >
                <Button secondary onClick={save} disabled={!molecule}>
                  <Bookmark size={16} /> Save structure
                </Button>
              </PageHeading>
              <form
                className="molecule-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  void loadMolecule();
                }}
              >
                <label htmlFor="molecule-input">Molecule name or SMILES</label>
                <div className="input-action">
                  <input
                    id="molecule-input"
                    value={molInput}
                    onChange={(e) => setMolInput(e.target.value)}
                    placeholder="Benzene, water, or smiles:CCO"
                    required
                  />
                  <button className="button" disabled={molLoading}>
                    {molLoading ? (
                      <Loader2 size={17} className="spin" />
                    ) : (
                      <Search size={17} />
                    )}{" "}
                    Inspect structure
                  </button>
                </div>
                <p className="fine-print">
                  Reference examples open instantly. Use “smiles:” for a
                  supplied structure; other names use the AI service.
                </p>
              </form>
              <div className="example-row">
                {[
                  "Benzene",
                  "Methane",
                  "Water",
                  "Ammonia",
                  "Carbon dioxide",
                  "Ethene",
                  "Nitrobenzene",
                ].map((name) => (
                  <button key={name} onClick={() => void loadMolecule(name)}>
                    {name}
                  </button>
                ))}
              </div>
              <div className="lab-layout">
                <MoleculeVisualizer
                  data={molecule}
                  loading={molLoading}
                  onAnalyze={(value) => {
                    setMolecule(value);
                    setMolInput("smiles:" + value.smiles);
                  }}
                />
                {molecule && <MoleculeFacts data={molecule} />}
              </div>
              <details className="reaction-on-structure">
                <summary>Explore a reaction with this structure</summary>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!molecule || !reagent.trim()) return;
                    const request = ++moleculeRequest.current;
                    setMolLoading(true);
                    setError("");
                    try {
                      const value = await gemini.applyReaction(
                        molecule,
                        reagent,
                        conditions,
                      );
                      if (request === moleculeRequest.current)
                        setMolecule(value);
                    } catch (err) {
                      if (request === moleculeRequest.current)
                        setError(getError(err));
                    } finally {
                      if (request === moleculeRequest.current)
                        setMolLoading(false);
                    }
                  }}
                >
                  <label>
                    Reagent
                    <input
                      value={reagent}
                      onChange={(e) => setReagent(e.target.value)}
                      placeholder="e.g. hydroxide"
                      required
                    />
                  </label>
                  <Conditions value={conditions} onChange={updateConditions} />
                  <button className="button" disabled={molLoading}>
                    Predict transformed structure <ArrowRight size={16} />
                  </button>
                </form>
              </details>
            </>
          )}
          {view === AppView.REACTION_SIMULATOR && (
            <>
              <PageHeading
                title="Reaction simulator"
                description="Combine two inputs, state the conditions, and examine a proposed product."
              />
              <div className="reaction-layout">
                <form className="reaction-form" onSubmit={predict}>
                  <h2>Set up a prediction</h2>
                  <label>
                    First reactant
                    <input
                      value={a}
                      disabled={simLoading}
                      onChange={(e) => {
                        invalidateSimulation();
                        setA(e.target.value);
                      }}
                      required
                      placeholder="Name or SMILES"
                    />
                  </label>
                  <div className="reactant-plus">
                    <Plus size={18} />
                  </div>
                  <label>
                    Second reactant
                    <input
                      value={b}
                      disabled={simLoading}
                      onChange={(e) => {
                        invalidateSimulation();
                        setB(e.target.value);
                      }}
                      required
                      placeholder="Name or SMILES"
                    />
                  </label>
                  <Conditions
                    value={conditions}
                    onChange={updateConditions}
                    disabled={simLoading}
                  />
                  <button className="button" disabled={simLoading}>
                    {simLoading ? (
                      <Loader2 size={17} className="spin" />
                    ) : (
                      <Combine size={17} />
                    )}{" "}
                    Predict product
                  </button>
                  <p className="fine-print">
                    Conditions matter. AI confidence is self-assessed; it is not
                    an experimental probability.
                  </p>
                  <button
                    type="button"
                    disabled={simLoading}
                    className="text-link"
                    onClick={() => {
                      setA("bromomethane");
                      setB("hydroxide");
                      updateConditions({
                        temp: 25,
                        pressure: 1,
                        catalyst: "none",
                        solvent: "water",
                      });
                      setSimulation(null);
                    }}
                  >
                    Try a substitution example
                  </button>
                </form>
                <section className="reaction-result" aria-live="polite">
                  {simLoading ? (
                    <div className="loading-state">
                      <Loader2 size={24} className="spin" />
                      <p>Considering the reactants and conditions…</p>
                    </div>
                  ) : simulation ? (
                    <>
                      <div className="section-heading">
                        <h2>
                          {simulation.assessment === "no-reaction"
                            ? "No reaction predicted"
                            : simulation.product.name}
                        </h2>
                        <span className="tag copper">AI prediction</span>
                      </div>
                      <div className="reaction-equation">
                        {simulation.equation}
                      </div>
                      <p>{simulation.explanation}</p>
                      <div className="prediction-meta">
                        <span>{simulation.reactionType}</span>
                        <span>Model confidence: {simulation.confidence}</span>
                      </div>
                      <div
                        className={
                          "notice " +
                          (simulation.assessment === "balanced"
                            ? "success"
                            : "caution")
                        }
                      >
                        {simulation.balanceNote}
                      </div>
                      {simulation.assessment !== "no-reaction" && (
                        <MoleculeVisualizer
                          data={simulation.product}
                          loading={false}
                        />
                      )}
                      <p className="fine-print">{simulation.safetyNote}</p>
                      {simulation.assessment !== "no-reaction" && (
                        <Button
                          secondary
                          onClick={() => {
                            setMolecule(simulation.product);
                            setMolInput(simulation.product.name);
                            navigate(AppView.MOLECULE_VIEWER);
                          }}
                        >
                          Inspect product <ArrowRight size={16} />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="empty-state reaction-empty">
                      <FlaskConical size={36} />
                      <h2>What could form?</h2>
                      <p>
                        The product, equation, and reasoning will appear here. A
                        molecule passing a graph check does not prove that the
                        reaction occurs.
                      </p>
                      <div className="example-equation">
                        acid + alcohol ⇌ ester + water
                      </div>
                      <p className="fine-print">
                        Illustrative reaction class; acid catalysis and suitable
                        conditions are needed.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
          {view === AppView.REACTION_TUTOR && (
            <>
              <PageHeading
                title="Mechanism tutor"
                description="Follow electron movement and understand why each step happens."
              />
              <form
                className="molecule-search"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setMechLoading(true);
                  setMechanism(null);
                  setError("");
                  try {
                    setMechanism(
                      await gemini.generateReactionSteps(mechanismQuery),
                    );
                  } catch (err) {
                    setError(getError(err));
                  } finally {
                    setMechLoading(false);
                  }
                }}
              >
                <label htmlFor="mechanism-query">Reaction or mechanism</label>
                <div className="input-action">
                  <input
                    id="mechanism-query"
                    value={mechanismQuery}
                    onChange={(e) => setMechanismQuery(e.target.value)}
                    required
                  />
                  <button className="button" disabled={mechLoading}>
                    {mechLoading ? (
                      <Loader2 size={17} className="spin" />
                    ) : (
                      <BookOpen size={17} />
                    )}{" "}
                    Explain mechanism
                  </button>
                </div>
              </form>
              {mechanism ? (
                <article className="mechanism-article">
                  <div className="section-heading">
                    <h2>{mechanism.name}</h2>
                    <span className="tag copper">AI explanation</span>
                  </div>
                  <ol className="mechanism-steps">
                    {mechanism.steps.map((step) => (
                      <li key={step.step}>
                        <h3>{step.keyConcept}</h3>
                        <p>{step.description}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="fine-print">
                    The mechanism is model-generated and is not automatically
                    fact-checked. For SN2, compare the textbook account below.
                  </p>
                  <SourceList
                    sources={[
                      {
                        title: "Characteristics of the SN2 reaction",
                        source: "OpenStax Organic Chemistry",
                        url: "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
                      },
                    ]}
                  />
                </article>
              ) : (
                <div className="empty-state">
                  <h2>From reactants to reasoning</h2>
                  <p>
                    Specify the substrate, reagent, and conditions for a useful
                    explanation.
                  </p>
                </div>
              )}
            </>
          )}
          {view === AppView.QUIZ_ARENA && (
            <>
              <PageHeading
                title="Practice questions"
                description="Check your understanding against the active module’s core ideas."
              />
              <div className="practice-layout">
                <aside className="practice-context">
                  <h2>{selected.title}</h2>
                  <p>
                    {course.name} / {selected.level}
                  </p>
                  <label>
                    Practice module
                    <select
                      value={selected.id}
                      disabled={quizLoading || (!!quiz && !quizDone)}
                      onChange={(e) => {
                        selectModule(e.target.value);
                      }}
                    >
                      {course.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} — {m.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="fine-print">
                    AI-generated practice, not official examination questions.
                    Scores are stored locally.
                  </p>
                </aside>
                <section className="quiz-panel">
                  {!quiz ? (
                    <div className="empty-state">
                      <h2>Make the ideas stick</h2>
                      <p>
                        Generate five multiple-choice questions based on this
                        module’s notes.
                      </p>
                      <Button
                        onClick={() => void startQuiz()}
                        disabled={quizLoading}
                      >
                        {quizLoading ? (
                          <Loader2 size={17} className="spin" />
                        ) : (
                          <Pencil size={17} />
                        )}{" "}
                        Generate practice set
                      </Button>
                    </div>
                  ) : quizDone ? (
                    <div className="quiz-finish">
                      <Check size={30} />
                      <h2>Practice complete</h2>
                      <div className="quiz-result-score">
                        {score} / {quiz.questions.length}
                      </div>
                      <p>
                        {Math.round((score / quiz.questions.length) * 100)}%
                        correct. Revisit the source notes to work through missed
                        ideas.
                      </p>
                      <Button onClick={() => void startQuiz()}>
                        New practice set
                      </Button>
                      <Button
                        secondary
                        onClick={() => navigate(AppView.STUDY_HUB)}
                      >
                        Return to notes
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="question-position">
                        <span>
                          Question {quizIndex + 1} of {quiz.questions.length}
                        </span>
                        <span>{score} correct</span>
                      </div>
                      <progress
                        value={quizIndex + 1}
                        max={quiz.questions.length}
                        aria-label="Question progress"
                      />
                      <h2>{quiz.questions[quizIndex].question}</h2>
                      <div className="quiz-options">
                        {quiz.questions[quizIndex].options?.map((option, i) => (
                          <button
                            key={option}
                            disabled={answer !== null}
                            className={
                              "quiz-option" +
                              (answer !== null &&
                              option === quiz.questions[quizIndex].correctAnswer
                                ? " correct"
                                : answer === option
                                  ? " incorrect"
                                  : "")
                            }
                            onClick={() => {
                              setAnswer(option);
                              if (
                                option ===
                                quiz.questions[quizIndex].correctAnswer
                              )
                                setScore((s) => s + 1);
                            }}
                          >
                            <span>{String.fromCharCode(65 + i)}</span>
                            {option}
                          </button>
                        ))}
                      </div>
                      {answer !== null && (
                        <div className="answer-explanation">
                          <h3>
                            {answer === quiz.questions[quizIndex].correctAnswer
                              ? "Correct"
                              : "Review this idea"}
                          </h3>
                          <p>{quiz.questions[quizIndex].explanation}</p>
                          <p>
                            Answer: {quiz.questions[quizIndex].correctAnswer}
                          </p>
                          <Button onClick={nextQuestion}>
                            {quizIndex === quiz.questions.length - 1
                              ? "Finish practice"
                              : "Next question"}{" "}
                            <ArrowRight size={16} />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            </>
          )}
          {view === AppView.CHAT_TUTOR && (
            <>
              <PageHeading
                title="Ask a chemistry tutor"
                description={
                  "Explore a question in the context of " +
                  selected.title.toLowerCase() +
                  "."
                }
              />
              <div className="chat-workspace">
                <div className="chat-context">
                  <BookOpen size={17} />
                  <span>{selected.title}</span>
                  <span className="tag">AI conversation</span>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="empty-state">
                      <h2>Start with a question</h2>
                      <p>
                        Ask for an explanation, a comparison, or help spotting
                        an error in your reasoning.
                      </p>
                      <button
                        className="question-suggestion"
                        onClick={() =>
                          setChatInput(
                            "How can I distinguish molecular shape from electron-domain geometry?",
                          )
                        }
                      >
                        How is molecular shape different from electron-domain
                        geometry?
                      </button>
                    </div>
                  )}
                  {messages.map((message, i) => (
                    <div className={"chat-message " + message.role} key={i}>
                      <span>{message.role === "user" ? "You" : "Tutor"}</span>
                      <p>{message.text}</p>
                    </div>
                  ))}
                  {chatLoading && (
                    <p className="loading-state" role="status">
                      <Loader2 size={18} className="spin" /> Preparing an
                      explanation…
                    </p>
                  )}
                  <div ref={chatEnd} />
                </div>
                <form className="chat-compose" onSubmit={sendChat}>
                  <label className="sr-only" htmlFor="chat-input">
                    Your chemistry question
                  </label>
                  <input
                    id="chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a chemistry question…"
                    required
                  />
                  <button
                    className="button"
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    Send <ArrowRight size={17} />
                  </button>
                </form>
                <p className="fine-print">
                  AI explanations can contain errors. Compare factual claims
                  with your module’s cited sources.
                </p>
              </div>
            </>
          )}
          {view === AppView.ARCHIVE && (
            <>
              <PageHeading
                title="Saved structures"
                description="Your collection, stored in this browser."
              />
              {archive.length ? (
                <div className="archive-list">
                  {archive.map((item) => (
                    <div className="saved-structure" key={item.id}>
                      <Atom size={23} />
                      <div>
                        <h2>{item.name}</h2>
                        <p>
                          {new Date(item.timestamp).toLocaleDateString()} ·{" "}
                          {item.data.formula || "Custom graph"}
                        </p>
                      </div>
                      <Button
                        secondary
                        onClick={() => {
                          setMolecule(item.data);
                          setMolInput(item.name);
                          navigate(AppView.MOLECULE_VIEWER);
                        }}
                      >
                        Open <ArrowRight size={15} />
                      </Button>
                      <button
                        className="icon-button"
                        aria-label={
                          "Remove " + item.name + " from saved structures"
                        }
                        onClick={() => {
                          setArchive((items) =>
                            items.filter((a) => a.id !== item.id),
                          );
                          setNotice(
                            "Structure removed from this browser’s collection.",
                          );
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Library size={36} />
                  <h2>Build your collection</h2>
                  <p>
                    Open a molecule and save its structure to revisit it here.
                  </p>
                  <Button onClick={() => navigate(AppView.MOLECULE_VIEWER)}>
                    Explore molecules <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <span>CarbonCanvas</span>
            <span>
              {course.shortName} · {course.version}
            </span>
            <button
              onClick={() => {
                navigate(AppView.STUDY_HUB);
                setStudyTab("sources");
              }}
            >
              Sources & coverage <ExternalLink size={13} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
function MoleculePreview() {
  const [data, setData] = useState<MoleculeData | null>(null);
  useEffect(() => {
    let active = true;
    normalizeMolecule(getReference("benzene")!)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="overview-molecule">
      <MoleculeVisualizer data={data} loading={!data} />
    </div>
  );
}
