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

export const AI_SCHEMAS = {
  molecule: moleculeSchema,
  quiz: quizSchema,
  reaction: reactionSchema,
  study: studyGuideSchema,
  simulation: simulationSchema,
};
