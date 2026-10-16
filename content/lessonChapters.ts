import type { Module, StudyGuide } from "../types";

export interface LessonChapter {
  opening: string;
  approach: string;
  example: { problem: string; steps: string[]; answer: string };
  figure: "orbitals" | "energy" | "amount" | "particles" | "reaction";
}
type ChapterSeed = [
  string,
  string,
  string,
  string[],
  string,
  LessonChapter["figure"],
];
// Original teaching examples, not copied examination questions. Further reading is
// supplied by each module's syllabus and OpenStax references in curriculum.ts.
const chapters: Record<string, ChapterSeed> = {
  transition: [
    "Transition-element chemistry makes the simple main-group picture richer. Several oxidation states can be accessible, and ligands donate electron pairs to a metal centre to form complexes. Colour depends on electronic energy differences; it is not a universal property of every transition-metal ion.",
    "Count coordination sites separately from ligand molecules because a ligand may bind through more than one donor atom. Specify oxidation state, coordination number and ligand identity before discussing shape, colour or ligand exchange. Catalytic activity requires a mechanism or observation, not just the presence of a transition metal.",
    "Find the oxidation state of cobalt in $\\ce{[Co(NH3)6]^{3+}}$.",
    [
      "The complex has overall charge +3.",
      "Each ammonia ligand is neutral.",
      "The cobalt oxidation state must therefore be +3; six donor nitrogen atoms give coordination number six.",
    ],
    "Cobalt(III), coordination number 6. Oxidation state and coordination number are different quantities.",
    "reaction",
  ],
  atomic: [
    "An element is identified by its nucleus, but its chemistry is largely controlled by electrons. Separate those two jobs: changing neutrons produces an isotope; changing electrons produces an ion. Atomic mass is a weighted average over a sample, not a particle count in one atom.",
    "Build a configuration one orbital at a time. Apply Pauli's two-electron limit and Hund's rule within equal-energy orbitals. Then use shielding, nuclear charge and distance together to explain trends rather than memorising an arrow across the periodic table.",
    "Count the particles in a sodium-23 ion with charge +1.",
    [
      "Read Z = 11 and A = 23 from $\\ce{^{23}_{11}Na+}$.",
      "Neutrons: A − Z = 23 − 11 = 12.",
      "A +1 ion has lost one electron: 11 − 1 = 10.",
    ],
    "11 protons, 12 neutrons and 10 electrons; the electron configuration is $1s^2\\,2s^2\\,2p^6$.",
    "orbitals",
  ],
  mole: [
    "Balanced equations compare numbers of chemical entities. The mole lets us turn those ratios into measurable masses and solution volumes. Start by naming what is counted: atoms, molecules, ions or formula units. This prevents a common factor-of-two error for diatomic elements.",
    "Convert every measured quantity to moles before using a reaction ratio. Keep units attached to each line and identify the limiting reactant if more than one amount is supplied. A theoretical yield assumes complete reaction and no product loss; an actual yield tests that assumption.",
    "What mass of sodium chloride is present in 25.0 cm³ of 0.200 mol dm⁻³ solution? Use M = 58.5 g mol⁻¹.",
    [
      "Convert the volume: 25.0 cm³ = 0.0250 dm³.",
      "$n=cV=0.200\\times0.0250=0.00500\\ \\mathrm{mol}$.",
      "$m=nM=0.00500\\times58.5\\ \\mathrm{g}$.",
    ],
    "0.293 g to three significant figures.",
    "amount",
  ],
  bonding: [
    "A bond model describes electron distribution; a shape model describes how atoms are arranged. Begin with a Lewis structure and a checked valence-electron count. VSEPR then uses regions of electron density around the central atom, with a multiple bond counting as one region.",
    "Distinguish electron-domain arrangement from molecular shape. Lone pairs are included in the first but not named as atoms in the second. To decide polarity, combine bond dipoles with the actual molecular symmetry: polar bonds can cancel. A flat structural drawing is not a measurement of three-dimensional angles.",
    "Explain why carbon dioxide is nonpolar even though its C=O bonds are polar.",
    [
      "The carbon has two bonding domains and no lone pairs.",
      "Two domains predict a linear arrangement, with an ideal angle of 180°.",
      "The equal C=O bond dipoles point in opposite directions and cancel.",
    ],
    "The molecule has no net permanent dipole in its linear equilibrium structure.",
    "particles",
  ],
  matter: [
    "Macroscopic properties come from particles and their interactions. In a solid, particles occupy comparatively fixed positions; liquids retain close contact while moving; gases are widely separated. A phase change changes their arrangement and energy without usually changing a molecule's covalent connectivity.",
    "Choose the model before calculating. An ideal gas neglects particle volume and intermolecular forces. It becomes less reliable at high pressure and low temperature, especially near condensation. For boiling-point comparisons, identify the relevant attractions and separate them from intramolecular bonds.",
    "Estimate the volume of 0.100 mol ideal gas at 298 K and 100 kPa.",
    [
      "Use $pV=nRT$ with p = 100000 Pa and R = 8.314 J mol⁻¹ K⁻¹.",
      "$V=(0.100\\times8.314\\times298)/100000\\ \\mathrm{m^3}$.",
      "Convert m³ to dm³ by multiplying by 1000.",
    ],
    "2.48 dm³; this is an ideal-gas estimate, not an experimental measurement.",
    "particles",
  ],
  energy: [
    "Enthalpy changes describe energy exchanged at constant pressure for a specified reaction. An exothermic reaction transfers energy to the surroundings; an endothermic one takes it in. Always attach an equation and states to a thermochemical value because reversing or rescaling the equation changes the sign or magnitude.",
    "Calorimetry estimates heat from a measured temperature change; Hess's law connects reactions through alternative paths. Bond enthalpies provide a gas-phase estimate, not an exact substitute for formation enthalpies. In every calculation distinguish the solution's heat gain from the reaction's heat change.",
    "50.0 g of solution warms by 5.00 K when 0.0100 mol reacts. Estimate the molar reaction enthalpy using c = 4.18 J g⁻¹ K⁻¹.",
    [
      "$q_{\\mathrm{solution}}=mc\\Delta T=50.0\\times4.18\\times5.00=1045\\ \\mathrm{J}$.",
      "The warming solution gains heat, so the reaction releases −1045 J.",
      "Divide −1.045 kJ by 0.0100 mol.",
    ],
    "−105 kJ mol⁻¹, assuming negligible heat loss and the stated heat capacity.",
    "energy",
  ],
  thermo: [
    "An energetically favourable reaction is not necessarily rapid. Thermodynamics assesses the direction of spontaneous change under specified conditions, while kinetics assesses its rate. Entropy includes the surroundings as well as the reacting system; a decrease in system entropy alone cannot establish non-spontaneity.",
    "Use Gibbs energy with consistent units and absolute temperature. A standard Gibbs energy describes standard-state conditions; the actual direction can differ when concentrations or pressures change. A catalyst lowers activation barriers but does not change the equilibrium constant or standard Gibbs energy.",
    "At 298 K, calculate ΔG° when ΔH° = −40.0 kJ mol⁻¹ and ΔS° = −100 J mol⁻¹ K⁻¹.",
    [
      "Convert entropy to −0.100 kJ mol⁻¹ K⁻¹.",
      "$\\Delta G^\\circ=\\Delta H^\\circ-T\\Delta S^\\circ$.",
      "$\\Delta G^\\circ=-40.0-298(-0.100)$.",
    ],
    "−10.2 kJ mol⁻¹: forward change is thermodynamically favourable under standard-state conditions, not necessarily fast.",
    "energy",
  ],
  redox: [
    "Oxidation and reduction occur together because electrons transferred by one species are accepted by another. Oxidation numbers are an accounting model: their change reveals the direction and number of electrons transferred, even where no free electrons appear in the overall reaction.",
    "Write separate half-equations, balance atoms and charge, then equalise the electron counts before combining. The oxidising agent is reduced and the reducing agent is oxidised. For electrolysis, distinguish the species present from the species preferentially discharged under the stated conditions.",
    "Combine zinc oxidation and copper(II) reduction.",
    [
      "$\\ce{Zn -> Zn^{2+} + 2e-}$.",
      "$\\ce{Cu^{2+} + 2e- -> Cu}$.",
      "Add the half-equations and cancel the two electrons.",
    ],
    "$\\ce{Zn + Cu^{2+} -> Zn^{2+} + Cu}$; zinc is the reducing agent.",
    "reaction",
  ],
  cells: [
    "An electrochemical cell separates oxidation and reduction so electrons can pass through an external circuit. The salt bridge completes the ionic circuit without carrying electrons. Standard electrode potentials are tabulated as reductions, so choose directions consistently before calculating a cell potential.",
    "Identify the cathode as the reduction site and the anode as the oxidation site. Those definitions hold for both galvanic and electrolytic cells even though electrode signs differ. Standard potentials predict a standard thermodynamic tendency, not the rate or products under every nonstandard condition.",
    "Find E°cell for zinc/copper using E°(Cu²⁺/Cu) = +0.34 V and E°(Zn²⁺/Zn) = −0.76 V.",
    [
      "Copper(II) is reduced at the cathode.",
      "Zinc is oxidised at the anode; keep its tabulated reduction potential in the subtraction.",
      "$E^\\circ_{\\mathrm{cell}}=0.34-(-0.76)$.",
    ],
    "+1.10 V for the stated standard cell.",
    "reaction",
  ],
  equilibrium: [
    "Dynamic equilibrium is established in a closed system when forward and reverse rates are equal. The amounts need not be equal. Disturbing an equilibrium changes the competing rates initially, and the system moves towards a new composition consistent with its equilibrium constant.",
    "Construct K from the balanced equation, including powers from coefficients. Compare Q with K to predict a direction of change. A concentration or pressure change at fixed temperature changes Q, not K; a temperature change can change K. A catalyst accelerates equilibration without shifting its position.",
    "For $\\ce{N2 + 3H2 <=> 2NH3}$, write the concentration equilibrium expression.",
    [
      "Use products over reactants.",
      "Use each stoichiometric coefficient as a power.",
      "For a school concentration expression, retain the concentration units required by your syllabus.",
    ],
    "$K_c=\\dfrac{[\\mathrm{NH_3}]^2}{[\\mathrm{N_2}][\\mathrm{H_2}]^3}$; at higher pressure the equilibrium composition favours the side with fewer gas molecules.",
    "reaction",
  ],
  acids: [
    "A Brønsted–Lowry acid donates a proton and a base accepts one. Strength describes the extent of ionisation; concentration describes how much is present per volume. A dilute strong acid and a concentrated weak acid are therefore not contradictory descriptions.",
    "Write the relevant proton-transfer equilibrium before choosing an approximation. Buffers contain a weak acid/base and its conjugate partner; they consume modest additions of acid or base but have finite capacity. For weak-acid calculations check that the assumed small dissociation is justified.",
    "Estimate the pH of 0.0100 mol dm⁻³ hydrochloric acid at 25 °C.",
    [
      "Assume complete dissociation and negligible contribution from water.",
      "$[\\ce{H+}]=0.0100\\ \\mathrm{mol\\,dm^{-3}}$.",
      "$\\mathrm{pH}=-\\log_{10}(0.0100)$.",
    ],
    "pH = 2.00 under the stated introductory approximation.",
    "reaction",
  ],
  kinetics: [
    "Rate measures how quickly composition changes, not how far a reaction will proceed. Collisions must have sufficient energy and an appropriate arrangement to produce reaction. Heating changes the energy distribution; a catalyst offers another pathway with a lower activation barrier.",
    "Read a rate from a graph gradient rather than from the graph's height. At advanced level, deduce orders from experimental rate comparisons, not balanced-equation coefficients. A proposed mechanism must fit the rate evidence and overall stoichiometry; agreement does not prove it is the only mechanism.",
    "Doubling [A] at fixed [B] quadruples the initial rate. What is the order in A?",
    [
      "For rate proportional to $[A]^m$, the ratio is $2^m$.",
      "Set $2^m=4$.",
      "Therefore m = 2; the experiment does not determine the order in B.",
    ],
    "Second order in A for the measured conditions.",
    "energy",
  ],
  periodic: [
    "Periodic trends connect atomic structure to observable chemical behaviour. Across a period nuclear charge rises while electrons enter the same principal shell; down a group a new shell increases distance and shielding. These competing effects provide explanations, not just trend labels.",
    "Specify the property and the chemical species being compared. Atomic radius, ionic radius, electronegativity and ionisation energy answer different questions. Exceptions can result from subshell occupancy or paired-electron repulsion; recognise those rather than forcing every element onto a smooth trend.",
    "Explain why a sodium ion is smaller than a sodium atom.",
    [
      "$\\ce{Na}$ has a valence electron in the third shell.",
      "$\\ce{Na+}$ has lost that electron and has a filled second shell.",
      "The remaining electrons experience the same nuclear charge with less shielding and no occupied third shell.",
    ],
    "The cation is smaller; this comparison concerns different electron configurations, not a change in proton number.",
    "orbitals",
  ],
  group2: [
    "Group 2 elements commonly lose two electrons to form +2 ions. Reactivity trends reflect how readily those electrons are removed, while solubility and thermal stability require comparisons of lattice and hydration effects rather than the metallic reactivity trend alone.",
    "Keep sulfate and hydroxide solubility trends separate and identify observations before interpreting them. Explain carbonate decomposition using cation charge density and anion polarisation. Equations should include states where observations depend on a precipitate, gas or solution.",
    "Write the thermal decomposition equation for calcium carbonate.",
    [
      "Identify the products: the metal oxide and carbon dioxide.",
      "Balance calcium, carbon and oxygen.",
      "Heating is a condition, not a reactant.",
    ],
    "$\\ce{CaCO3(s) -> CaO(s) + CO2(g)}$ on sufficient heating.",
    "reaction",
  ],
  halogens: [
    "A halogen molecule can accept electrons to form halide ions, making it an oxidising agent. Down Group 17, increased radius and shielding generally reduce oxidising strength. Halide ions show the opposite trend in reducing strength, so be explicit about molecule versus ion.",
    "Use displacement to connect observations to electron transfer. Precipitation tests identify halide ions, not the corresponding halogen molecules. Acidification and subsequent ammonia testing are separate steps in the conventional silver-nitrate test; give both the observation and inference.",
    "Predict the reaction of chlorine with aqueous bromide.",
    [
      "Chlorine is the stronger oxidising agent.",
      "It accepts electrons while bromide is oxidised.",
      "Balance the two-electron transfer.",
    ],
    "$\\ce{Cl2 + 2Br- -> 2Cl- + Br2}$; bromine is formed.",
    "reaction",
  ],
  ns: [
    "Nitrogen and sulfur chemistry links molecular structure, oxidation state and environmental behaviour. Separate an industrial equilibrium from its operating compromise: a high theoretical yield alone does not guarantee an economical rate or practical separation.",
    "For the Haber or Contact process, discuss temperature, pressure and catalyst individually. The catalyst changes rate, while temperature changes both rate and equilibrium. For atmospheric effects, distinguish acidifying gases, greenhouse gases and nitrogen oxides instead of treating pollution as a single mechanism.",
    "Why does the Haber process use a catalyst rather than relying only on lower temperature?",
    [
      "Ammonia formation is exothermic, so lower temperature favours equilibrium yield.",
      "Lower temperature also reduces the reaction rate.",
      "A catalyst improves rate without changing the equilibrium constant.",
    ],
    "The industrial conditions balance rate, yield, energy and equipment costs.",
    "reaction",
  ],
  organicBasics: [
    "Organic structures encode connectivity, not merely elemental composition. A functional group guides likely reactions, while a carbon skeleton and stereochemistry distinguish compounds with the same formula. Begin by translating between displayed, skeletal and molecular representations.",
    "Choose the principal functional group and parent chain before assigning locants and substituents. In skeletal formulae, vertices and unlabelled ends represent carbon, with enough hydrogens to satisfy valence. Explicit charges and heteroatom hydrogens must still be considered.",
    "Determine the functional group and molecular formula of CH₃CH₂OH.",
    [
      "The terminal −OH is an alcohol group attached to saturated carbon.",
      "Count two carbon atoms, six hydrogen atoms and one oxygen atom.",
      "A molecular formula alone would not distinguish it from dimethyl ether.",
    ],
    "Ethanol, $\\ce{C2H6O}$; the connectivity identifies the alcohol.",
    "reaction",
  ],
  hydrocarbons: [
    "Hydrocarbons contain only carbon and hydrogen, but their reactivity depends on bonding. A carbon–carbon double bond contains a σ bond and a π bond; its electron-rich π component can participate in electrophilic addition. Alkane reactions commonly require different initiation conditions.",
    "Name the reaction class before predicting a product. Addition removes a π bond while creating new σ bonds; substitution replaces a group; combustion oxidises the fuel. Use stated reagents and conditions rather than assuming any two compounds must react.",
    "Predict the simple addition product of ethene and bromine.",
    [
      "Locate the C=C double bond.",
      "Reduce its bond order to a single bond.",
      "Attach one bromine atom to each former alkene carbon.",
    ],
    "$\\ce{CH2=CH2 + Br2 -> CH2BrCH2Br}$, 1,2-dibromoethane, under appropriate addition conditions.",
    "reaction",
  ],
  substitution: [
    "A nucleophile supplies an electron pair to an electron-deficient centre. A leaving group departs with the bonding pair. The competition between substitution and elimination depends on substrate structure, reagent, solvent and temperature, so a product claim needs those conditions.",
    "Track electron pairs with curly arrows starting at an electron source, not at a positive charge. Advanced mechanisms distinguish a concerted substitution from one proceeding through a carbocation. Use experimental evidence and substrate effects, not a memorised mechanism label alone.",
    "Predict the introductory substitution of bromoethane with aqueous hydroxide.",
    [
      "Hydroxide supplies an electron pair to the carbon bonded to bromine.",
      "The C–Br bond breaks with the pair going to bromide.",
      "Substitute −OH for −Br; preserve the two-carbon skeleton.",
    ],
    "$\\ce{CH3CH2Br + OH- -> CH3CH2OH + Br-}$ under suitable aqueous substitution conditions.",
    "reaction",
  ],
  alcohols: [
    "Alcohols have an −OH group attached to saturated carbon. Their classification depends on how many carbon groups attach to that carbon, not how many −OH groups the molecule has. Oxidation products then depend on that classification and on whether the product is removed or allowed to react further.",
    "Separate the reagent from the apparatus condition. Distillation can remove an aldehyde from a primary-alcohol oxidation; reflux permits further oxidation under suitable conditions. Phenols differ from ordinary alcohols because the −OH group is attached directly to an aromatic ring.",
    "Outline primary alcohol oxidation without copying a specific laboratory recipe.",
    [
      "Identify a primary alcohol, such as ethanol.",
      "Controlled oxidation can produce ethanal.",
      "Further suitable oxidation can produce ethanoic acid.",
    ],
    "$\\ce{CH3CH2OH -> CH3CHO -> CH3COOH}$ is a pathway map, not a balanced equation or a claim that conditions are interchangeable.",
    "reaction",
  ],
  carbonyl: [
    "The carbonyl bond is polar, leaving its carbon electrophilic. Aldehydes and ketones share that reactive centre but differ in the groups attached to it. This difference explains why many aldehydes are oxidised by mild test reagents whereas ordinary ketones are not.",
    "A nucleophile adds to the carbonyl carbon while the π electrons move towards oxygen. In a test question distinguish a positive observation from what it establishes: a carbonyl test alone does not distinguish every aldehyde from every ketone.",
    "Compare the oxidation behaviour of ethanal and propanone with a mild aldehyde-test reagent.",
    [
      "Ethanal has a hydrogen attached to its carbonyl carbon.",
      "Its oxidation can form the corresponding carboxylate under alkaline test conditions.",
      "Propanone has carbon groups on both sides and does not give the ordinary aldehyde-positive result.",
    ],
    "The aldehyde gives the characteristic positive result; the ketone does not under the conventional test conditions.",
    "reaction",
  ],
  carboxyl: [
    "Carboxylic acids combine a carbonyl with an −OH group. Their conjugate bases are stabilised by delocalisation, helping explain their acidity relative to ordinary alcohols. Derivatives retain an acyl centre but differ in leaving groups and reactivity.",
    "For an esterification, identify the acid-derived acyl part and alcohol-derived alkoxy part separately. Acid hydrolysis is reversible; alkaline hydrolysis produces a carboxylate and is treated differently. Acyl chlorides are more reactive derivatives and must not be assigned the same conditions as esters.",
    "Identify the ester formed from ethanoic acid and ethanol.",
    [
      "Retain the acid's $\\ce{CH3CO}$ acyl fragment.",
      "Attach the alcohol-derived $\\ce{OCH2CH3}$ group.",
      "Include water as the coproduct in the reversible reaction.",
    ],
    "$\\ce{CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O}$: ethyl ethanoate under suitable catalysed conditions.",
    "reaction",
  ],
  amines: [
    "Nitrogen compounds must be distinguished by connectivity. A nitrile has a C≡N group with its carbon included in the chain; an amine has nitrogen bonded to carbon groups or hydrogen. They do not share the same naming rules or reaction pattern.",
    "Read your level's scope before using a reaction. AS nitrogen-compound work centres on nitriles; advanced study includes amines, amides and amino acids. The nitrogen lone pair can accept a proton in an amine, while delocalisation changes its availability in other environments.",
    "What happens to the carbon count when bromoethane is converted to a nitrile using cyanide under suitable conditions?",
    [
      "The cyanide carbon bonds to the substrate carbon.",
      "Two substrate carbons plus the nitrile carbon give three carbons.",
      "Include the nitrile carbon when naming the parent chain.",
    ],
    "Propanenitrile, $\\ce{CH3CH2CN}$; this substitution lengthens the carbon chain by one.",
    "reaction",
  ],
  polymers: [
    "A polymer contains repeated units, but the repeat unit is not always identical to an isolated monomer. Addition polymerisation commonly converts an alkene π bond into links between units. Condensation connects suitable functional groups, often releasing a small molecule.",
    "Show continuation bonds through the repeat-unit brackets. Check that each atom satisfies valence and that removed small molecules are accounted for in condensation. Material properties depend on chains, interactions and cross-links, not just the name of the monomer.",
    "Describe the repeat unit produced from ethene by addition polymerisation.",
    [
      "Open the C=C π bond without removing carbon or hydrogen atoms.",
      "Connect the former alkene carbons into a chain.",
      "Place the two-carbon segment in brackets with bonds continuing through them.",
    ],
    "The repeat segment is $[\\ce{-CH2-CH2-}]_n$; no small molecule is eliminated in this ideal addition description.",
    "reaction",
  ],
  synthesis: [
    "A synthesis plan works backwards from a target functional group and forwards through feasible transformations. Carbon-skeleton changes, selectivity and conditions all matter. A balanced equation is necessary accounting, but does not by itself show that a reaction is useful or selective.",
    "List each intermediate explicitly and check that the next reagent acts on that intermediate. Separate a proposed pathway from a verified procedure. For multistep yield, multiply fractional step yields: even good individual yields can give a much lower overall recovery.",
    "Two steps each give an 80% isolated yield. Find the overall yield.",
    [
      "Convert 80% to a fraction: 0.80.",
      "Multiply successive recoveries: $0.80\\times0.80=0.64$.",
      "Convert back to a percentage.",
    ],
    "64% overall; adding the two percentages is incorrect.",
    "reaction",
  ],
  spectroscopy: [
    "Spectroscopic methods provide complementary evidence. Infrared absorption indicates bond vibrations and functional groups; mass spectra supply mass-to-charge patterns and fragmentation clues. NMR, where included at your level, distinguishes magnetic environments rather than directly drawing an entire structure.",
    "Build a candidate from all evidence and then check every observation against it. An absent signal is useful only if the method and expected detectability justify that inference. Do not treat a single peak as conclusive identification of an isomer.",
    "How would IR help distinguish an alcohol from a ketone?",
    [
      "Check for the characteristic broad alcohol O–H absorption.",
      "Check for a strong carbonyl absorption for the ketone.",
      "Use the spectrum as evidence for functional groups, then seek complementary structural evidence.",
    ],
    "The patterns support different functional groups; they do not uniquely identify every compound.",
    "reaction",
  ],
  stereochemistry: [
    "Two molecules can share connectivity yet differ in spatial arrangement. Stereoisomers cannot be distinguished by molecular formula alone. A tetrahedral centre with four different substituents can be stereogenic; alkene stereochemistry requires suitable substituents on both double-bond carbons.",
    "Test each centre or double bond systematically rather than judging the whole sketch by appearance. Rotation about a single bond changes conformation, not configuration. Optical activity of a sample depends on its enantiomeric composition, so a racemate behaves differently from a pure enantiomer.",
    "Why can butan-2-ol have enantiomers?",
    [
      "Inspect carbon 2, the alcohol-bearing carbon.",
      "Its substituents are H, OH, methyl and ethyl: four different groups.",
      "The two configurations are non-superimposable mirror images.",
    ],
    "Carbon 2 is a stereogenic centre; an unspecified drawing does not identify which enantiomer is present.",
    "particles",
  ],
  aromatic: [
    "Benzene's electrons are delocalised around a planar ring. Alternating-bond drawings are contributors to a model, not a ring switching between separate molecules. Aromatic stabilisation affects reactivity: substitution can preserve aromaticity whereas simple addition would disrupt it.",
    "In electrophilic substitution, identify how the electrophile is generated, how the ring supplies electrons, and how loss of a proton restores aromaticity. Catalysts and conditions are part of the reaction specification, not decorative labels.",
    "Explain why benzene usually undergoes electrophilic substitution rather than ordinary alkene-style addition.",
    [
      "The aromatic ring is stabilised by delocalisation.",
      "An addition product would remove the aromatic arrangement.",
      "Substitution can replace a hydrogen while restoring the aromatic ring.",
    ],
    "Aromatic stabilisation favours pathways that preserve or restore aromaticity; specific reactions still require suitable conditions.",
    "reaction",
  ],
  practical: [
    "Practical chemistry turns a question into measurements that can support a conclusion. The method must specify what changes, what is measured and what is held constant. Reliable observation and recording are separate from interpretation; report both, including anomalies rather than silently removing them.",
    "Match apparatus to the required uncertainty, obtain repeat measurements and assess systematic as well as random effects. Explain how a proposed improvement addresses a particular limitation. A risk assessment is required for real experiments; this study material is not a laboratory operating procedure.",
    "A titre is calculated from two burette readings, each with an uncertainty of ±0.05 cm³. Estimate the absolute uncertainty in their difference.",
    [
      "Use the course's conservative addition of absolute uncertainties for subtraction.",
      "Add 0.05 + 0.05 cm³.",
      "For a 25.00 cm³ titre, divide 0.10 by 25.00 and multiply by 100.",
    ],
    "±0.10 cm³, or 0.40%; use the uncertainty convention specified in the question.",
    "amount",
  ],
  materials: [
    "A material's behaviour depends on structure at several scales. Ionic, metallic and covalent models explain different patterns of conductivity, melting and mechanical behaviour. Classification is a model choice, not evidence that every member of a category has identical properties.",
    "For each property, name the particles and the process needed. An ionic melt conducts through mobile ions; a metal conducts through mobile delocalised electrons. A solid ionic lattice has charged particles but ordinarily lacks their freedom to move through the material.",
    "Why does molten sodium chloride conduct while solid sodium chloride does not normally do so?",
    [
      "Both contain sodium and chloride ions.",
      "The solid lattice holds ions in relatively fixed positions.",
      "Melting allows ions to move and carry charge.",
    ],
    "Conductivity requires mobile charge carriers; the mere presence of charged particles is insufficient.",
    "particles",
  ],
};

export function getLessonChapter(
  module: Module,
  guide: StudyGuide,
): LessonChapter {
  let seed = chapters[module.lessonKey || "bonding"];
  if (!seed) throw new Error(`Missing lesson chapter: ${module.id}`);
  // Respect the narrow scopes represented by curriculum.ts rather than silently
  // adding HL/A2 topics to an introductory module.
  if (module.id === "IB-S3.1") seed = chapters.periodic;
  if (module.id === "ALEVEL-8")
    seed = [
      chapters.kinetics[0],
      "At AS level, explain changes in rate using collision frequency and the fraction of collisions with sufficient energy. Compare experiments with controlled concentrations, particle size and temperature. A catalyst provides another reaction pathway; it does not supply energy to the reactants or move the equilibrium position.",
      "Why can a small temperature increase produce a substantial rate increase?",
      [
        "Particles collide somewhat more frequently as their average speeds increase.",
        "More importantly, the fraction with energy at least equal to the activation energy increases.",
        "More successful collisions occur per unit time.",
      ],
      "Distinguish the increase in successful-collision fraction from the smaller change in collision frequency.",
      "energy",
    ];
  if (module.id === "ALEVEL-37")
    seed = [
      "NMR uses magnetic environments to distinguish otherwise similar atoms. Chemical shift, integration and splitting provide different evidence about the structure. Chromatography separates species through differing interactions with stationary and mobile phases.",
      "For introductory proton NMR interpretation, count distinct proton environments before assigning shifts. Integration estimates relative proton numbers; a splitting rule is an approximation for suitable neighbouring nonequivalent protons. Chromatographic retention alone does not establish unique identity.",
      "How many proton environments does ethanol have in its simple introductory description?",
      [
        "The methyl protons form one environment.",
        "The methylene protons form another environment.",
        "The exchangeable O–H proton gives a third environment; its splitting and position can vary with conditions.",
      ],
      "Three environments in the usual introductory treatment, with a 3:2:1 proton count. Do not assume the O–H signal always follows a simple neighbouring-proton splitting rule.",
      "reaction",
    ];
  if (module.id === "IB-R1.3")
    seed = [
      "Fuels transfer chemical energy during oxidation. Compare fuels using stated measures such as energy per mole, per mass or lifecycle emissions; those measures can lead to different rankings.",
      "Write complete and incomplete combustion separately. Carbon monoxide is a toxic product of incomplete combustion, while carbon dioxide has a different environmental role. Renewable production does not automatically make a fuel free of lifecycle emissions.",
      "Balance the complete combustion of methane.",
      [
        "One carbon atom gives one carbon dioxide molecule.",
        "Four hydrogen atoms give two water molecules.",
        "The products contain four oxygen atoms, requiring two oxygen molecules.",
      ],
      "$\\ce{CH4 + 2O2 -> CO2 + 2H2O}$; states and measured conditions are needed for a thermochemical value.",
      "reaction",
    ];
  if (module.id === "IB-S2.4") seed = chapters.materials;
  const [opening, approach, problem, steps, answer, figure] = seed;
  return {
    opening,
    approach: `${approach} ${guide.summary}`,
    example: { problem, steps, answer },
    figure,
  };
}
