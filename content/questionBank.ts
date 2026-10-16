import { COURSES, getStudyGuide, type CourseId } from "./curriculum.ts";
import type { QuizQuestion } from "../types";

export const paperSources = [
  {
    id: "cambridge-9701",
    course: "ALEVEL",
    title: "Cambridge 9701 official papers and markschemes",
    source: "Official catalogue; public selection, school access for more",
    url: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-chemistry-9701/past-papers/",
    year: 2026,
    status: "catalogue-not-complete",
    license: "Link only; reproduction permission required",
  },
  {
    id: "cambridge-2024-21-ms",
    course: "ALEVEL",
    title: "Cambridge 9701/21 — May/June 2024 markscheme",
    source: "Official markscheme",
    url: "https://www.cambridgeinternational.org/Images/567189-june-2024-mark-scheme-paper-21.pdf",
    year: 2024,
    status: "verified-link",
    license: "Link only",
  },
  {
    id: "papacambridge-9701",
    course: "ALEVEL",
    title: "PapaCambridge — chemistry 9701 paper archive",
    source: "Third-party archive; availability and rights not certified",
    url: "https://pastpapers.papacambridge.com/papers/caie/as-and-a-level-chemistry-9701",
    year: 2026,
    status: "catalogue-not-complete",
    license: "Link only",
  },
  {
    id: "ib-questionbank",
    course: "IB",
    title: "IB official chemistry Questionbank",
    source: "Licensed access; choose first-assessment-2025 course",
    url: "https://questionbank.ibo.org/",
    year: 2026,
    status: "licensed-access",
    license: "IB reproduction permission required",
  },
  {
    id: "ib-rv",
    course: "IB",
    title: "Revision Village — IB chemistry past papers",
    source: "Third-party solutions; some access may require a subscription",
    url: "https://www.revisionvillage.com/ib-chemistry/past-papers/",
    year: 2026,
    status: "catalogue-not-complete",
    license: "Link only",
  },
  {
    id: "ib-docs",
    course: "IB",
    title: "IB Docs — chemistry paper archive",
    source: "User-supplied third-party archive; rights not verified",
    url: "https://ibdocs.re/past-papers-by-subject/chemistry",
    year: 2026,
    status: "rights-unverified-link",
    license: "Do not ingest or redistribute without permission",
  },
];

export interface BankQuestion extends QuizQuestion {
  bankId: string;
  source: {
    title: string;
    url: string;
    kind: "original" | "adapted-past-paper";
    year?: number;
    reference?: string;
    license: string;
    attribution?: string;
  };
}

// No protected paper text is copied. Original recall items are separate from licensed adaptations.
export function getQuestionBank(
  course: CourseId,
  moduleId: string,
): BankQuestion[] {
  const module = COURSES[course].modules.find((m) => m.id === moduleId);
  if (!module) return [];
  const guide = getStudyGuide(module, course);
  const original = guide.flashcards.map((card, i): BankQuestion => {
    const wrong = guide.flashcards
      .filter((c) => c.term !== card.term && c.definition !== card.definition)
      .map((c) => c.definition)
      .slice(0, 3);
    return {
      id: i + 1,
      bankId: `${moduleId}:original:${i}`,
      type: "mcq",
      question: card.term,
      options: [card.definition, ...wrong],
      correctAnswer: card.definition,
      explanation: card.definition,
      source: {
        title: "CarbonCanvas original recall question",
        url: guide.resources[0].url,
        kind: "original",
        license: "Original educational content",
      },
    };
  });
  return original;
}

export function drawPracticeSet(
  course: CourseId,
  moduleId: string,
  count = 10,
  source: "mixed" | "past-paper" | "original" = "mixed",
): BankQuestion[] {
  const next = [...getQuestionBank(course, moduleId)].filter(
    (q) =>
      source === "mixed" ||
      (source === "past-paper"
        ? q.source.kind === "adapted-past-paper"
        : q.source.kind === "original"),
  );
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next.slice(0, count).map((q, i) => ({
    ...q,
    id: i + 1,
    options: shuffleOptions(q.options || []),
  }));
}
function shuffleOptions(options: string[]): string[] {
  const next = [...options];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
