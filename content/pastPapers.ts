import index from "./pastPapers.json" with { type: "json" };
import schemeHashes from "./markschemeHashes.json" with { type: "json" };

export type PaperFormat = "mcq" | "frq";
export interface PastPaper {
  id: string;
  year: number;
  session: string;
  component: string;
  format: PaperFormat;
  filename: string;
  paperUrl: string;
  listingUrl: string;
  markschemeUrl?: string;
  sha256: string;
  pages: number;
  maximumMark?: number;
  questionCount?: number;
  answerKey?: string;
  answerKeySha256?: string;
  markschemeSha256?: string;
}
const sourceBase =
  "https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/";
export const PAST_PAPERS: PastPaper[] = index.papers.map((p) => ({
  ...p,
  markschemeSha256: (schemeHashes as Record<string, string>)[
    `${p.id.replace("_qp_", "_ms_")}.pdf`
  ],
  format: p.format as PaperFormat,
  filename: `${p.id}.pdf`,
  paperUrl: new URL(`${p.id}.pdf`, sourceBase).href,
  markschemeUrl: new URL(`${p.id.replace("_qp_", "_ms_")}.pdf`, sourceBase)
    .href,
  listingUrl: index.source,
}));
export const PAPER_REVIEW_DATE = index.checkedOn;
export const SESSION_NAMES: Record<string, string> = {
  march: "February/March",
  "may-june": "May/June",
  "oct-nov": "October/November",
};
export const COMPONENT_NAMES: Record<string, string> = {
  "1": "Multiple choice",
  "2": "AS structured",
  "3": "Practical",
  "4": "A Level structured",
  "5": "Planning, analysis and evaluation",
};
export function paperLabel(p: PastPaper) {
  return `${p.year} ${SESSION_NAMES[p.session]} · 9701/${p.component}`;
}
export function publicPaper(p: PastPaper) {
  const { answerKey, answerKeySha256, ...metadata } = p;
  return { ...metadata, autoGrading: !!answerKey };
}
export function gradeMcqPaper(
  paper: PastPaper,
  answers: Record<string, string>,
) {
  if (
    paper.format !== "mcq" ||
    !paper.answerKey ||
    !/^[ABCD]{40}$/.test(paper.answerKey)
  )
    throw new Error("No verified multiple-choice key for this paper");
  const feedback = [...paper.answerKey].map((correctAnswer, i) => ({
    question: i + 1,
    answer: answers[String(i + 1)] || "",
    correctAnswer,
    correct: answers[String(i + 1)] === correctAnswer,
  }));
  const score = feedback.filter((q) => q.correct).length;
  return {
    paperId: paper.id,
    score,
    maximum: 40,
    answered: feedback.filter((q) => q.answer).length,
    percentage: Math.round((score / 40) * 100),
    grading: "markscheme-answer-key",
    feedback,
    markschemeUrl: paper.markschemeUrl,
  };
}
