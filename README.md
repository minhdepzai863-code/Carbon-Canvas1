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

## Scientific workspace and course content

The interface uses a shared mineral-grey / petrol / copper design system and self-hosted Source Sans 3. Light and night modes, mobile navigation, source-linked notes, and local progress work across all views. `PRODUCT.md` records scope and `DESIGN.md` records implemented tokens.

- Cambridge 9701: all 37 theory-topic headings for the 2025–2027 syllabus, with separate AS/A2 lab-assessment entries. Topic-specific notes distinguish AS nitriles and IR/MS from A2 amines, acyl chemistry, and NMR.
- IB: current Structure/Reactivity framework, first assessment 2025; retired optional units are excluded. SL/HL labels describe module scope, not exhaustive learning-outcome coverage.
- Undergraduate: an introductory general/organic/inorganic pathway, not an accredited university syllabus.

Notes and flashcards are original concise starting points, not a complete textbook or exam-board endorsement. Each module links its course authority and textbook references. ZNotes and Save My Exams are external revision resources; their notes, images, and question banks are not reproduced. Dates and references were reviewed on 14 October 2026.

## Chemistry checks and limits

RDKit.js 2026.9.1 parses SMILES, checks supported valence and aromaticity, preserves specified stereochemistry and formal charge, and generates chemical 2D depictions. Isomeric SMILES is the authoritative structure for AI results; displayed atom lists and formulae are derived from it. Reference examples work without an AI request. User edits use SMILES and clear reference/geometry claims.

The former force-layout angle tool has been removed. Screen coordinates are not physical bond angles. Reference geometry values are cited separately: linear 180°, trigonal planar approximately 120°, methane 109.5°, water 104.5°, and ammonia approximately 107°. No arbitrary AI-generated molecule is assigned a measured geometry or point group.

Reaction predictions check integer-coefficient formula equations for atom and charge balance and require the product graph’s formula to appear among the equation products. Unbalanced results are rejected; unsupported notation is labelled qualitative. Passing these checks does not prove that a reaction occurs, identify a unique isomer, or validate an AI mechanism. Model confidence is not a calibrated experimental probability. Tutor and practice answers remain explicitly AI-generated.

PubChem’s rate-limited Science Skills wrapper was attempted during this update but returned a browser challenge. No live PubChem identity-validation claim is made. Reference structures are authored examples linked to textbook explanations.

Run the reproducible chemistry/content regression suite with `npm run verify:chemistry`, then the production build with `npm run build`.

## Sources and acknowledgements

- [Cambridge official chemistry 9701 syllabus](https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf)
- [IB official chemistry curriculum](https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/chemistry/)
- [OpenStax Chemistry 2e](https://openstax.org/details/books/chemistry-2e) and [McMurry Organic Chemistry](https://openstax.org/details/books/organic-chemistry), for factual reference checks and external reading links. Scientific facts are explained in original short notes; textbook passages and figures are not copied.
- [RDKit.js](https://www.rdkitjs.com/), BSD-3-Clause, and [Source Sans 3](https://github.com/adobe-fonts/source-sans), SIL Open Font License.
- Design guidance: [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), [Impeccable](https://github.com/pbakaus/impeccable), and installed resources from [awesome-codex-skills](https://github.com/LeorickCoder/awesome-codex-skills).
- Scientific Agent Skills informed graph validation and evidence/claim separation: Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026), [Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents](https://doi.org/10.48550/arXiv.2609.00065).
