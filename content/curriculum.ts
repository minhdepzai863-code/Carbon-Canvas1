import type { Flashcard, Module, StudyGuide, VideoResource } from "../types";
import { extraCards } from "./studyDetails.ts";

export type CourseId = "ALEVEL" | "IB";
export const REVIEW_DATE = "14 October 2026";
export const SOURCES = {
  cambridge: {
    title: "Cambridge 9701 syllabus, 2025–2027",
    source: "Official syllabus",
    url: "https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf",
  },
  ib: {
    title: "IB Diploma chemistry: Structure and Reactivity",
    source: "Official curriculum",
    url: "https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/chemistry/",
  },
  znotesAS: {
    title: "ZNotes: Cambridge AS chemistry 9701",
    source: "Revision resource",
    url: "https://znotes.org/caie/as-level/chemistry-9701",
  },
  znotesA2: {
    title: "ZNotes: Cambridge A2 chemistry 9701",
    source: "Revision resource",
    url: "https://znotes.org/caie/a2-level/chemistry-9701",
  },
  smeA: {
    title: "Save My Exams: Cambridge chemistry",
    source: "Revision resource",
    url: "https://www.savemyexams.com/a-level/chemistry/cie/25/revision-notes/",
  },
  smeIB: {
    title: "Save My Exams: IB chemistry HL, current course",
    source: "Revision resource",
    url: "https://www.savemyexams.com/dp/chemistry/ib/23/hl/revision-notes/",
  },
  ibchem: {
    title: "IBChem: first-assessment-2025 course map",
    source: "Revision resource",
    url: "https://www.ibchem.com/IB25/sow.php",
  },
  general: {
    title: "OpenStax Chemistry 2e",
    source: "Open textbook",
    url: "https://openstax.org/details/books/chemistry-2e",
  },
  organic: {
    title: "McMurry: Organic Chemistry, OpenStax",
    source: "Open textbook",
    url: "https://openstax.org/details/books/organic-chemistry",
  },
};
const chapter = (path: string): VideoResource => ({
  title: "Read the textbook explanation",
  source: "OpenStax Chemistry 2e",
  url: `https://openstax.org/books/chemistry-2e/pages/${path}`,
});
const organic = (path: string): VideoResource => ({
  title: "Read the organic chemistry explanation",
  source: "McMurry / OpenStax",
  url: `https://openstax.org/books/organic-chemistry/pages/${path}`,
});
type Lesson = {
  summary: string;
  cards: Flashcard[];
  mistakes: string[];
  sources: VideoResource[];
};
const f = (term: string, definition: string): Flashcard => ({
  term,
  definition,
});
const lesson = (
  summary: string,
  cards: Flashcard[],
  mistakes: string[],
  source: VideoResource,
): Lesson => ({ summary, cards, mistakes, sources: [source] });

// Original concise teaching notes. Third-party revision notes are linked, not reproduced.
export const LESSONS: Record<string, Lesson> = {
  atomic: lesson(
    "Use particle counts and orbital occupancy to explain atomic identity, ions, and electron configurations.",
    [
      f(
        "How do isotopes differ?",
        "Isotopes have the same proton number but different neutron numbers.",
      ),
      f(
        "How many electrons fit in an orbital?",
        "At most two, with opposite spins.",
      ),
      f(
        "Why is an ionisation-energy equation gaseous?",
        "Ionisation energy is defined for isolated gaseous atoms or ions; the removed electron appears on the product side.",
      ),
    ],
    [
      "Remove 4s electrons before 3d when forming common transition-metal cations.",
    ],
    chapter("6-4-electronic-structure-of-atoms-electron-configurations"),
  ),
  mole: lesson(
    "Translate between mass, particle number, solution concentration, and reaction coefficients.",
    [
      f("What is one mole?", "Exactly 6.02214076 × 10²³ specified entities."),
      f(
        "How are mass and amount related?",
        "n = m/M; use consistent mass and molar-mass units.",
      ),
      f(
        "How do you identify a limiting reagent?",
        "Compare each reactant amount divided by its balanced-equation coefficient; the smallest ratio limits reaction extent.",
      ),
    ],
    [
      "Balance the equation before using mole ratios. Concentration is not the same as amount.",
    ],
    chapter("3-1-formula-mass-and-the-mole-concept"),
  ),
  bonding: lesson(
    "Separate bond connectivity, electron-domain geometry, and molecular shape. A 2D structure communicates bonding, not measured 3D angles.",
    [
      f(
        "What geometries correspond to sp, sp², and sp³?",
        "Ideal linear (180°), trigonal planar (120°), and tetrahedral (about 109.5°), respectively.",
      ),
      f(
        "Why is water bent?",
        "Oxygen has two bonding domains and two lone pairs; the molecular shape is bent, with an H–O–H angle of about 104.5°.",
      ),
      f(
        "Does a multiple bond count as multiple VSEPR domains?",
        "No. A single, double, or triple bond counts as one electron domain.",
      ),
    ],
    [
      "A tetrahedral electron-domain arrangement need not mean tetrahedral molecular shape.",
    ],
    chapter("7-6-molecular-structure-and-polarity"),
  ),
  lewis: lesson(
    "Count valence electrons, connect atoms, and track formal charge before assessing resonance.",
    [
      f(
        "How do you calculate formal charge?",
        "Valence electrons − nonbonding electrons − half the bonding electrons.",
      ),
      f(
        "What changes between resonance contributors?",
        "Electron placement and bond orders; atomic positions and connectivity stay the same.",
      ),
      f(
        "What charges appear in a typical nitro group?",
        "A common Lewis contributor is R–N⁺(=O)–O⁻; the two oxygens are related by resonance.",
      ),
    ],
    [
      "Resonance is not a molecule switching between separate structures. Neutral second-row nitrogen cannot simply acquire five bonds.",
    ],
    chapter("7-4-formal-charges-and-resonance"),
  ),
  matter: lesson(
    "Relate microscopic interactions to bulk properties, phase behaviour, and gas models.",
    [
      f(
        "What assumptions define an ideal gas?",
        "Particles have negligible volume and no intermolecular attractions; collisions are elastic.",
      ),
      f(
        "When does ideal-gas behaviour fail most?",
        "At high pressure and low temperature, when particle volume and attractions matter more.",
      ),
      f(
        "How is gas amount calculated?",
        "pV = nRT, with absolute temperature in kelvin and compatible units.",
      ),
    ],
    ["A gas-law temperature must be in kelvin, not degrees Celsius."],
    chapter(
      "9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law",
    ),
  ),
  energy: lesson(
    "Account for energy transfer with calorimetry, enthalpy changes, and Hess cycles.",
    [
      f(
        "What is the sign of an exothermic ΔH?",
        "Negative for the reacting system.",
      ),
      f(
        "How do bond enthalpies estimate ΔH?",
        "Sum energies for bonds broken, then subtract energies released by forming product bonds.",
      ),
      f(
        "What does a catalyst change?",
        "The pathway and activation barrier, not the reaction enthalpy or equilibrium constant.",
      ),
    ],
    [
      "Bond breaking requires energy; bond formation releases it. Mean bond enthalpies give estimates.",
    ],
    chapter("5-3-enthalpy"),
  ),
  thermo: lesson(
    "Use entropy and Gibbs energy to discuss thermodynamic favourability and equilibrium.",
    [
      f(
        "What is the Gibbs-energy relation?",
        "ΔG = ΔH − TΔS at fixed temperature, using compatible units and kelvin.",
      ),
      f(
        "Does a negative ΔG guarantee a fast reaction?",
        "No. Thermodynamic favourability and reaction rate are separate questions.",
      ),
      f(
        "How are standard Gibbs energy and equilibrium linked?",
        "ΔG° = −RT ln K for the thermodynamic equilibrium constant.",
      ),
    ],
    ["Convert entropy units before combining ΔH and TΔS."],
    chapter("16-4-free-energy"),
  ),
  redox: lesson(
    "Track electron transfer using oxidation states, balanced half-equations, and charge conservation.",
    [
      f(
        "What is oxidation?",
        "Loss of electrons or an increase in oxidation state.",
      ),
      f(
        "What does an oxidising agent do?",
        "Accepts electrons and is itself reduced.",
      ),
      f(
        "Why check charge in a half-equation?",
        "Both atom counts and net charge must balance.",
      ),
    ],
    [
      "Oxidation state is a bookkeeping convention, not generally the actual atomic charge.",
    ],
    chapter("4-2-classifying-chemical-reactions"),
  ),
  cells: lesson(
    "Connect redox chemistry to cell potentials, electrolysis, and electrical work.",
    [
      f(
        "Where does oxidation happen?",
        "At the anode in both galvanic and electrolytic cells.",
      ),
      f(
        "How is standard cell potential calculated?",
        "E°cell = E°cathode − E°anode when both tabulated values are reduction potentials.",
      ),
      f(
        "How is charge related to electron amount?",
        "Q = n(e⁻)F; use reaction stoichiometry to convert electron amount into deposited material.",
      ),
    ],
    [
      "Electrode polarity depends on cell type; the anode is not always negative.",
    ],
    chapter("17-2-galvanic-cells"),
  ),
  equilibrium: lesson(
    "Dynamic equilibrium balances forward and reverse rates; concentrations need not be equal.",
    [
      f(
        "What is dynamic equilibrium?",
        "Forward and reverse reactions continue at equal rates in a closed system.",
      ),
      f(
        "Which change alters K?",
        "Temperature; concentration and pressure changes alter Q and composition at fixed temperature.",
      ),
      f(
        "How does a catalyst affect equilibrium?",
        "It speeds approach to equilibrium without shifting the equilibrium composition.",
      ),
    ],
    [
      "Do not put pure solids or pure liquids into the usual equilibrium-constant expression.",
    ],
    chapter("13-3-shifting-equilibria-le-chateliers-principle"),
  ),
  acids: lesson(
    "Distinguish strength from concentration and use conjugate pairs to explain proton transfer.",
    [
      f(
        "What is a Brønsted–Lowry acid?",
        "A proton donor; its conjugate base has one fewer proton.",
      ),
      f(
        "How are acid strength and pKa related?",
        "A lower pKa corresponds to a larger Ka and a stronger acid in the same solvent.",
      ),
      f(
        "What is a buffer?",
        "A solution that resists small pH changes, usually containing a weak acid and its conjugate base, or a weak base and its conjugate acid.",
      ),
    ],
    [
      "Strong does not mean concentrated. Henderson–Hasselbalch requires its approximation conditions.",
    ],
    chapter("14-2-ph-and-poh"),
  ),
  kinetics: lesson(
    "Use experimental rates to distinguish reaction order, rate constants, and mechanistic proposals.",
    [
      f(
        "Where does a rate law come from?",
        "Experiment; overall equation coefficients do not generally establish rate-law exponents.",
      ),
      f(
        "Why does heating usually increase rate?",
        "A larger fraction of collisions can overcome the activation barrier.",
      ),
      f(
        "What does reaction order mean?",
        "The exponent on a concentration in the measured rate law; overall order is the sum of exponents.",
      ),
    ],
    [
      "A rate-determining step alone may not give the full observed rate law without accounting for preceding steps.",
    ],
    chapter("12-3-rate-laws"),
  ),
  periodic: lesson(
    "Explain trends using effective nuclear attraction, shielding, and orbital occupancy.",
    [
      f(
        "Why does atomic radius generally decrease across a period?",
        "Increasing nuclear charge attracts electrons more strongly within the same principal shell.",
      ),
      f(
        "Why does first ionisation energy generally fall down a group?",
        "Outer electrons occupy larger, more shielded shells.",
      ),
      f(
        "Are periodic trends exception-free?",
        "No. Subshell energies and electron pairing cause deviations.",
      ),
    ],
    [
      "Explain exceptions with electron configuration rather than repeating a trend.",
    ],
    chapter("6-5-periodic-variations-in-element-properties"),
  ),
  group2: lesson(
    "Study Group 2 chemistry through electron loss, reactions, and solubility patterns.",
    [
      f(
        "What ions do Group 2 metals commonly form?",
        "M²⁺, through loss of two valence electrons.",
      ),
      f(
        "What happens to Group 2 hydroxide solubility down the group?",
        "It generally increases.",
      ),
      f(
        "What happens to Group 2 sulfate solubility down the group?",
        "It generally decreases; barium sulfate is very sparingly soluble.",
      ),
    ],
    ["Do not assume the hydroxide and sulfate solubility trends are the same."],
    SOURCES.cambridge,
  ),
  halogens: lesson(
    "Use redox ideas to explain halogen displacement and qualitative analysis.",
    [
      f(
        "How does halogen oxidising power change down Group 17?",
        "It decreases: chlorine oxidises bromide and iodide more readily than bromine or iodine do.",
      ),
      f(
        "What is the opposite trend for halide reducing power?",
        "Halide ions become stronger reducing agents down the group.",
      ),
      f(
        "What does AgNO₃ test for after acidification with nitric acid?",
        "Halide ions: AgCl is white, AgBr cream, and AgI yellow.",
      ),
    ],
    [
      "Use nitric acid rather than hydrochloric acid to avoid introducing chloride into the test.",
    ],
    SOURCES.cambridge,
  ),
  ns: lesson(
    "Apply equilibrium, redox, and acid–base ideas to nitrogen and sulfur compounds.",
    [
      f(
        "What is the Haber equilibrium?",
        "N₂ + 3H₂ ⇌ 2NH₃; ammonia formation is exothermic.",
      ),
      f(
        "Why use an iron catalyst in the Haber process?",
        "It increases rate without changing the equilibrium yield.",
      ),
      f(
        "What is the oxidation step in the Contact process?",
        "2SO₂ + O₂ ⇌ 2SO₃, catalysed by vanadium(V) oxide.",
      ),
    ],
    [
      "Industrial conditions compromise between equilibrium yield, rate, and cost.",
    ],
    SOURCES.cambridge,
  ),
  transition: lesson(
    "Relate transition-metal chemistry to d orbitals, oxidation states, ligands, and coordination.",
    [
      f(
        "What is a ligand?",
        "An electron-pair donor bonded to a central metal through coordinate bonding.",
      ),
      f(
        "What is coordination number?",
        "The number of donor atoms directly attached to the central metal.",
      ),
      f(
        "Why are many transition-metal complexes coloured?",
        "Visible light can cause electronic transitions between split d levels; not every complex is coloured.",
      ),
    ],
    [
      "Oxidation state, coordination number, and covalent valence are different quantities.",
    ],
    SOURCES.cambridge,
  ),
  organicBasics: lesson(
    "Read functional groups, name carbon skeletons, and distinguish different forms of isomerism.",
    [
      f(
        "What are constitutional isomers?",
        "Compounds with the same molecular formula but different atom connectivity.",
      ),
      f(
        "What makes a homologous series?",
        "Members share a functional group and general structural pattern; successive members differ by CH₂.",
      ),
      f(
        "What does a skeletal line end represent?",
        "An implied carbon atom, with enough hydrogen atoms to complete its usual valence unless stated otherwise.",
      ),
    ],
    ["Molecular formula alone does not identify a unique compound."],
    organic("3-2-alkanes-and-alkane-isomers"),
  ),
  hydrocarbons: lesson(
    "Contrast alkane substitution with alkene addition, and account for reagent and condition dependence.",
    [
      f(
        "What initiates alkane halogenation?",
        "Light or heat can cause homolytic cleavage of a halogen molecule, starting a radical chain.",
      ),
      f(
        "What is an alkene addition reaction?",
        "A π bond is consumed as new σ bonds form at its two carbon atoms.",
      ),
      f(
        "What does decolourising bromine suggest?",
        "An unsaturated compound may react with bromine; the test is not uniquely specific to alkenes.",
      ),
    ],
    [
      "Radical halogenation can produce mixtures; do not present every substrate as giving one exclusive product.",
    ],
    organic("8-2-halogenation-of-alkenes-addition-of-x2"),
  ),
  substitution: lesson(
    "Compare concerted SN2 substitution with carbocation-mediated SN1 pathways.",
    [
      f(
        "What is the SN2 rate law?",
        "Rate = k[substrate][nucleophile] for a simple bimolecular substitution.",
      ),
      f(
        "What stereochemical change accompanies SN2?",
        "Backside attack gives inversion at the reacting stereocentre.",
      ),
      f(
        "What favours an SN1 pathway?",
        "A substrate able to form a stable carbocation, often in a polar protic solvent; competing pathways must still be considered.",
      ),
    ],
    [
      "A tertiary substrate does not undergo a normal SN2 reaction. SN1 does not always give exactly 50:50 stereoisomers.",
    ],
    organic("11-3-characteristics-of-the-sn2-reaction"),
  ),
  alcohols: lesson(
    "Connect alcohol structure to oxidation, dehydration, and nucleophilic chemistry.",
    [
      f(
        "What products can primary alcohol oxidation give?",
        "An aldehyde under controlled oxidation, or a carboxylic acid with further oxidation.",
      ),
      f(
        "What is the common oxidation product of a secondary alcohol?",
        "A ketone.",
      ),
      f(
        "Why do tertiary alcohols resist ordinary oxidation?",
        "The carbon bearing OH lacks a hydrogen; oxidation would require more disruptive bond cleavage.",
      ),
    ],
    [
      "State the oxidant and conditions; distillation and reflux can lead to different products.",
    ],
    organic("17-7-oxidation-of-alcohols"),
  ),
  carbonyl: lesson(
    "The polar carbonyl group supports nucleophilic addition to aldehydes and ketones.",
    [
      f(
        "Where does a nucleophile attack a carbonyl?",
        "At the electrophilic carbonyl carbon.",
      ),
      f(
        "Why does attack break the π bond?",
        "Electron density moves toward oxygen, avoiding excessive valence at carbon.",
      ),
      f(
        "What does a positive Tollens test usually indicate?",
        "An aldehyde can reduce Ag(I) to metallic silver; the test has other reducing-substance exceptions.",
      ),
    ],
    [
      "A ketone is not generally oxidised to a carboxylic acid by the routine aldehyde tests.",
    ],
    organic("19-4-nucleophilic-addition-reactions-of-aldehydes-and-ketones"),
  ),
  carboxyl: lesson(
    "Use resonance and acid–base reasoning to understand carboxylic acids and ester formation.",
    [
      f(
        "Why are carboxylic acids more acidic than most alcohols?",
        "Their carboxylate conjugate bases distribute negative charge over two oxygens by resonance.",
      ),
      f(
        "What does Fischer esterification produce?",
        "A carboxylic acid and alcohol form an ester and water under acid catalysis; the reaction is reversible.",
      ),
      f(
        "Does mixing acid and alcohol at room temperature guarantee rapid ester formation?",
        "No. Catalyst, heating, time, and equilibrium conditions matter.",
      ),
    ],
    [
      "Do not omit water or treat an equilibrium reaction as automatically complete.",
    ],
    organic("21-6-chemistry-of-esters"),
  ),
  amines: lesson(
    "Explain nitrogen compounds through lone-pair availability, protonation, and carbon–nitrogen bonding.",
    [
      f(
        "Why can an amine act as a base?",
        "The nitrogen lone pair can accept a proton.",
      ),
      f(
        "Why is an amide less basic than an amine?",
        "The nitrogen lone pair is delocalised into the carbonyl system.",
      ),
      f(
        "What is a zwitterion?",
        "A species with both positive and negative formal charges but zero net charge.",
      ),
    ],
    [
      "An amino acid is not necessarily neutral at every pH; protonation depends on the conditions.",
    ],
    organic("24-3-basicity-of-amines"),
  ),
  polymers: lesson(
    "Distinguish addition polymerisation from step-growth formation of condensation polymers.",
    [
      f(
        "What changes in alkene addition polymerisation?",
        "Monomer C=C π bonds open to form a saturated backbone.",
      ),
      f(
        "What makes a polyester linkage?",
        "An ester linkage connecting monomer-derived units.",
      ),
      f(
        "What does a polymer repeat unit show?",
        "The repeating connectivity with continuation bonds, not an isolated monomer.",
      ),
    ],
    [
      "Draw continuation bonds through the brackets and keep monomer atoms balanced.",
    ],
    organic("31-4-step-growth-polymers"),
  ),
  synthesis: lesson(
    "Plan transformations backwards from a target and check reagent compatibility and selectivity.",
    [
      f(
        "What is retrosynthesis?",
        "Planning backwards from a target structure to simpler plausible precursors.",
      ),
      f(
        "Why check chemoselectivity?",
        "A reagent may react with several functional groups, changing the intended product.",
      ),
      f(
        "What evidence supports a proposed synthesis?",
        "Correct connectivity, feasible transformations, stated conditions, and literature or experimental precedent.",
      ),
    ],
    [
      "A structurally valid product does not prove that a proposed reaction will happen.",
    ],
    SOURCES.organic,
  ),
  spectroscopy: lesson(
    "Combine independent spectral clues instead of assigning a structure from one feature.",
    [
      f(
        "What does an IR absorption identify?",
        "A bond vibration associated with a functional group, interpreted with the full spectrum.",
      ),
      f(
        "What does ¹H NMR integration indicate?",
        "Relative numbers of contributing hydrogen nuclei, under appropriate acquisition conditions.",
      ),
      f(
        "What does a mass-spectrum molecular ion tell you?",
        "It can indicate molecular mass; fragmentation and ionisation mode affect interpretation.",
      ),
    ],
    [
      "Exchangeable OH/NH signals need not follow a simple n + 1 splitting rule.",
    ],
    organic(
      "12-1-mass-spectrometry-of-small-molecules-magnetic-sector-instruments",
    ),
  ),
  stereochemistry: lesson(
    "Distinguish connectivity from spatial arrangement and assign stereochemistry explicitly.",
    [
      f(
        "What are enantiomers?",
        "Non-superimposable mirror-image stereoisomers.",
      ),
      f("What are diastereomers?", "Stereoisomers that are not mirror images."),
      f(
        "Does R mean a positive optical rotation?",
        "No. R/S configuration and the sign of optical rotation are independent labels.",
      ),
    ],
    ["A molecule with stereocentres can be achiral, as in a meso compound."],
    organic("5-1-enantiomers-and-the-tetrahedral-carbon"),
  ),
  elimination: lesson(
    "Compare E1 and E2 elimination with substitution, using substrate, base, solvent, and geometry.",
    [
      f(
        "What is the usual E2 stereoelectronic requirement?",
        "The leaving group and β hydrogen are commonly anti-periplanar.",
      ),
      f(
        "What occurs in an E1 pathway?",
        "Leaving-group loss creates a carbocation before β-proton removal.",
      ),
      f(
        "Can a bulky base change alkene selectivity?",
        "Yes. Steric effects may favour the less substituted alkene; substrate and conditions remain important.",
      ),
    ],
    [
      "Do not apply Zaitsev selectivity without considering base size and geometric constraints.",
    ],
    organic("11-8-the-e2-reaction-and-the-deuterium-isotope-effect"),
  ),
  aromatic: lesson(
    "Use cyclic conjugation and electron counting to distinguish aromaticity from an arbitrary ring drawing.",
    [
      f(
        "What is the simple Hückel aromaticity criterion?",
        "A planar, cyclic, continuously conjugated system with 4n + 2 π electrons.",
      ),
      f(
        "Are benzene’s six C–C bonds alternating lengths?",
        "No. Equivalent bonds result from delocalisation; alternating double bonds are Lewis representations.",
      ),
      f(
        "What is the characteristic reaction of benzene with an electrophile?",
        "Electrophilic aromatic substitution, which restores the aromatic π system after substitution.",
      ),
    ],
    [
      "A ring alone is not enough for aromaticity; check conjugation, planarity, and electron count.",
    ],
    organic("15-3-aromaticity-and-the-huckel-4n-2-rule"),
  ),
  alkynes: lesson(
    "Alkyne carbons are approximately linear; terminal alkynes also support acid–base chemistry.",
    [
      f(
        "What is the hybridisation of a simple alkyne carbon?",
        "sp, giving an approximately 180° arrangement at that carbon.",
      ),
      f(
        "How many π bonds are in a carbon–carbon triple bond?",
        "Two, in addition to one σ bond.",
      ),
      f(
        "How is an acetylide formed?",
        "A sufficiently strong base removes a terminal alkyne proton.",
      ),
    ],
    [
      "Ordinary hydroxide does not efficiently deprotonate a terminal alkyne in water.",
    ],
    organic("9-1-naming-alkynes"),
  ),
  enolates: lesson(
    "Track carbonyl-adjacent proton transfer and carbon–carbon bond formation.",
    [
      f(
        "What is an enolate?",
        "The conjugate base formed by removing an α hydrogen from a carbonyl compound, with resonance delocalisation.",
      ),
      f(
        "What bond forms in an aldol addition?",
        "A bond between an enolate α carbon and another carbonyl carbon.",
      ),
      f(
        "Is aldol addition identical to aldol condensation?",
        "No. Condensation includes dehydration of the addition product.",
      ),
    ],
    [
      "Check whether the carbonyl compound has an α hydrogen before proposing enolate formation.",
    ],
    organic("23-1-carbonyl-condensations-the-aldol-reaction"),
  ),
  conjugation: lesson(
    "Adjacent p orbitals allow delocalisation and change stability and electronic absorption.",
    [
      f(
        "What makes a conjugated diene?",
        "Two π bonds separated by one σ bond, with overlapping p orbitals along the system.",
      ),
      f(
        "What is the distinction between 1,2 and 1,4 addition?",
        "The new groups attach to adjacent carbons or to the ends of the conjugated four-carbon system.",
      ),
      f(
        "Why can conjugation change UV absorption?",
        "It changes the energy separation between occupied and unoccupied electronic levels.",
      ),
    ],
    ["Not every pair of double bonds is conjugated."],
    organic("14-1-stability-of-conjugated-dienes-molecular-orbital-theory"),
  ),
  practical: lesson(
    "Record observations reproducibly and evaluate uncertainty, variables, and limitations.",
    [
      f(
        "What distinguishes precision from accuracy?",
        "Precision describes agreement among repeated measurements; accuracy describes closeness to a reference value.",
      ),
      f(
        "What does a controlled variable do?",
        "It is held constant to isolate the effect of the independent variable.",
      ),
      f(
        "How is percentage uncertainty calculated?",
        "Absolute uncertainty divided by measured value, multiplied by 100%; propagation depends on the calculation.",
      ),
    ],
    ["More decimal places do not make an instrument more precise."],
    chapter("1-5-measurement-uncertainty-accuracy-and-precision"),
  ),
  materials: lesson(
    "Relate bonding models to material properties and the limitations of those models.",
    [
      f(
        "Why do metals conduct electricity?",
        "Mobile delocalised electrons can carry charge through the structure.",
      ),
      f(
        "Why can an ionic solid fail to conduct?",
        "Its ions are fixed in the lattice; they become mobile when molten or suitably dissolved.",
      ),
      f(
        "Why compare several bonding models?",
        "Real materials may combine characters that one simple model cannot capture fully.",
      ),
    ],
    [
      "Ionic bonding is not itself a covalent line between arbitrary atoms in a molecular sketch.",
    ],
    chapter("10-5-the-solid-state-of-matter"),
  ),
};

// Scope-specific notes keep AS-only analysis and nitriles separate from A2 material.
const SCOPED: Record<string, Lesson> = {
  "ALEVEL-19": lesson(
    "Study the nitrile functional group, carbon-chain extension, and conversion into acids and amines.",
    [
      f(
        "What is a nitrile group?",
        "R–C≡N, with the nitrile carbon included in the carbon skeleton.",
      ),
      f(
        "How does cyanide substitution extend a carbon chain?",
        "The cyanide carbon becomes an additional carbon in the nitrile product.",
      ),
      f(
        "What does nitrile hydrolysis form?",
        "Acidic hydrolysis gives a carboxylic acid; alkaline hydrolysis gives a carboxylate, followed by acidification if the acid is required.",
      ),
      f(
        "What can nitrile reduction produce?",
        "A primary amine after an appropriate reduction and work-up.",
      ),
    ],
    [
      "A nitrile is not an amine. Do not omit the nitrile carbon when counting or naming the chain.",
    ],
    organic("20-7-chemistry-of-nitriles"),
  ),
  "ALEVEL-22": lesson(
    "Use mass spectra and infrared absorption to identify structural evidence at AS level. NMR is introduced in the A2 analytical topic.",
    [
      f(
        "What can the molecular-ion peak indicate?",
        "Molecular mass, interpreted alongside the ionisation method and fragmentation.",
      ),
      f(
        "What is an IR absorption?",
        "Absorption associated with a molecular vibration; its position helps identify bond types.",
      ),
      f(
        "How do chlorine and bromine isotope patterns differ?",
        "A single chlorine gives an approximate M:M+2 ratio of 3:1; a single bromine gives about 1:1.",
      ),
      f(
        "Why combine spectra?",
        "Different methods constrain different parts of a structure; one peak seldom identifies a unique compound.",
      ),
    ],
    [
      "Do not present proton NMR as part of Cambridge topic 22; it belongs in topic 37.",
    ],
    organic("12-7-interpreting-infrared-spectra"),
  ),
  "ALEVEL-32": lesson(
    "Compare phenols and alcohols using lone-pair delocalisation, acidity, and substitution reactions.",
    [
      f(
        "How is phenol different from an ordinary alcohol?",
        "Its OH group is directly attached to an aromatic ring.",
      ),
      f(
        "Why is phenol more acidic than ethanol?",
        "The phenoxide conjugate base is stabilised by delocalisation into the ring.",
      ),
      f(
        "What happens when phenol reacts with bromine water?",
        "Under the usual aqueous test conditions, 2,4,6-tribromophenol forms as a white precipitate.",
      ),
      f(
        "Does phenol readily release CO₂ from sodium carbonate?",
        "No; phenol is generally too weak an acid for the standard carbonate-effervescence test.",
      ),
    ],
    [
      "Phenol acidity, ring activation, and ordinary alcohol oxidation are separate ideas.",
    ],
    organic("17-2-properties-of-alcohols-and-phenols"),
  ),
  "ALEVEL-33": lesson(
    "Compare acyl derivatives through nucleophilic addition–elimination and distinguish this from carbonyl addition.",
    [
      f(
        "What is nucleophilic acyl substitution?",
        "Addition to a carbonyl carbon followed by elimination of a leaving group, restoring the C=O bond.",
      ),
      f(
        "What does ethanoyl chloride form with water?",
        "Ethanoic acid and hydrogen chloride.",
      ),
      f(
        "What does an acyl chloride form with an alcohol?",
        "An ester and hydrogen chloride.",
      ),
      f(
        "Why do aldehydes usually undergo addition rather than acyl substitution?",
        "They lack the normal leaving group attached to the carbonyl carbon that acyl derivatives possess.",
      ),
    ],
    [
      "Balance the coproduct as well as the main organic product; acyl chloride ester formation releases HCl, not water.",
    ],
    organic("21-4-chemistry-of-acid-halides"),
  ),
  "ALEVEL-37": lesson(
    "Combine ¹H/¹³C NMR with chromatography and other analytical evidence to constrain a structure.",
    [
      ...LESSONS.spectroscopy.cards,
      f(
        "What does a ¹³C NMR signal count indicate?",
        "The number of distinguishable carbon environments, subject to symmetry and the experiment.",
      ),
      f(
        "What is a chromatographic Rf value?",
        "Distance travelled by the spot divided by distance travelled by the solvent front, measured from the same baseline.",
      ),
    ],
    [
      "Rf depends on the stationary phase, mobile phase, and conditions. Compare spectra rather than assigning a molecule from one datum.",
    ],
    organic("13-1-nuclear-magnetic-resonance-spectroscopy"),
  ),
  "IB-S1.1": lesson(
    "Distinguish elements, compounds, and mixtures, then explain physical changes with a particle model.",
    [
      f(
        "How is a compound different from a mixture?",
        "A compound has chemically bonded elements in a definite composition; a mixture contains substances combined physically.",
      ),
      f(
        "What makes a mixture homogeneous?",
        "Its composition is uniform at the scale being considered.",
      ),
      f(
        "What changes during a change of state?",
        "Particle arrangement and motion change without changing chemical identity.",
      ),
      f(
        "How is average kinetic energy related to temperature?",
        "Average particle kinetic energy increases with absolute temperature.",
      ),
    ],
    [
      "A physical separation does not break the chemical bonds that define a compound.",
    ],
    chapter("1-2-phases-and-classification-of-matter"),
  ),
  "IB-S2.1": lesson(
    "Use ion charges and electrostatic attraction to explain ionic formulae, lattices, and properties.",
    [
      f(
        "How is an ionic formula constructed?",
        "Choose the simplest ion ratio that gives zero total charge.",
      ),
      f(
        "What holds an ionic lattice together?",
        "Electrostatic attractions between oppositely charged ions throughout the lattice.",
      ),
      f(
        "When can ionic substances conduct?",
        "When ions are mobile, such as in a melt or an appropriate solution.",
      ),
      f(
        "Why is NaCl not represented as an isolated covalent molecule?",
        "It is normally an extended ionic lattice, not discrete Na–Cl molecules.",
      ),
    ],
    [
      "Charge balance does not mean each cation has exactly one neighbouring anion.",
    ],
    chapter("7-1-ionic-bonding"),
  ),
  "IB-S2.3": lesson(
    "Use the metallic model to explain conductivity, mechanical properties, and alloys.",
    [
      f(
        "What carries charge through a metal?",
        "Delocalised electrons that can move through the structure.",
      ),
      f(
        "Why are many metals malleable?",
        "Layers can move while metallic attraction is retained, unlike brittle ionic lattices.",
      ),
      f(
        "What is an alloy?",
        "A material combining a metal with one or more other elements.",
      ),
      f(
        "Why can alloying change hardness?",
        "Different atoms alter the structure and obstruct easy movement of layers or defects.",
      ),
    ],
    [
      "A metal’s conductivity does not arise from free-moving positive ions in its solid lattice.",
    ],
    chapter("10-5-the-solid-state-of-matter"),
  ),
  "IB-R1.3": lesson(
    "Compare fuels through energy released, reaction completeness, and environmental consequences.",
    [
      f(
        "What forms in complete hydrocarbon combustion?",
        "Carbon dioxide and water, with sufficient oxygen.",
      ),
      f(
        "What may incomplete combustion produce?",
        "Carbon monoxide and/or carbon particles as well as water; products depend on oxygen availability.",
      ),
      f(
        "How can fuel energy density be compared?",
        "Compare energy per unit mass or amount using consistent units.",
      ),
      f(
        "What happens at a hydrogen fuel-cell cathode?",
        "Oxygen is reduced; the balanced half-equation depends on the electrolyte.",
      ),
    ],
    [
      "A low-emission point of use does not determine the full life-cycle impact of a fuel.",
    ],
    chapter("5-3-enthalpy"),
  ),
};
type Entry = [
  code: string,
  title: string,
  lessonKey: string,
  group: string,
  level: string,
];
const as: Entry[] = [
  ["1", "Atomic structure", "atomic", "Physical chemistry", "AS"],
  [
    "2",
    "Atoms, molecules and stoichiometry",
    "mole",
    "Physical chemistry",
    "AS",
  ],
  ["3", "Chemical bonding", "bonding", "Physical chemistry", "AS"],
  ["4", "States of matter", "matter", "Physical chemistry", "AS"],
  ["5", "Chemical energetics", "energy", "Physical chemistry", "AS"],
  ["6", "Electrochemistry", "redox", "Physical chemistry", "AS"],
  ["7", "Equilibria", "equilibrium", "Physical chemistry", "AS"],
  ["8", "Reaction kinetics", "kinetics", "Physical chemistry", "AS"],
  ["9", "Chemical periodicity", "periodic", "Inorganic chemistry", "AS"],
  ["10", "Group 2", "group2", "Inorganic chemistry", "AS"],
  ["11", "Group 17", "halogens", "Inorganic chemistry", "AS"],
  ["12", "Nitrogen and sulfur", "ns", "Inorganic chemistry", "AS"],
  ["13", "Organic foundations", "organicBasics", "Organic chemistry", "AS"],
  ["14", "Hydrocarbons", "hydrocarbons", "Organic chemistry", "AS"],
  ["15", "Halogen compounds", "substitution", "Organic chemistry", "AS"],
  ["16", "Hydroxy compounds", "alcohols", "Organic chemistry", "AS"],
  ["17", "Carbonyl compounds", "carbonyl", "Organic chemistry", "AS"],
  [
    "18",
    "Carboxylic acids and derivatives",
    "carboxyl",
    "Organic chemistry",
    "AS",
  ],
  ["19", "Nitrogen compounds", "amines", "Organic chemistry", "AS"],
  ["20", "Polymerisation", "polymers", "Organic chemistry", "AS"],
  ["21", "Organic synthesis", "synthesis", "Organic chemistry", "AS"],
  ["22", "Analytical techniques", "spectroscopy", "Analysis", "AS"],
  [
    "23",
    "Energetics: entropy and Gibbs energy",
    "thermo",
    "Physical chemistry",
    "A2",
  ],
  ["24", "Electrochemical cells", "cells", "Physical chemistry", "A2"],
  [
    "25",
    "Equilibria: acids, buffers and solubility",
    "acids",
    "Physical chemistry",
    "A2",
  ],
  [
    "26",
    "Kinetics: orders and mechanisms",
    "kinetics",
    "Physical chemistry",
    "A2",
  ],
  ["27", "Group 2: advanced trends", "group2", "Inorganic chemistry", "A2"],
  ["28", "Transition elements", "transition", "Inorganic chemistry", "A2"],
  [
    "29",
    "Organic stereochemistry",
    "stereochemistry",
    "Organic chemistry",
    "A2",
  ],
  ["30", "Aromatic hydrocarbons", "aromatic", "Organic chemistry", "A2"],
  [
    "31",
    "Halogen compounds: mechanisms",
    "substitution",
    "Organic chemistry",
    "A2",
  ],
  [
    "32",
    "Hydroxy compounds: phenols and alcohols",
    "alcohols",
    "Organic chemistry",
    "A2",
  ],
  ["33", "Acids and acyl derivatives", "carboxyl", "Organic chemistry", "A2"],
  [
    "34",
    "Nitrogen compounds: amines and amino acids",
    "amines",
    "Organic chemistry",
    "A2",
  ],
  ["35", "Condensation polymers", "polymers", "Organic chemistry", "A2"],
  ["36", "Multistep organic synthesis", "synthesis", "Organic chemistry", "A2"],
  ["37", "NMR and chromatography", "spectroscopy", "Analysis", "A2"],
  [
    "P3",
    "Practical skills and qualitative analysis",
    "practical",
    "Practical assessment",
    "AS",
  ],
  [
    "P5",
    "Planning, analysis and evaluation",
    "practical",
    "Practical assessment",
    "A2",
  ],
];
const ib: Entry[] = [
  ["S1.1", "Particulate nature of matter", "matter", "Structure 1", "SL + HL"],
  ["S1.2", "The nuclear atom", "atomic", "Structure 1", "SL + HL"],
  ["S1.3", "Electron configurations", "atomic", "Structure 1", "SL + HL"],
  ["S1.4", "Counting particles by mass", "mole", "Structure 1", "SL + HL"],
  ["S1.5", "Ideal gases", "matter", "Structure 1", "SL + HL"],
  ["S2.1", "The ionic model", "materials", "Structure 2", "SL + HL"],
  ["S2.2", "The covalent model", "bonding", "Structure 2", "SL + HL"],
  ["S2.3", "The metallic model", "materials", "Structure 2", "SL + HL"],
  ["S2.4", "From models to materials", "polymers", "Structure 2", "SL + HL"],
  ["S3.1", "The periodic table", "periodic", "Structure 3", "SL + HL"],
  ["S3.2", "Functional groups", "organicBasics", "Structure 3", "SL + HL"],
  ["R1.1", "Measuring enthalpy changes", "energy", "Reactivity 1", "SL + HL"],
  ["R1.2", "Energy cycles", "energy", "Reactivity 1", "SL + HL"],
  ["R1.3", "Energy from fuels", "hydrocarbons", "Reactivity 1", "SL + HL"],
  ["R1.4", "Entropy and spontaneity", "thermo", "Reactivity 1", "HL"],
  [
    "R2.1",
    "How much? Amount of chemical change",
    "mole",
    "Reactivity 2",
    "SL + HL",
  ],
  [
    "R2.2",
    "How fast? Rate of chemical change",
    "kinetics",
    "Reactivity 2",
    "SL + HL",
  ],
  [
    "R2.3",
    "How far? Extent of chemical change",
    "equilibrium",
    "Reactivity 2",
    "SL + HL",
  ],
  ["R3.1", "Proton transfer reactions", "acids", "Reactivity 3", "SL + HL"],
  ["R3.2", "Electron transfer reactions", "redox", "Reactivity 3", "SL + HL"],
  [
    "R3.3",
    "Electron sharing reactions",
    "hydrocarbons",
    "Reactivity 3",
    "SL + HL",
  ],
  [
    "R3.4",
    "Electron-pair sharing reactions",
    "substitution",
    "Reactivity 3",
    "SL + HL",
  ],
  ["SI", "Scientific investigation", "practical", "Practical work", "SL + HL"],
  [
    "CSP",
    "Collaborative sciences project",
    "practical",
    "Practical work",
    "SL + HL",
  ],
];
const makeModules = (course: CourseId, entries: Entry[]): Module[] =>
  entries.map(([code, title, lessonKey, group, level], i) => ({
    id: `${course}-${code}`,
    code,
    title,
    lessonKey,
    group,
    level,
    description: (SCOPED[`${course}-${code}`] || LESSONS[lessonKey]).summary,
    topic: title,
    status: i === 0 ? "active" : "locked",
  }));
export const COURSES: Record<
  CourseId,
  {
    name: string;
    shortName: string;
    version: string;
    note: string;
    modules: Module[];
    sources: VideoResource[];
  }
> = {
  ALEVEL: {
    name: "Cambridge AS & A Level",
    shortName: "Cambridge 9701",
    version: "2025–2027",
    note: "Topics 1–22 are AS; 23–37 extend to A Level. These concise notes are a starting point; the official learning outcomes and practical requirements define full coverage.",
    modules: makeModules("ALEVEL", as),
    sources: [
      SOURCES.cambridge,
      SOURCES.znotesAS,
      SOURCES.znotesA2,
      SOURCES.smeA,
    ],
  },
  IB: {
    name: "IB Diploma Chemistry",
    shortName: "IB Diploma",
    version: "First assessment 2025",
    note: "Current Structure/Reactivity framework. SL + HL modules include additional HL requirements in the official guide; the introductory notes do not replace those detailed outcomes. Retired options are excluded.",
    modules: makeModules("IB", ib),
    sources: [SOURCES.ib, SOURCES.smeIB, SOURCES.ibchem],
  },
};
export function getStudyGuide(module: Module, course: CourseId): StudyGuide {
  const item = SCOPED[module.id] || LESSONS[module.lessonKey || "bonding"];
  const cards = [
    ...item.cards.map((card, i) => ({ ...card, id: `${module.id}:core:${i}` })),
    ...extraCards(module.lessonKey || "bonding", module.id),
  ];
  return {
    topic: module.title,
    summary: item.summary,
    keyPoints: cards.map((c) => c.definition),
    commonMistakes: item.mistakes,
    resources: [...item.sources, ...COURSES[course].sources],
    flashcards: cards,
  };
}
