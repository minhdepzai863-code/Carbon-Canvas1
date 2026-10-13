# CarbonCanvas

An interactive organic chemistry learning app with molecular visualization, two-reactant product prediction, mechanism tutoring, quizzes, active-recall flashcards, and links to source-backed scientific workflows.

## Run locally

1. Install Node.js 20.19 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add a Gemini API key from Google AI Studio.
4. Run `npm run dev`.

The app uses the current `@google/genai` SDK and defaults to `gemini-3.8-flash`. Set `VITE_GEMINI_MODEL` to override it.

## Security

`VITE_` variables are bundled into browser code. For a public deployment, proxy Gemini requests through a server-side endpoint and keep the production API key there. Never commit `.env.local`.

## Science Skills

Study Hub links to relevant workflows from [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills), including PubChem, ChEMBL, PDB, and PyMOL. Those links expose the source instructions; this browser app does not execute repository scripts locally.
