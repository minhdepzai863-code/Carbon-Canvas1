import { api } from "./api";
import type {
  MoleculeData,
  QuizData,
  ReactionData,
  ReactionSimulation,
  StudyGuide,
} from "../types";
import {
  normalizeMolecule,
  checkEquation,
  productMatchesEquation,
} from "./chemistry";
import { getReference } from "../content/molecules";

const bondSchema = {
  type: "object",
  properties: {
    source: { type: "string" },
    target: { type: "string" },
    order: { type: "integer", minimum: 1, maximum: 3 },
    stereo: { type: "string", enum: ["none", "wedge", "dash"] },
  },
  required: ["source", "target", "order"],
};

const moleculeSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    smiles: { type: "string" },
    atoms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          element: { type: "string" },
          formalCharge: { type: "integer" },
        },
        required: ["id", "element"],
      },
    },
    bonds: { type: "array", items: bondSchema },
    resonanceStructures: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          bonds: { type: "array", items: bondSchema },
        },
        required: ["description", "bonds"],
      },
    },
    symmetry: {
      type: "object",
      properties: {
        pointGroup: { type: "string" },
        elements: { type: "array", items: { type: "string" } },
      },
      required: ["pointGroup", "elements"],
    },
  },
  required: ["name", "description", "smiles", "atoms", "bonds"],
};

const quizSchema = {
  type: "object",
  properties: {
    topic: { type: "string" },
    questions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          type: { type: "string", enum: ["mcq", "fitb", "short_answer"] },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctAnswer: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["id", "type", "question", "correctAnswer", "explanation"],
      },
    },
  },
  required: ["topic", "questions"],
};

const reactionSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: { type: "integer" },
          description: { type: "string" },
          keyConcept: { type: "string" },
        },
        required: ["step", "description", "keyConcept"],
      },
    },
    references: { type: "array", items: { type: "string" } },
  },
  required: ["name", "steps", "references"],
};

const studyGuideSchema = {
  type: "object",
  properties: {
    topic: { type: "string" },
    summary: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    commonMistakes: { type: "array", items: { type: "string" } },
    resources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          source: { type: "string" },
        },
        required: ["title", "url", "source"],
      },
    },
    flashcards: {
      type: "array",
      minItems: 6,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          definition: { type: "string" },
          hint: { type: "string" },
        },
        required: ["term", "definition", "hint"],
      },
    },
  },
  required: [
    "topic",
    "summary",
    "keyPoints",
    "commonMistakes",
    "resources",
    "flashcards",
  ],
};

const simulationSchema = {
  type: "object",
  properties: {
    equation: { type: "string" },
    reactionType: { type: "string" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    explanation: { type: "string" },
    safetyNote: { type: "string" },
    product: moleculeSchema,
  },
  required: [
    "equation",
    "reactionType",
    "confidence",
    "explanation",
    "safetyNote",
    "product",
  ],
};

const generateJson = async <T>(prompt: string, schema: object): Promise<T> => {
  const kind =
    schema === moleculeSchema
      ? "molecule"
      : schema === quizSchema
        ? "quiz"
        : schema === reactionSchema
          ? "reaction"
          : schema === studyGuideSchema
            ? "study"
            : "simulation";
  return (await api<{ result: T }>("/api/ai/generate", { kind, prompt }))
    .result;
};

const cleanMolecule = (data: MoleculeData) => ({
  smiles: data.smiles,
  atoms: data.atoms.map(({ id, element, formalCharge }) => ({
    id,
    element,
    formalCharge,
  })),
  bonds: data.bonds.map((bond) => ({
    source:
      typeof bond.source === "object"
        ? (bond.source as { id: string }).id
        : bond.source,
    target:
      typeof bond.target === "object"
        ? (bond.target as { id: string }).id
        : bond.target,
    order: bond.order,
    stereo: bond.stereo ?? "none",
  })),
});

export const generateMoleculeData = async (moleculeName: string) => {
  const reference = getReference(moleculeName);
  if (reference) return normalizeMolecule(reference);
  if (/^smiles:/i.test(moleculeName))
    return normalizeMolecule({
      name: "Custom structure",
      description:
        "Structure supplied as SMILES. Identity has not been checked against a reference database.",
      smiles: moleculeName.replace(/^smiles:/i, "").trim(),
      atoms: [],
      bonds: [],
      provenance: "user",
    });
  const result = await generateJson<MoleculeData>(
    `Generate a chemically plausible 2D graph for ${JSON.stringify(moleculeName)}. Include explicit heavy atoms, bonds, a concise description, resonance contributors when relevant, and symmetry information.`,
    moleculeSchema,
  );
  return normalizeMolecule({
    ...result,
    provenance: "ai",
    sourceUrl: undefined,
    geometry: undefined,
    symmetry: undefined,
  });
};

export const analyzeMolecule = async (data: MoleculeData) => {
  const checked = await normalizeMolecule(data);
  const result = await generateJson<MoleculeData>(
    `Analyze this user-edited structure: ${JSON.stringify(cleanMolecule(data))}. Check valence, charge plausibility, stability, and whether the species is known. If impossible, set the name to "Impossible structure" and explain exactly why.`,
    moleculeSchema,
  );
  return {
    ...checked,
    description: result.description,
    provenance: "user" as const,
    sourceUrl: undefined,
    geometry: undefined,
    symmetry: undefined,
  };
};

export interface ReactionConditions {
  temp: number;
  pressure: number;
  catalyst: string;
  solvent: string;
}

export const applyReaction = async (
  data: MoleculeData,
  reagent: string,
  conditions: ReactionConditions,
) => {
  const result = await generateJson<MoleculeData>(
    `Predict the major product for reactant ${JSON.stringify(cleanMolecule(data))}, reagent ${JSON.stringify(reagent)}, and conditions ${JSON.stringify(conditions)}. Account for kinetics, thermodynamics, solvent, catalyst, and selectivity. If no reaction is expected, preserve the reactant graph and name it "No reaction".`,
    moleculeSchema,
  );
  return normalizeMolecule({
    ...result,
    provenance: "ai",
    sourceUrl: undefined,
    geometry: undefined,
    symmetry: undefined,
  });
};

export const predictReaction = (
  reactantA: string,
  reactantB: string,
  conditions: ReactionConditions,
) => {
  return generateJson<ReactionSimulation>(
    `Predict the major product when reactant A ${JSON.stringify(reactantA)} is combined with reactant B ${JSON.stringify(reactantB)} under ${JSON.stringify(conditions)}. Inputs may be names or SMILES; formulas that cannot identify an isomer need clarification. Return one major product graph, an equation using explicit molecular formulas with integer coefficients, spaces around plus signs, and -> or ⇌. Include all coproducts needed to balance. Write charges as ^2- or ^+; do not place conditions in the equation. Also give the reaction class, model-assessed confidence, assumptions, mechanistic rationale, and a practical safety note. Do not infer catalyst or heating not supplied. If the inputs do not plausibly react on a meaningful timescale, return "No reaction" as the product name and explain why. This is an educational prediction.`,
    simulationSchema,
  ).then(async (result) => {
    if (result.product.name.toLowerCase().includes("no reaction"))
      return {
        ...result,
        assessment: "no-reaction" as const,
        balanceNote: "No product is claimed under these conditions.",
      };
    const balance = checkEquation(result.equation);
    if (balance.balanced === false)
      throw new Error(balance.note + " Refine the inputs and try again.");
    const product = await normalizeMolecule({
      ...result.product,
      provenance: "ai",
      sourceUrl: undefined,
      geometry: undefined,
      symmetry: undefined,
    });
    if (
      productMatchesEquation(result.equation, product.formula || "") === false
    )
      throw new Error(
        "The proposed structure does not match a product formula in the equation. Refine the inputs and try again.",
      );
    return {
      ...result,
      product,
      assessment: balance.balanced
        ? ("balanced" as const)
        : ("qualitative" as const),
      balanceNote: balance.note,
    };
  });
};

export const generateQuiz = (topic: string, context = "") =>
  generateJson<QuizData>(
    `Create exactly five questions about ${JSON.stringify(topic)}, aligned to this course context: ${context}. Use five multiple-choice questions with exactly four distinct options each, correctAnswer identical to one option, and explanations instructional. Avoid short answers graded by brittle string matching. Base facts on the supplied notes when present; do not imply official exam-board authorship.`,
    quizSchema,
  );

export const generateReactionSteps = (reactionQuery: string) =>
  generateJson<ReactionData>(
    `Explain the mechanism for ${JSON.stringify(reactionQuery)} as ordered steps. Cite only standard textbooks or primary references you can name confidently; do not fabricate chapters, pages, or URLs.`,
    reactionSchema,
  );

export const generateStudyGuide = (topic: string) =>
  generateJson<StudyGuide>(
    `Create a focused organic chemistry study guide for ${JSON.stringify(topic)}. Include a concise summary, key points, common mistakes, six to ten active-recall flashcards, and useful search URLs for Khan Academy, The Organic Chemistry Tutor, PubChem, or ChEMBL. The flashcard definition must fully answer its term and the hint must not give the answer away.`,
    studyGuideSchema,
  );

export const chatWithTutor = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  message: string,
) =>
  (
    await api<{ result: string }>("/api/ai/tutor", {
      history: history.slice(-12),
      message,
    })
  ).result;
