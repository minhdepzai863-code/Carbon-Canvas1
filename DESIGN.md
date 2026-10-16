---
name: CarbonCanvas
description: A scientific workspace for chemistry study and molecular reasoning.
colors:
  ground: "#edf1f0"
  paper: "#fff"
  raised: "#f5f7f6"
  ink: "#233738"
  muted: "#586b6c"
  line: "#cdd8d6"
  petrol: "#173d42"
  accent: "#956144"
  accent-soft: "#eee2d7"
  selected: "#deebe7"
  green: "#28634e"
  white: "#fff"
  drawing-ink: "#233738"
  petrol-hover: "#28545a"
  nav-text: "#bed2cc"
  nav-hover: "#244c50"
  nav-selected: "#d9e8e1"
  nav-selected-icon: "#43664f"
  rail-text: "#e8f1ed"
  rail-muted: "#b8cfca"
  brand-copper: "#d7b697"
  preview-ground: "#e0e9e4"
  preview-selected: "#cfdfd4"
  preview-green: "#345948"
  progress-green: "#557b68"
  error-ground: "#f5e4de"
  error-ink: "#743925"
  error-line: "#ad715b"
  night-ground: "#152529"
  night-paper: "#203338"
  night-raised: "#253c42"
  night-ink: "#eef4f2"
  night-muted: "#b1c5c5"
  night-line: "#425b60"
  night-selected: "#294d4d"
  night-accent: "#d6ad8e"
  night-accent-soft: "#3d352f"
  night-green: "#a4d6bf"
typography:
  display:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "clamp(28px, 2.6vw, 36px)"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.026em"
  headline:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.018em"
  title:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  lesson-reading:
    fontFamily: '"STIX Two Text", "STIX Two Math", serif'
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.8
  lesson-reading-mobile:
    fontFamily: '"STIX Two Text", "STIX Two Math", serif'
    fontSize: "1.03rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 600
  button:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.35
  tag:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 600
  fine-print:
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  tag: "4px"
  icon: "5px"
  control: "6px"
  field: "7px"
  inset: "8px"
  browser: "9px"
  note: "10px"
  surface: "12px"
spacing:
  compact: "4px"
  icon: "8px"
  control-gap: "10px"
  small: "12px"
  medium: "16px"
  inset: "20px"
  gutter: "24px"
  panel: "28px"
  section: "30px"
  column: "32px"
  page-top: "36px"
  group: "40px"
  footer: "48px"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  button-primary-hover:
    backgroundColor: "{colors.petrol-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  button-secondary-hover:
    backgroundColor: "{colors.selected}"
  button-subtle:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.green}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  button-icon:
    rounded: "{rounded.icon}"
    padding: "8px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
    width: "100%"
  nav-item:
    textColor: "{colors.nav-text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    width: "100%"
  nav-item-hover:
    backgroundColor: "{colors.nav-hover}"
    textColor: "{colors.white}"
  nav-item-selected:
    backgroundColor: "{colors.nav-selected}"
    textColor: "{colors.petrol}"
  tag:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.green}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
  tag-copper:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
  reading-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "30px 34px"
  lesson-reading:
    typography: "{typography.lesson-reading}"
  structure-viewer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
  structure-stage:
    backgroundColor: "{colors.white}"
    textColor: "{colors.drawing-ink}"
    height: "385px"
---

# Design System: CarbonCanvas

## Overview

**Creative North Star: "Scientific Workspace"**

CarbonCanvas uses the user's selected scientific workspace: mineral grey ground, paper reading surfaces, a petrol navigation rail, and copper details. The atmosphere is calm and precise. Source Sans 3 carries headings and compact controls; STIX Two Text gives long-form lessons a distinct reading voice, with mathematical typesetting for authored chemistry. Molecular figures and labeled scientific schematics provide the visual subject.

The implementation balances generous panel padding with compact reference rows. Soft downward shadows distinguish the active reading and molecular work areas; fine borders organize modules, sources, and facts. The same material relationships continue in night mode, with a deliberately light molecular drawing canvas.

**Key Characteristics:**

- Mineral ground, paper surfaces, petrol anchors, and copper details.
- Source Sans 3 headings and controls paired with STIX Two Text lessons and typeset chemistry.
- Soft elevation for work areas and fine borders for reference rows.
- Compact controls with gently curved corners.
- Molecular figures accompanied by provenance, graph checks, and separate geometry facts.

## Colors

The palette combines cool mineral neutrals with deep petrol and restrained copper; the frontmatter records the implemented values.

### Primary

- **Petrol:** the persistent rail, filled primary actions, and transient status toast. Its primary-button hover is a lighter petrol. These fixed action colors persist in night mode.

### Secondary

- **Copper:** focus outlines, the selected reading-tab underline, ordered mechanism markers, and copper tags. The soft copper surface supports study cautions and explanatory notices.

### Tertiary

- **Reference Green:** text links, graph-check text, completion indicators, selected or revealed learning states, and green tags. Progress bars use their own softer green.

### Neutral

- **Mineral Ground:** the page background surrounding the work areas.
- **Paper:** reading panels, forms, toolbars, and the top bar.
- **Raised Mineral:** inset notes, module browsing, recall cards, and quiet suggestions.
- **Scientific Ink / Muted Ink:** principal content and secondary explanatory text.
- **Fine Mineral Line:** separators and field strokes.
- **Selected Mineral:** selected rows, secondary-action hover, and revealed recall cards.
- **Rail neutrals:** pale rail text, quieter captions, and a pale selected row with petrol text.
- **Reference preview neutrals:** the fixed pale green preview surface, darker green text, and its local tag background.
- **Error palette:** a warm pale error ground, dark error text, and the wrong-answer border; these remain fixed in both themes.

Night mode overrides ground, paper, raised, ink, muted, line, selected, accent, accent-soft, green, and the shadow via `:root[data-theme="night"]`. The frontmatter's `night-*` entries document those overrides. Petrol, rail states, filled buttons, toast, error palette, overview reference preview, and white structure canvas retain their fixed colors. `paper` is a theme-dependent surface; `white` is the fixed drawing/action white even though they match in daylight.

**The Evidence Label Rule.** Preserve the written provenance and assessment labels alongside their color treatment. Green appears on several kinds of content and does not by itself signify factual verification.

## Typography

**Display Font / Body Font:** Source Sans 3, with Segoe UI and sans-serif fallbacks. The project imports weights (400, 500, 600, 700); the common hierarchy uses regular and semibold.

**Lesson Reading Font:** self-hosted STIX Two Text, with STIX Two Math and serif fallbacks. Text weights (400, 600) and the math face (400) are imported alongside the control family.

The pairing distinguishes sustained reading from navigation and actions. Page headings use a slightly tightened measure; descriptive paragraphs retain an open line height. Labels, lesson headings, figure labels, and captions remain in Source Sans 3 and sentence case. SMILES uses the native code face inside the structure disclosure; authored formulas and equations use KaTeX with mhchem.

### Hierarchy

- **Display:** responsive page heading, semibold, with balanced wrapping and tight tracking.
- **Headline:** general section headings, semibold. The current-study heading uses its own observed larger scale (`clamp(26px, 3vw, 37px)`, line height `1.17`, maximum `20ch`), becoming `32px` below the mobile breakpoint.
- **Title:** subsection headings, semibold. Article headings are `31px` on desktop and `27px` on mobile.
- **Body:** explanatory paragraphs commonly use the frontmatter body role. Lesson concepts use `15px`; source-oriented article copy is limited to `68ch`. Chat text may reach `75ch`.
- **Lesson Reading:** the long-form lesson wrapper uses the separate reading role with maximum measure (`75ch`); it switches to the mobile reading role at `700px`. Paragraphs retain the global body line height (`1.6`), while lesson lists inherit the reading wrapper's line height. Lesson subsection headings keep the sans-serif title scale with line height (`1.4`).
- **Label / Button:** semibold control text; navigation uses `15px`, reducing to `14px` below the compact-desktop breakpoint.
- **Tag / Fine Print:** compact provenance, sources, captions, and caveats. Scientific numeric facts use tabular numerals; geometry angles use `27px`, line height `1.3`.

**The Scientific Reading Rule.** Use STIX Two Text for long-form lessons and Source Sans 3 for headings, controls, figure labels, and captions. Render explicitly delimited authored chemistry with KaTeX and mhchem, retaining HTML and MathML; original PDF pages keep their own document typography.

## Layout

The desktop shell pairs a fixed rail (`224px`) with a paper top bar (`70px`). Main content is centered within the remaining workspace, with a maximum width (`1440px`), responsive horizontal padding (`clamp(22px, 3.6vw, 52px)`), and normal top padding (`36px`). Large desktop starts at `1400px`: top padding grows to `44px`, and the current-study surface gains more inset space.

The overview uses an asymmetric two-column grid (`1.16fr 1fr`, gap `24px`; `1.18fr 1fr` on large desktop). Module rows remain a bordered list. Reading uses a module browser (`254px`) beside the article, with a `32px` gap. The lab uses `minmax(0, 1.6fr) minmax(260px, 1fr)` with a `24px` gap; the reaction form/result split uses `minmax(260px, 0.8fr) minmax(0, 1.5fr)` with a `28px` gap. These are implemented surface compositions, not requirements for every future screen.

At or below `1180px`, the rail becomes `202px`; the reading browser becomes `220px`, and the lab's proportion and gutters tighten. At or below `960px`, reading, lab, reaction, and practice split layouts become one column. The module chooser becomes a horizontal strip of `170px` items. The reaction form places reactants side by side and conditions across four columns.

At or below `760px`, the rail is an off-canvas drawer (`236px`) with a scrim; the workspace loses its rail margin. The top bar becomes `62px`, and main padding becomes `27px 20px 20px`. The overview and lower workspace stack. The reference preview keeps a compact two-column figure/caption arrangement. Input-action groups wrap and give the field and main action full width. Reaction conditions return to two columns. The browser body minimum is `320px`.

Long-form lessons keep a bounded reading measure within the existing article. At or below `700px`, their type size reduces and reading tabs wrap. Worked examples use raised mineral with desktop inset (`1rem 1.5rem`), reducing to (`0.8rem 1rem`) at the same breakpoint. Figures remain inline with the lesson between fine mineral rules.

## Elevation & Depth

Depth is a combination of tonal layering, thin rules, and one soft downward shadow. Reading articles, the current-study area, the molecular workbench, quizzes, chat, and toasts use the shared shadow. Notes, search forms, reaction forms, mechanism articles, and the archive use material contrast or borders without that shadow. The molecular preview removes the embedded workbench shadow so the figure belongs to its surrounding surface.

### Shadow Vocabulary

- **Workspace shadow:** `0 10px 28px -12px rgb(20 49 51 / 0.19)` in daylight.
- **Night workspace shadow:** `0 10px 28px -12px rgb(0 0 0 / 0.35)` in night mode.

**The Work Area Rule.** Use the shared shadow for the reading or tool surface that holds the task; use tonal surfaces and separators for its reference rows and supporting information.

## Shapes

Corners are gently curved rather than fully rounded. Tags use the smallest radius; icon buttons, regular controls, and fields use successively larger corners. Browsers and note surfaces sit between controls and the broad surface radius. Thin solid borders organize fields, reading tabs, and reference lists. Progress is a narrow rounded bar (`5px` high). Workbench and chat surfaces clip their content to their outer corners.

Icons are restrained outline SVGs, commonly `16–19px`, with larger symbols in empty states. Molecular bond and atom marks come from the chemical depiction itself, preserving scientific notation rather than borrowing interface decoration.

## Components

### Buttons

Compact, readable controls with semibold sentence-case labels and optional outline icons. Primary and secondary buttons share a control radius, `43px` minimum height, `10px 17px` padding, and `9px` icon gap. Primary is fixed petrol and white; hover changes its background. Secondary uses theme-aware paper and ink with a line border; hover uses the selected mineral surface. Subtle buttons use selected mineral and reference green, with `36px` minimum height. Icon buttons use a smaller radius, `36px` minimum dimensions, and `8px` padding; toolbar icons tighten slightly on mobile.

State transitions use background color (`0.16s`). Keyboard focus uses a copper outline (`2px`) offset by `4px`. Disabled buttons use opacity (`0.5`) and a not-allowed cursor. The application pairs pending operations with disabled actions and spinner text; the spinner is `1s linear infinite`. Quiz answers deliberately retain full opacity after selection to preserve feedback.

### Chips

Tags are compact static labels, not interchangeable action buttons. Standard tags use selected mineral and reference green; copper tags use soft copper and copper. Both use `4px 8px` padding and nowrap text. Examples such as provenance, AI explanation, and course level keep an explicit written label. The overview's reference tag has its own fixed preview palette.

### Cards / Containers

Main reading and tool surfaces use the surface radius. The article has desktop padding (`30px 34px`), becoming `24px` at compact desktop and `24px 22px` on mobile. Recall uses raised mineral, a line stroke, the note radius, and `28px` padding; revealing the answer changes the fill to selected mineral. Supporting notes and browser lists use their corresponding intermediate radii. Reuse the depth behavior described above instead of adding shadows to each row.

### Inputs / Fields

Fields use paper, ink, a thin mineral stroke, the field radius, and `11px 13px` padding. Placeholders use muted ink; the caret is copper. Focus shifts the stroke to petrol, while keyboard focus retains the shared copper outline. Visible labels use the label role; nested inputs have `7px` top spacing and regular weight. The inline search variant moves the border to an enclosing icon-and-input container. Errors appear in a labeled alert surface; this implementation does not add a separate invalid-field visual variant. Disabled reaction inputs use native disabled behavior.

### Navigation

The fixed petrol rail uses pale sentence-case rows, `43px` minimum height, a control radius, and `10px 12px` padding. Hover lightens the petrol and switches text to white. The active row uses a pale mineral fill, petrol semibold text, a green icon, and `aria-current="page"`. Its palette persists in night mode. Mobile converts the same rail into a sliding drawer with visible open/close controls and a scrim. Closed mobile navigation is hidden. Reading tabs use a separate fine-line treatment with a copper active underline.

### Lesson Reading and Scientific Figures

Long-form prose and worked examples use the reading family inside the existing paper article. Worked examples use a raised mineral inset and a fine rule above the answer. Inline chemical notation is scaled (`1.05em`) to its surrounding text. Only explicitly delimited authored TeX is rendered; ordinary text stays escaped, and KaTeX uses `trust: false` with HTML and MathML output.

Scientific figures use fine top and bottom rules with vertical padding (`1.3rem`) and muted sans-serif captions (`0.88rem`, line height `1.5`). Energy profiles are responsive inline SVGs with ink axes, labeled copper and dashed green paths, and a caption that identifies the profile as schematic. Orbital occupancy uses a five-column HTML grid, bordered boxes, and an accessible configuration label; its caption explains that boxes represent orbitals rather than electron paths. Concept flows explain relationships with text and directional marks. These figures encode teaching relationships, not decorative art or fabricated measured geometry.

Original exam pages are rendered to a fixed white canvas by the local PDF reader. Preserve their document fonts, question diagrams, and equations; the lesson reading font applies to authored teaching content rather than the PDF page.

### Molecular Structure Viewer

The signature workbench is a rounded paper surface with shared elevation. A wrapping toolbar has `12px 16px` padding and a bottom rule; it exposes the hydrogen toggle, zoom, reset, SVG export, and optional structure edit. The fixed white stage centers a responsive RDKit SVG (`385px` high; `330px` on mobile, `275px` within reaction results). A thin ruled footer explains implicit atoms and states that the drawing is a 2D projection.

The SVG scales from `0.5` to `2` around its center with a `0.15s ease-out` transform transition. Preparing, failure, and empty states replace the drawing inside the same stage. Pending depiction shows a labeled spinner; failure uses an alert. Export is disabled before SVG output exists. Editing opens a raised inset with a SMILES field; applying edits clears reference claims and cited geometry.

Facts remain beside or below the figure: named provenance, formula, heavy-atom count, and graph validation. A separated geometry block carries shape, prominent angle, explanatory note, and a source link when geometry exists. Otherwise the fine print explicitly says that measured 3D geometry is unassigned. A valid graph is not evidence of reaction feasibility. The overview preview omits the toolbar and footer and uses a transparent stage within its pale reference surface.

Reduced-motion preference shortens all transitions and animations to `0.01ms` and uses automatic scrolling.

## Do's and Don'ts

### Do:

- Do use the implemented mineral, paper, petrol, and copper roles consistently.
- Do preserve Source Sans 3 headings and controls, STIX Two Text lessons, and the existing semibold hierarchy.
- Do typeset authored chemistry with KaTeX and mhchem, retaining accessible MathML alongside HTML.
- Do label scientific schematics and preserve the original typography and figures within PDF pages.
- Do keep written provenance, assessment, and source labels adjacent to scientific content.
- Do preserve the fixed light structure canvas when the surrounding workspace uses night mode.
- Do carry the copper keyboard-focus outline and visible loading, error, and disabled states into related controls.
- Do use the existing responsive stacking and wrapping behavior to keep scientific text and fields readable.

### Don't:

- Don't replace reference rows with individually elevated cards.
- Don't treat a green tag or a successful graph check as evidence that AI output is verified.
- Don't label the 2D molecular drawing as measured 3D geometry.
- Don't change the fixed drawing, rail, primary-action, preview, or error colors by treating every color as a theme override.
- Don't add full-pill corners, display typefaces, or decorative visual effects to the approved scientific workspace.
