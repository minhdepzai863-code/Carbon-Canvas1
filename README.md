# CarbonCanvas

An interactive organic chemistry learning app with molecular visualization, two-reactant product prediction, mechanism tutoring, quizzes, active-recall flashcards, and links to source-backed scientific workflows.

## Authentication backend and expanded practice

The independent Node/PostgreSQL backend is in `backend/`. See [setup, security and integration instructions](backend/README.md). Better Auth provides email/password registration, verification, reset, fixed-expiry database sessions and protected study-data APIs. Those APIs are dormant in the current **guest testing mode** (`GUEST_AI_ENABLED=true`), as requested: no app sign-in, email setup or cloud study-data sync is required. The authentication schemas remain installed in the existing Supabase carboncanvas project for future integration; no sign-in/register UI was added.

Practice offers CIE past papers separately from original module recall. Its checked PapaCambridge catalogue contains 352 question papers from 2018–2026: 63 multiple-choice papers (2,520 questions with complete 40-answer markscheme keys) and 289 free-response/practical papers. Students choose format, year, session, paper type and variant. The source-hosted PDFs preserve diagrams, equations and numbering; this is paper-based practice, not extracted/retyped individual questions or a topic-mapped official bank. October/November 2026 was not listed on 14 October 2026.

The checked PDF opens directly in the Safari-compatible PDF.js reader for navigation, zoom, pen/eraser, undo/redo and annotated export. The backend fetches only catalogue-listed sources, verifies their hashes, and returns an individual download through a separately rate-limited same-origin endpoint. No paper files are bundled in Git or permanently mirrored in cloud storage. Up to three checked PDFs are cached transiently per warm backend instance. Up to 20 recently opened PDFs are retained in device-only IndexedDB; ink and answers save separately. Manual file selection and original source links remain fallbacks. Only an explicitly requested ink image is uploaded for AI transcription. Source availability may change.

On iPad, the reader starts in Pen mode. The HTML drawing surface disables touch scrolling before a gesture starts; a non-passive Safari touch guard and pointer capture protect writing. Pencil input can supersede a palm touch even when it is not the primary pointer. Choose Pan to scroll/pinch; the annotation toolbar stays available while reading. Tablet filters collapse behind Change paper so the exam workspace receives the available width. Physical Apple Pencil Pro/iPadOS 26 testing is still required; desktop pointer tests and viewport emulation do not prove hardware behavior.

All 63 active Cambridge/IB modules have original guided lessons, worked examples, schematic figures, separate summary notes and 8–13 explanatory cards. Flashcards support search, round size, review filtering, custom cards and persistent browser recall state. Undergraduate is removed; retired selections fall back to Cambridge without erasing old study records. The existing theme is preserved; new practice controls use the same design system.

Paper answers and AI feedback are stored per paper/subpart in this browser. MCQs use deterministic answer-key grading (unanswered items score zero). Free-response answers are self-assessed or receive advisory AI marking against the checked matching question PDF and markscheme. Handwriting is transcribed into editable text and must be confirmed before grading; ambiguous responses receive no score. Guest grades are editable and not authoritative. Progress, flashcard reviews/custom cards, saved structures, tutor conversation, reaction inputs, paper answers and ink persist on the device. Clearing browser storage removes this memory; different browsers, devices and deployment origins have separate storage. There is no cloud backup or cross-device sync in guest mode.

## Run locally

1. Install Node.js 24.12 or newer.
2. Run `npm install`.
3. Configure guest mode using `backend/DEPLOYMENT.md`, then run `npm start` in `backend/`. AI credentials belong only in `backend/.env.local`, never in `VITE_` variables.
4. Run `npm run dev`.

All AI requests use same-origin backend endpoints and the Vercel AI SDK Google provider. Guest testing uses signed HttpOnly device cookies plus shared device, IP and global quotas. Code and the current preview default to `gemini-3.6-flash`, as requested after quota errors. The 3.8 Flash and 3.5 Flash-Lite models remain explicitly configurable through server-only `GEMINI_MODEL`; no automatic paid upgrade or silent model fallback is performed. Google still enforces project/model quotas.

## Security

`VITE_` variables are bundled into browser code. The implemented proxy keeps the Gemini key server-only. Both private API checks and model quotas are enforced by the backend. Never commit `.env.local`.

## Science Skills

Study Hub links to relevant workflows from [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills), including PubChem, ChEMBL, PDB, and PyMOL. Those links expose the source instructions; this browser app does not execute repository scripts locally.

## Scientific workspace and course content

The interface uses a shared mineral-grey / petrol / copper design system and self-hosted Source Sans 3 controls, STIX Two Text lesson typography and KaTeX/mhchem scientific notation. Light and night modes, mobile navigation, source-linked notes, and local progress work across all views. `PRODUCT.md` records scope and `DESIGN.md` records implemented tokens.

- Cambridge 9701: all 37 theory-topic headings for the 2025–2027 syllabus, with separate AS/A2 lab-assessment entries. Topic-specific notes distinguish AS nitriles and IR/MS from A2 amines, acyl chemistry, and NMR.
- IB: current Structure/Reactivity framework, first assessment 2025; retired optional units are excluded. SL/HL labels describe module scope, not exhaustive learning-outcome coverage.

Notes and flashcards are original concise starting points, not a complete textbook or exam-board endorsement. Each module links its course authority and textbook references. ZNotes and Save My Exams are external revision resources; their notes, images, and question banks are not reproduced. Dates and references were reviewed on 14 October 2026.

## Chemistry checks and limits

RDKit.js 2026.9.1 parses SMILES, checks supported valence and aromaticity, preserves specified stereochemistry and formal charge, and generates chemical 2D depictions. Isomeric SMILES is the authoritative structure for AI results; displayed atom lists and formulae are derived from it. Reference examples work without an AI request. User edits use SMILES and clear reference/geometry claims.

The former force-layout angle tool has been removed. Screen coordinates are not physical bond angles. Reference geometry values are cited separately: linear 180°, trigonal planar approximately 120°, methane 109.5°, water 104.5°, and ammonia approximately 107°. No arbitrary AI-generated molecule is assigned a measured geometry or point group.

Reaction predictions check integer-coefficient formula equations for atom and charge balance and require the product graph’s formula to appear among the equation products. Unbalanced results are rejected; unsupported notation is labelled qualitative. Passing these checks does not prove that a reaction occurs, identify a unique isomer, or validate an AI mechanism. Model confidence is not a calibrated experimental probability. Tutor responses are AI-generated; practice is labelled original recall or original source-hosted past paper.

PubChem’s rate-limited Science Skills wrapper was attempted during this update but returned a browser challenge. No live PubChem identity-validation claim is made. Reference structures are authored examples linked to textbook explanations.

Run the reproducible chemistry/content regression suite with `npm run verify:chemistry`, then the production build with `npm run build`.

Molecule input accepts a name (for example `ethanol`) or prefixed SMILES (`smiles:CCO`). The word `smiles` alone is notation guidance, not a molecule lookup. Empty/prefix-only inputs are rejected locally without spending AI quota. Supplied structures are parsed and validated by RDKit without Gemini; errors leave the current structure intact.

The Gemini adapter validates generated output using the original request kind, not a `kind` field on the model's response. HTTP regression fixtures exercise the SDK validation callback for all five generation kinds. It distinguishes malformed output, provider outages, credentials/model errors, timeouts and quota limits. It retries an upstream 500/502/503/504 once with short jittered backoff inside the same 90-second request deadline; it never automatically retries 429 quota errors, invalid output or client errors. No model fallback or quota increase is performed. A transient Google 503 followed by success was observed for the SN2 mechanism example; this does not establish a permanent provider availability guarantee.

## Sources and acknowledgements

- [Cambridge official chemistry 9701 syllabus](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf)
- [IB official chemistry curriculum](https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/chemistry/)
- [OpenStax Chemistry 2e](https://openstax.org/details/books/chemistry-2e) and [McMurry Organic Chemistry](https://openstax.org/details/books/organic-chemistry), for factual reference checks and external reading links. Scientific facts are explained in original short notes; textbook passages and figures are not copied.
- [RDKit.js](https://www.rdkitjs.com/), BSD-3-Clause, and [Source Sans 3](https://github.com/adobe-fonts/source-sans), SIL Open Font License.
- [PDF.js](https://mozilla.github.io/pdf.js/), Apache-2.0, for local-only paper rendering.
- Design guidance: [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), [Impeccable](https://github.com/pbakaus/impeccable), and installed resources from [awesome-codex-skills](https://github.com/LeorickCoder/awesome-codex-skills).
- Scientific Agent Skills informed graph validation and evidence/claim separation: Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026), [Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents](https://doi.org/10.48550/arXiv.2609.00065).

## Deployment and marking setup

See [the deployment and AI integration checklist](backend/DEPLOYMENT.md). The Vite frontend and independent Node backend use Vercel Services (currently beta). Guest testing uses a Supabase Edge quota service authenticated by the Vercel project's machine JWT; only hashed counters, not answers or model responses, are stored in its database. The browser never receives a database service key or Gemini key. Email/authentication integration is deferred. Smoke tests are not an evaluation of marking accuracy for every paper; compare advisory marks with the original scheme.

