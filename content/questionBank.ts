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
  {
    id: "mit-5111-2014",
    course: "UNDERGRAD",
    title: "MIT 5.111SC — Fall 2014 exams and solutions",
    source: "Catherine Drennan / MIT OpenCourseWare",
    url: "https://ocw.mit.edu/courses/5-111sc-principles-of-chemical-science-fall-2014/pages/exams/",
    year: 2014,
    status: "verified-open-course",
    license: "CC BY-NC-SA 4.0",
  },
  {
    id: "mit-512-2005",
    course: "UNDERGRAD",
    title: "MIT 5.12 — Spring 2005 exams and solutions",
    source: "Kimberly Berkowski & Sarah O’Connor / MIT OpenCourseWare",
    url: "https://ocw.mit.edu/courses/5-12-organic-chemistry-i-spring-2005/pages/exams/",
    year: 2005,
    status: "verified-open-course",
    license: "CC BY-NC-SA 4.0",
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
  includeOpenPapers = false,
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
  return [
    ...(includeOpenPapers
      ? OPEN_PAPER_QUESTIONS.filter((q) => q.modules.includes(moduleId)).map(
          (q, i) => ({ ...q, id: original.length + i + 1 }),
        )
      : []),
    ...original,
  ];
}

const mit1 =
  "https://ocw.mit.edu/courses/5-111sc-principles-of-chemical-science-fall-2014/resources/mit5_111f14_exam1/";
const mit2 =
  "https://ocw.mit.edu/courses/5-111sc-principles-of-chemical-science-fall-2014/resources/mit5_111f14_exam2/";
export const OPEN_PAPER_QUESTIONS: (BankQuestion & { modules: string[] })[] = [
  {
    id: 5,
    bankId: "mit-5111-2014-e2-q3aii",
    modules: ["UNDERGRAD-F1", "UNDERGRAD-F2"],
    type: "mcq",
    question: "What is the molecular geometry around phosphorus in HPO4^2−?",
    options: ["Tetrahedral", "Square planar", "Trigonal pyramidal", "Linear"],
    correctAnswer: "Tetrahedral",
    explanation:
      "There are four bonded oxygen directions around phosphorus. The published key uses tetrahedral geometry.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 2, Q3(a)(ii)",
      url: mit2,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "3(a)(ii)",
      license: "CC BY-NC-SA 4.0",
      attribution:
        "Catherine Drennan / MIT OpenCourseWare; converted to MCQ with new distractors",
    },
  },
  {
    id: 6,
    bankId: "mit-5111-2014-e2-q3bii",
    modules: ["UNDERGRAD-F1", "UNDERGRAD-F2"],
    type: "mcq",
    question: "What molecular shape does the VSEPR model predict for SF4?",
    options: ["Seesaw", "Tetrahedral", "Square planar", "Trigonal planar"],
    correctAnswer: "Seesaw",
    explanation:
      "Four bonds and one lone pair give AX4E, with a trigonal-bipyramidal domain arrangement and seesaw molecular shape.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 2, Q3(b)(ii)",
      url: mit2,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "3(b)(ii)",
      license: "CC BY-NC-SA 4.0",
      attribution: "Catherine Drennan / MIT OpenCourseWare; converted to MCQ",
    },
  },
  {
    id: 7,
    bankId: "mit-5111-2014-e2-q4c",
    modules: ["UNDERGRAD-F1"],
    type: "mcq",
    question:
      "What is the bond order of ground-state O2 in the usual valence molecular-orbital model?",
    options: ["2", "1", "3", "0"],
    correctAnswer: "2",
    explanation:
      "Eight bonding and four antibonding valence electrons give (8−4)/2=2.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 2, Q4(c)",
      url: mit2,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "4(c)",
      license: "CC BY-NC-SA 4.0",
      attribution: "Catherine Drennan / MIT OpenCourseWare; converted to MCQ",
    },
  },
  {
    id: 1,
    bankId: "mit-5111-2014-e1-q4a",
    modules: ["UNDERGRAD-F1"],
    type: "mcq",
    question:
      "Of the 3s, 3p and 3d orbitals, which has the most angular nodes?",
    options: ["3d", "3p", "3s", "All have the same number"],
    correctAnswer: "3d",
    explanation: "Angular-node count equals l: 0 for s, 1 for p and 2 for d.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 1, Q4(a)",
      url: mit1,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "4(a)",
      license: "CC BY-NC-SA 4.0",
      attribution:
        "Catherine Drennan / MIT OpenCourseWare; converted to MCQ with new distractors",
    },
  },
  {
    id: 2,
    bankId: "mit-5111-2014-e1-q6a",
    modules: ["UNDERGRAD-F1"],
    type: "mcq",
    question: "Is the set n=3, l=3, ml=0 allowed?",
    options: [
      "No: l must be less than n",
      "Yes: all nonnegative l values are allowed",
      "No: ml cannot be zero",
      "Yes: it describes a 3f orbital",
    ],
    correctAnswer: "No: l must be less than n",
    explanation: "For n=3, l can only be 0, 1 or 2.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 1, Q6(a)",
      url: mit1,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "6(a)",
      license: "CC BY-NC-SA 4.0",
      attribution: "Catherine Drennan / MIT OpenCourseWare; adapted to MCQ",
    },
  },
  {
    id: 3,
    bankId: "mit-5111-2014-e1-q6b",
    modules: ["UNDERGRAD-F1"],
    type: "mcq",
    question: "What does the allowed set n=2, l=1, ml=0 describe?",
    options: ["A 2p orbital", "A 2s orbital", "A 2d orbital", "A 1p orbital"],
    correctAnswer: "A 2p orbital",
    explanation: "n labels the second shell and l=1 labels a p subshell.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 1, Q6(b)",
      url: mit1,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "6(b)",
      license: "CC BY-NC-SA 4.0",
      attribution: "Catherine Drennan / MIT OpenCourseWare; adapted to MCQ",
    },
  },
  {
    id: 4,
    bankId: "mit-5111-2014-e1-q6d",
    modules: ["UNDERGRAD-F1"],
    type: "mcq",
    question: "Why is n=3, l=1, ml=2 not an allowed set?",
    options: [
      "ml must lie between −1 and +1 for l=1",
      "n must equal l",
      "p orbitals have no magnetic quantum number",
      "Every n=3 orbital must have l=3",
    ],
    correctAnswer: "ml must lie between −1 and +1 for l=1",
    explanation:
      "The permitted magnetic quantum numbers are integers from −l to +l.",
    source: {
      title: "MIT 5.111 Fall 2014 Exam 1, Q6(d)",
      url: mit1,
      kind: "adapted-past-paper",
      year: 2014,
      reference: "6(d)",
      license: "CC BY-NC-SA 4.0",
      attribution: "Catherine Drennan / MIT OpenCourseWare; adapted to MCQ",
    },
  },
];

export function drawPracticeSet(
  course: CourseId,
  moduleId: string,
  count = 10,
  includeOpenPapers = false,
  source: "mixed" | "past-paper" | "original" = "mixed",
): BankQuestion[] {
  const next = [...getQuestionBank(course, moduleId, includeOpenPapers)].filter(
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
  return next
    .slice(0, count)
    .map((q, i) => ({
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
