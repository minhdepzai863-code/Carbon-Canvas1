import { GoogleGenAI } from '@google/genai';
import type {
  MoleculeData,
  QuizData,
  ReactionData,
  ReactionSimulation,
  StudyGuide,
} from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const model = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
const capacityFallbackModel = 'gemini-3.5-flash-lite';

const client = () => {
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to .env.local and restart the app.');
  }
  return new GoogleGenAI({ apiKey });
};

const bondSchema = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    target: { type: 'string' },
    order: { type: 'integer', minimum: 1, maximum: 3 },
    stereo: { type: 'string', enum: ['none', 'wedge', 'dash'] },
  },
  required: ['source', 'target', 'order'],
};

const moleculeSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    atoms: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, element: { type: 'string' } },
        required: ['id', 'element'],
      },
    },
    bonds: { type: 'array', items: bondSchema },
    resonanceStructures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          bonds: { type: 'array', items: bondSchema },
        },
        required: ['description', 'bonds'],
      },
    },
    symmetry: {
      type: 'object',
      properties: {
        pointGroup: { type: 'string' },
        elements: { type: 'array', items: { type: 'string' } },
      },
      required: ['pointGroup', 'elements'],
    },
  },
  required: ['name', 'description', 'atoms', 'bonds'],
};

const quizSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    questions: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          type: { type: 'string', enum: ['mcq', 'fitb', 'short_answer'] },
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctAnswer: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['id', 'type', 'question', 'correctAnswer', 'explanation'],
      },
    },
  },
  required: ['topic', 'questions'],
};

const reactionSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'integer' },
          description: { type: 'string' },
          keyConcept: { type: 'string' },
        },
        required: ['step', 'description', 'keyConcept'],
      },
    },
    references: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'steps', 'references'],
};

const studyGuideSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string' },
    summary: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    commonMistakes: { type: 'array', items: { type: 'string' } },
    resources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['title', 'url', 'source'],
      },
    },
    flashcards: {
      type: 'array',
      minItems: 6,
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          term: { type: 'string' },
          definition: { type: 'string' },
          hint: { type: 'string' },
        },
        required: ['term', 'definition', 'hint'],
      },
    },
  },
  required: ['topic', 'summary', 'keyPoints', 'commonMistakes', 'resources', 'flashcards'],
};

const simulationSchema = {
  type: 'object',
  properties: {
    equation: { type: 'string' },
    reactionType: { type: 'string' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    explanation: { type: 'string' },
    safetyNote: { type: 'string' },
    product: moleculeSchema,
  },
  required: ['equation', 'reactionType', 'confidence', 'explanation', 'safetyNote', 'product'],
};

const parseJson = <T>(text: string | undefined): T => {
  if (!text?.trim()) throw new Error('Gemini returned an empty response.');
  return JSON.parse(text) as T;
};

const generateJson = async <T>(prompt: string, schema: object): Promise<T> => {
  const request = (modelName: string) => client().models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: 'You are a careful chemistry educator. Distinguish predictions from verified facts, obey valence rules, and never invent citations.',
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    });

  try {
    return parseJson<T>((await request(model)).text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const capacityError = message.includes('503') || message.includes('high demand') || message.includes('UNAVAILABLE');
    if (!capacityError || model === capacityFallbackModel) throw error;
    return parseJson<T>((await request(capacityFallbackModel)).text);
  }
};

const cleanMolecule = (data: MoleculeData) => ({
  atoms: data.atoms.map(({ id, element }) => ({ id, element })),
  bonds: data.bonds.map((bond) => ({
    source: typeof bond.source === 'object' ? (bond.source as { id: string }).id : bond.source,
    target: typeof bond.target === 'object' ? (bond.target as { id: string }).id : bond.target,
    order: bond.order,
    stereo: bond.stereo ?? 'none',
  })),
});

export const generateMoleculeData = (moleculeName: string) =>
  generateJson<MoleculeData>(
    `Generate a chemically plausible 2D graph for ${JSON.stringify(moleculeName)}. Include explicit heavy atoms, bonds, a concise description, resonance contributors when relevant, and symmetry information.`,
    moleculeSchema,
  );

export const analyzeMolecule = (data: MoleculeData) =>
  generateJson<MoleculeData>(
    `Analyze this user-edited structure: ${JSON.stringify(cleanMolecule(data))}. Check valence, charge plausibility, stability, and whether the species is known. If impossible, set the name to "Impossible structure" and explain exactly why.`,
    moleculeSchema,
  );

export interface ReactionConditions {
  temp: number;
  pressure: number;
  catalyst: string;
  solvent: string;
}

export const applyReaction = (data: MoleculeData, reagent: string, conditions: ReactionConditions) =>
  generateJson<MoleculeData>(
    `Predict the major product for reactant ${JSON.stringify(cleanMolecule(data))}, reagent ${JSON.stringify(reagent)}, and conditions ${JSON.stringify(conditions)}. Account for kinetics, thermodynamics, solvent, catalyst, and selectivity. If no reaction is expected, preserve the reactant graph and name it "No reaction".`,
    moleculeSchema,
  );

export const predictReaction = (
  reactantA: string,
  reactantB: string,
  conditions: ReactionConditions,
) => generateJson<ReactionSimulation>(
  `Predict the major product when reactant A ${JSON.stringify(reactantA)} is combined with reactant B ${JSON.stringify(reactantB)} under ${JSON.stringify(conditions)}. Inputs may be names, formulas, or SMILES. Return one major product graph, a balanced or clearly qualitative equation, the reaction class, confidence, a concise mechanistic rationale, and a practical safety note. If the inputs do not plausibly react, return "No reaction" as the product name and explain why. This is an educational prediction, not laboratory authorization.`,
  simulationSchema,
);

export const generateQuiz = (topic: string) =>
  generateJson<QuizData>(
    `Create exactly five questions about ${JSON.stringify(topic)}: two multiple choice questions with four options, two fill-in-the-blank questions, and one short-answer question. Make correctAnswer exact and explanations instructional.`,
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
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  message: string,
) => {
  const chat = client().chats.create({
    model,
    history,
    config: {
      systemInstruction: 'You are a concise, encouraging organic chemistry tutor. Use correct nomenclature, label uncertainty, and remind users that reaction predictions require experimental verification.',
    },
  });
  const result = await chat.sendMessage({ message });
  return result.text || "I couldn't produce an answer just now.";
};
