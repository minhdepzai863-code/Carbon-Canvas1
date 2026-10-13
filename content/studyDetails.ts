import type { Flashcard } from "../types";

// Original explanations; external module references provide further reading.
export const DETAILS: Record<string, [string, string][]> = {
  atomic: [
    [
      "How do you count particles in an ion?",
      "Protons equal atomic number Z, neutrons equal A−Z, and electrons equal Z minus the signed charge. Thus 23Na+ has 11 protons, 12 neutrons and 10 electrons. Changing electron count creates an ion, not an isotope.",
    ],
    [
      "How is relative atomic mass calculated?",
      "Multiply each isotopic mass by fractional abundance and sum. For hypothetical 75% mass-35 and 25% mass-37 isotopes, the average is 35.5; this is not the mass number of a single atom.",
    ],
    [
      "How do shells, subshells and orbitals differ?",
      "A shell has principal quantum number n; s, p, d and f subshells contain 1, 3, 5 and 7 orbitals. Each orbital holds at most two opposite-spin electrons, so a p subshell holds six.",
    ],
    [
      "How do you apply the electron-filling rules?",
      "Fill lower-energy orbitals first, obey the Pauli principle, and occupy equal-energy orbitals singly before pairing. Nitrogen has 1s2 2s2 2p3 with three unpaired 2p electrons.",
    ],
    [
      "Why can an ionisation-energy trend have exceptions?",
      "Effective nuclear attraction generally increases across a period, but subshell energy and paired-electron repulsion interrupt the trend. A large jump in successive values can indicate that removal has reached an inner shell.",
    ],
    [
      "How do emission spectra arise?",
      "Excited electrons emit photons when they move to lower allowed energy states. ΔE=hν=hc/λ links line wavelengths to discrete energy differences; convert nanometres to metres when using SI constants.",
    ],
    [
      "Why are 4s electrons removed before 3d in common cations?",
      "The filling sequence is not a fixed energy order for every ion. In common first-row transition-metal cations, occupied 4s electrons are removed first: Fe2+ is commonly represented as [Ar]3d6.",
    ],
  ],
  bonding: [
    [
      "How do you build a Lewis structure before VSEPR?",
      "Count valence electrons, adjusting for charge; connect atoms, complete terminal shells, then assign remaining electrons to the centre. Check electron count and formal charge before predicting shape.",
    ],
    [
      "How do domain geometry and molecular shape differ?",
      "Domain geometry includes bonds and lone pairs; molecular shape describes atom positions. NH3 has four approximately tetrahedral domains but only three attached atoms, giving a trigonal-pyramidal shape.",
    ],
    [
      "How do lone pairs affect angles?",
      "Lone pairs generally occupy more angular space and compress neighbouring bond angles. Methane is about 109.5°, ammonia about 107° and water about 104.5°; these are cited reference values, not measurements from a 2D drawing.",
    ],
    [
      "How do you determine molecular polarity?",
      "Identify polar bonds and add their dipole vectors using the molecular shape. Linear CO2 has cancelling dipoles; bent H2O has a nonzero resultant. Polar bonds alone do not establish a polar molecule.",
    ],
    [
      "Why is a double bond only one VSEPR domain?",
      "Its electron density lies in one direction from the central atom. Multiple-bond density can distort neighbouring angles, so domain counting predicts an ideal arrangement rather than exact physical geometry.",
    ],
    [
      "What is broken when molecular substances boil?",
      "Boiling generally overcomes intermolecular attractions, not the covalent bonds inside each molecule. Ionic and network solids require different explanations because their particles and bonding differ.",
    ],
    [
      "How do hydrogen-bond donors and acceptors differ?",
      "In introductory examples, an N–H, O–H or F–H group can donate and a suitable lone pair can accept. Ethanol can do both; an ether can accept but has no O–H donor.",
    ],
    [
      "What are the limits of these bonding models?",
      "Lewis structures, VSEPR and hybridisation answer different questions. They do not supply measured 3D structures for arbitrary species; molecular-orbital or more advanced treatments may be needed.",
    ],
  ],
  mole: [
    [
      "What does a mole count?",
      "A mole contains exactly 6.02214076×10^23 specified entities. One mole of O2 molecules contains two moles of O atoms; always name the entities being counted.",
    ],
    [
      "How do you convert mass to amount?",
      "Use n=m/M with compatible units. For 5.85 g NaCl and M=58.5 g mol−1, n=0.100 mol; this is an amount of formula units, not isolated NaCl molecules in the lattice.",
    ],
    [
      "How do you use concentration and volume?",
      "Use n=cV with V in dm3 for c in mol dm−3. 25.0 cm3 of 0.200 mol dm−3 solution contains 0.00500 mol; convert volume before multiplying.",
    ],
    [
      "How do you find a limiting reagent?",
      "Divide each available amount by its balanced coefficient. The smallest reaction extent limits product; choosing the smallest mass ignores molar masses and stoichiometry.",
    ],
    [
      "How do empirical and molecular formulae differ?",
      "Convert elemental masses to moles and find the simplest whole-number ratio. Use measured molar mass to find the integer multiple that gives the molecular formula.",
    ],
    [
      "How do yield and atom economy differ?",
      "Yield compares isolated product with theoretical product. Atom economy compares desired-product formula mass with all stoichiometric products; high atom economy does not guarantee high yield.",
    ],
  ],
  lewis: [
    [
      "How is formal charge calculated?",
      "Use valence electrons minus nonbonding electrons minus half the bonding electrons. Formal charges must sum to the overall charge; this differs from oxidation-number bookkeeping.",
    ],
    [
      "What moves in resonance contributors?",
      "Only electron placement changes; the atomic skeleton and total charge remain fixed. Moving a nucleus creates a different structure, not another contributor.",
    ],
    [
      "What is a resonance hybrid?",
      "The real electronic structure is delocalised, not rapidly switching drawings. Equivalent contributors can explain equivalent bond lengths.",
    ],
    [
      "How do you compare contributor importance?",
      "For common main-group examples, favour complete octets, less charge separation and negative charge on more electronegative atoms. All contributors must first obey electron-count rules.",
    ],
    [
      "How is ammonium represented?",
      "NH4+ has four N–H bonds and no nitrogen lone pair. Nitrogen has formal charge +1; a neutral four-bond nitrogen drawing is not equivalent.",
    ],
  ],
  matter: [
    [
      "What assumptions define an ideal gas?",
      "Particles have negligible volume and attractions, with elastic collisions. High pressure and low temperature increase departures from these assumptions.",
    ],
    [
      "How do you use pV=nRT?",
      "With R=8.314 J mol−1 K−1, use Pa, m3 and K. One dm3 is 0.001 m3; a Celsius temperature cannot be inserted directly.",
    ],
    [
      "How does kinetic theory explain pressure?",
      "Wall collisions transfer momentum. Heating at fixed amount and volume increases mean kinetic energy and generally raises pressure.",
    ],
    [
      "How do evaporation and boiling differ?",
      "Evaporation occurs at the surface below boiling temperature. Boiling occurs throughout the liquid when vapour pressure matches external pressure.",
    ],
    [
      "Why must solid structure be identified first?",
      "Molecular, ionic, metallic and network solids contain different particles and forces. Use the actual structure to explain conductivity, melting and deformability.",
    ],
  ],
  energy: [
    [
      "How does calorimetry give ΔH?",
      "Calculate surroundings heat q=mcΔT, reverse the sign for the reaction and divide by reacted amount. State heat-loss and heat-capacity assumptions.",
    ],
    [
      "How do you assemble a Hess cycle?",
      "Reverse ΔH when reversing a step, and multiply both equation and ΔH by the same factor. Cancel species to reproduce the target reaction exactly.",
    ],
    [
      "How do formation enthalpies give ΔrH?",
      "Sum product formation enthalpies minus reactant values, including coefficients. An element in its standard reference state has zero standard formation enthalpy.",
    ],
    [
      "What do average bond energies estimate?",
      "ΔH≈energy for bonds broken minus energy released by bonds formed. These gas-phase averages are approximations and may omit phase changes.",
    ],
    [
      "Why is bond breaking endothermic?",
      "Separating bonded atoms requires energy; forming bonds releases it. Exothermic overall reactions release more energy in formation than they absorb in breaking.",
    ],
  ],
  thermo: [
    [
      "How is Gibbs energy calculated?",
      "ΔG=ΔH−TΔS requires matching units. Negative ΔG indicates thermodynamic favourability at stated conditions, not a fast reaction.",
    ],
    [
      "How can temperature reverse favourability?",
      "When ΔH and ΔS have the same sign, changing T can reverse the sign of ΔG. Inspect ΔH−TΔS rather than relying only on whether heat is released.",
    ],
    [
      "How does equilibrium relate to Gibbs energy?",
      "At equilibrium the reaction ΔG is zero. ΔG°=−RT ln K need not be zero because standard composition is not necessarily equilibrium composition.",
    ],
    [
      "Why can system entropy decrease in a spontaneous process?",
      "The surroundings entropy increase can outweigh a system decrease. At constant temperature and pressure, Gibbs energy accounts for the relevant balance.",
    ],
    [
      "Worked example: ΔH=−40 kJ/mol and ΔS=−100 J/mol/K at 300 K?",
      "Convert entropy to −0.100 kJ mol−1 K−1, giving ΔG=−40−300(−0.100)=−10 kJ mol−1. At 500 K, the same approximation gives +10.",
    ],
  ],
  redox: [
    [
      "How is an oxidation number assigned?",
      "Apply rules and the overall charge, noting exceptions such as peroxides. In SO4^2−, four oxygens at −2 require sulfur at +6.",
    ],
    [
      "How do oxidant and reductant differ?",
      "The oxidant accepts electrons and is reduced; the reductant donates electrons and is oxidised. Track electron or oxidation-number changes.",
    ],
    [
      "How do you balance in acid?",
      "Balance other atoms, use water for oxygen and H+ for hydrogen, then electrons for charge. Recheck atoms and charge after combining halves.",
    ],
    [
      "How do you convert balancing to basic medium?",
      "After balancing in acid, add OH− to both sides to remove H+, then cancel water. This bookkeeping does not prove reaction feasibility.",
    ],
    [
      "What is disproportionation?",
      "One reactant element is both oxidised and reduced in different products. Show one oxidation-number increase and one decrease from the initial value.",
    ],
  ],
  cells: [
    [
      "How is E°cell calculated?",
      "Subtract the anode reduction potential from the cathode reduction potential. Do not multiply potentials by stoichiometric coefficients.",
    ],
    [
      "Where do oxidation and reduction occur?",
      "Oxidation is at the anode and reduction at the cathode in both galvanic and electrolytic cells. Electrode signs depend on operating mode.",
    ],
    [
      "What does a salt bridge carry?",
      "Ions maintain electrical neutrality; electrons move in the external circuit. The bridge is not an electron-conducting wire.",
    ],
    [
      "How does cell potential relate to energy?",
      "ΔG°=−nFE°cell uses the electron count in the balanced reaction. Nonstandard composition can change the actual potential.",
    ],
    [
      "How does electrolysis charge predict product amount?",
      "Q=It, and electron amount is Q/F. Cu2++2e−→Cu needs two moles of electrons per mole of deposited copper.",
    ],
  ],
  equilibrium: [
    [
      "How is K constructed?",
      "Use product activities raised to coefficients divided by reactant activities. Conventional introductory expressions omit pure solids and liquids.",
    ],
    [
      "How does Q predict direction?",
      "Use current composition in the same expression as K. Q<K favours net forward change; Q>K favours net reverse change.",
    ],
    [
      "What changes K?",
      "Temperature changes K for a specified reaction. A catalyst changes approach rate, not equilibrium composition at fixed temperature.",
    ],
    [
      "How does compression affect gas equilibria?",
      "It can favour the side with fewer gas molecules. Adding inert gas must be analysed according to whether volume or pressure is fixed.",
    ],
    [
      "How does an ICE table work?",
      "Record initial, stoichiometric-change and equilibrium quantities. Solve using K, then verify nonnegative amounts and any approximation.",
    ],
  ],
  acids: [
    [
      "How do strong and concentrated differ?",
      "Strong describes extensive dissociation in the solvent; concentrated describes amount per volume. A dilute strong acid is possible.",
    ],
    [
      "When does pH=−log(c) apply?",
      "For a fully dissociated monoprotic acid where water contribution is negligible, [H+]≈c. A 0.0100 M HCl solution then has pH 2.00.",
    ],
    [
      "How do you estimate weak-acid pH?",
      "For small dissociation, [H+]≈√(Kac). Check the assumed small change; otherwise solve the equilibrium expression without that approximation.",
    ],
    [
      "How does a buffer work?",
      "Weak acid consumes added OH− and conjugate base consumes H+. Capacity is finite; exhausting either component defeats the approximation.",
    ],
    [
      "How do you choose an indicator?",
      "Its transition range should lie within the steep pH change near equivalence. Endpoint is an observation, while equivalence is a stoichiometric condition.",
    ],
    [
      "How are conjugate pairs identified?",
      "They differ by one proton, such as NH4+/NH3. Compare strengths within the same solvent rather than treating charge alone as the criterion.",
    ],
  ],
  kinetics: [
    [
      "How is initial rate measured?",
      "Use the early tangent gradient of concentration versus time, with sign and stoichiometric convention stated. A later mean gradient differs.",
    ],
    [
      "How is order determined?",
      "Compare experiments changing one concentration at a time. Doubling concentration and quadrupling rate gives second order in that species.",
    ],
    [
      "How do you find k units?",
      "Rearrange the measured rate law. For rate=k[A]^2 in mol dm−3 s−1, k has units dm3 mol−1 s−1.",
    ],
    [
      "Why does heating increase rate?",
      "The fraction of collisions able to cross the barrier increases. Collision frequency alone is usually an incomplete explanation.",
    ],
    [
      "What changes under catalysis?",
      "An alternative pathway lowers an activation barrier. The catalyst is regenerated overall and does not alter K or reaction Gibbs energy at fixed conditions.",
    ],
  ],
  periodic: [
    [
      "What controls radius across a period?",
      "Effective nuclear attraction generally increases and draws valence electrons closer. Higher occupied shells usually increase size down a group.",
    ],
    [
      "How do ionic and atomic sizes compare?",
      "Cations are usually smaller and anions larger than their parent atoms. Within isoelectronic ions, greater nuclear charge generally means smaller radius.",
    ],
    [
      "How do Period 3 oxides illustrate structure?",
      "They range broadly from ionic/basic through amphoteric to covalent/acidic. Explain actual structures rather than assuming every oxide is molecular.",
    ],
    [
      "How do electronegativity and electron affinity differ?",
      "Electronegativity concerns shared bond electrons; electron affinity is an energy change for electron addition to a gaseous species.",
    ],
    [
      "How should a trend answer be structured?",
      "Link a changing variable to attraction or structure, then to the property. Include subshell and pairing exceptions where relevant.",
    ],
  ],
  group2: [
    [
      "Why does reducing behaviour increase down Group 2?",
      "Greater radius and shielding generally ease outer-electron removal. This trend does not fix the rate of every reaction.",
    ],
    [
      "How do hydroxide and sulfate solubilities differ?",
      "Hydroxide solubility generally increases down Group 2, while sulfate solubility generally decreases. Do not transfer one trend to the other.",
    ],
    [
      "How is sulfate tested?",
      "A suitable acidified barium-salt test gives white BaSO4. Control carbonate interference and write the charged ionic equation.",
    ],
    [
      "How does carbonate stability change?",
      "Smaller, charge-dense cations polarise carbonate more strongly. Thermal stability generally increases down the group.",
    ],
    [
      "What cancels in an ionic equation?",
      "Spectator ions cancel because they appear unchanged on both sides. Retain species needed for atom and charge balance.",
    ],
  ],
  halogens: [
    [
      "How does oxidising ability change down Group 17?",
      "It generally decreases in common aqueous comparisons. Larger electron clouds strengthen dispersion forces, increasing boiling points.",
    ],
    [
      "How does halogen displacement work?",
      "Cl2+2Br−→2Cl−+Br2 illustrates reduction of chlorine and oxidation of bromide. A weaker halogen oxidant does not reverse this under the same ordinary conditions.",
    ],
    [
      "What are silver-halide colours?",
      "AgCl is white, AgBr cream and AgI yellow in the usual test. Acidification controls interference.",
    ],
    [
      "What does ammonia distinguish?",
      "AgCl dissolves in dilute ammonia, AgBr in concentrated ammonia and AgI does not in the standard comparison. Complex formation explains dissolution.",
    ],
    [
      "What is cold-alkali chlorine disproportionation?",
      "Chlorine gives chloride and hypochlorite, changing from zero to −1 and +1. Hot concentrated conditions can yield a different oxidised product.",
    ],
  ],
  ns: [
    [
      "Why is N2 often unreactive?",
      "Its strong triple bond gives high activation barriers. Thermodynamic possibility is not proof of rapid ambient reaction.",
    ],
    [
      "How are Haber conditions a compromise?",
      "Elevated pressure favours ammonia equilibrium yield; lower temperature favours yield but slows reaction. A catalyst helps rate, not K at fixed temperature.",
    ],
    [
      "How does NH3 act as a base?",
      "Its lone pair accepts a proton: NH3+H2O⇌NH4++OH−. Hydroxide is produced by the equilibrium, not pre-existing inside NH3.",
    ],
    [
      "How does SO2 contribute to acidic deposition?",
      "Oxidation and atmospheric reactions can produce acidic species. Evaluate the actual emissions and controls rather than treating all sulfur compounds alike.",
    ],
    [
      "What is the Contact equilibrium?",
      "2SO2+O2⇌2SO3 is exothermic and reduces gas mole total. Explain catalyst and temperature effects separately.",
    ],
  ],
  transition: [
    [
      "What defines a transition element?",
      "Its atom or a cation has an incomplete d subshell. Zinc is excluded in the usual introductory definition because its atom and usual Zn2+ are d10.",
    ],
    [
      "What does coordination number count?",
      "It counts coordinate bonds to the centre, not ligand molecules. Three bidentate ligands can give coordination number six.",
    ],
    [
      "Why can a complex be coloured?",
      "Ligand environments split d-orbital energies and absorption can cause transitions. Oxidation state and ligand identity affect colour; not every complex is coloured.",
    ],
    [
      "How do substitution and redox differ?",
      "Ligand exchange can leave oxidation state unchanged; redox changes it. A colour change alone does not decide which occurred.",
    ],
    [
      "How can variable oxidation states aid catalysis?",
      "The metal can participate in intermediate steps and be regenerated. A plausible cycle is required; element category alone does not establish catalytic activity.",
    ],
  ],
  organicBasics: [
    [
      "How is a parent chain chosen?",
      "Use priority functional-group and unsaturation rules before numbering. The visually longest chain is not always the correct parent.",
    ],
    [
      "How do structural and stereoisomers differ?",
      "Structural isomers differ in connectivity; stereoisomers retain it but differ spatially. Molecular formula alone identifies neither.",
    ],
    [
      "How do heterolytic and homolytic fission differ?",
      "Heterolysis gives both electrons to one fragment; homolysis gives one to each. Use full-headed versus half-headed arrows accordingly.",
    ],
    [
      "How do nucleophiles and electrophiles differ?",
      "A nucleophile donates an electron pair and an electrophile accepts one. Identify the actual reactive site and its electron availability.",
    ],
    [
      "Where should a curved arrow start?",
      "At an electron pair or bond, ending where those electrons form a bond or lone pair. It does not indicate motion of a positive charge.",
    ],
  ],
  hydrocarbons: [
    [
      "How does radical substitution begin?",
      "Light can homolytically cleave a halogen bond. Initiation makes radicals, propagation regenerates them and termination combines them.",
    ],
    [
      "Why can alkane halogenation give mixtures?",
      "Different sites and repeated substitution yield multiple products. A selected major product needs selectivity and conditions justified.",
    ],
    [
      "How does alkene electrophilic addition begin?",
      "The π system donates to an electrophile. Intermediate capture and regioselectivity depend on substrate and reagent.",
    ],
    [
      "What does bromine decolourisation show?",
      "It supports reaction with suitable unsaturation but does not uniquely identify an alkene. Aromatic rings do not behave like isolated C=C bonds.",
    ],
    [
      "How does complete combustion differ?",
      "With sufficient oxygen, hydrocarbons form CO2 and water. Incomplete combustion may produce CO or carbon; balance the actual proposed products.",
    ],
  ],
  substitution: [
    [
      "What makes SN2 concerted?",
      "Bond formation and departure share one elementary step. Backside attack can invert a stereocentre; steric crowding inhibits the common pathway.",
    ],
    [
      "What characterises SN1?",
      "Ionisation precedes nucleophile capture in the simple model. Carbocation stability and rearrangements matter; exactly racemic products are not guaranteed.",
    ],
    [
      "How can solvent influence substitution?",
      "Polar aprotic media often help anionic SN2 nucleophiles; ionising protic media can help suitable SN1 substrates. These are contextual trends.",
    ],
    [
      "How can hydroxide cause different products?",
      "Aqueous hydroxide commonly gives substitution, whereas hot alcoholic base can favour elimination. State substrate, solvent and temperature.",
    ],
    [
      "Why is leaving-group ability separate from polarity?",
      "Departure requires accommodation of the bonding electrons. Bond strength, anion stability and solvation matter, not just C–X polarity.",
    ],
  ],
  alcohols: [
    [
      "How are primary, secondary and tertiary assigned?",
      "Count carbon groups attached to the carbon bearing OH. This classification is not the number of OH groups in the molecule.",
    ],
    [
      "What are usual oxidation products?",
      "Primary alcohols can give aldehydes then acids; secondary give ketones. Tertiary alcohols resist the simple oxidation without C–C cleavage.",
    ],
    [
      "Why use distillation versus reflux?",
      "Distillation can remove an aldehyde before further oxidation. Reflux returns condensed vapour for sustained heating; it does not imply unlimited temperature.",
    ],
    [
      "How does dehydration form an alkene?",
      "Suitable acid and heating eliminate water. Regiochemistry and rearrangements depend on substrate and conditions.",
    ],
    [
      "How do ethers differ?",
      "An ether has C–O–C rather than O–H. It can accept hydrogen bonds but lacks an O–H donor, affecting boiling behaviour.",
    ],
  ],
  carbonyl: [
    [
      "Why is the carbonyl carbon electrophilic?",
      "Oxygen polarises the C=O bond. Show its π electrons moving to O as a nucleophile bonds to carbon.",
    ],
    [
      "How do aldehydes and ketones differ?",
      "An aldehyde carbonyl has at least one attached hydrogen; a ketone has two carbon groups. This affects oxidation and addition behaviour.",
    ],
    [
      "What does 2,4-DNPH establish?",
      "A precipitate supports an aldehyde or ketone in the conventional test. It does not distinguish them or uniquely identify the molecule.",
    ],
    [
      "What does Tollens reagent commonly detect?",
      "Aldehydes commonly reduce the silver complex while oxidising, producing silver. Most simple ketones do not; acknowledge test exceptions.",
    ],
    [
      "What does carbonyl reduction give?",
      "Appropriate hydride reduction gives primary alcohols from aldehydes and secondary from ketones after workup. Include protonation of an alkoxide intermediate.",
    ],
  ],
  carboxyl: [
    [
      "Why is a carboxylic acid acidic?",
      "Its conjugate base is stabilised by delocalisation over two oxygens. Explain base stabilisation rather than just oxygen presence.",
    ],
    [
      "How do esterification and neutralisation differ?",
      "Acid plus alcohol can reversibly form ester and water under acid catalysis. Base neutralisation instead forms carboxylate.",
    ],
    [
      "How do ester hydrolysis conditions matter?",
      "Acidic hydrolysis gives acid and alcohol reversibly; basic hydrolysis gives carboxylate and alcohol. Neutral acid requires acid workup.",
    ],
    [
      "Why are acyl chlorides reactive?",
      "Their electron-poor acyl carbon accepts nucleophiles and chloride can leave. Predictions are not laboratory authorisation.",
    ],
    [
      "How does acyl substitution differ from simple carbonyl addition?",
      "Addition to carbonyl is followed by elimination of a leaving group. Aldehydes and ketones lack the same suitable acyl leaving group.",
    ],
  ],
  amines: [
    [
      "How do amines act as bases?",
      "A nitrogen lone pair accepts a proton. Resonance, substituents and solvation affect basicity, so aniline differs from aliphatic amines.",
    ],
    [
      "Why are amides less basic?",
      "Nitrogen lone-pair delocalisation into the carbonyl reduces its availability. The shared nitrogen atom does not imply equal basicity.",
    ],
    [
      "How does nitrile hydrolysis depend on medium?",
      "Appropriate acid or base and heating give acid or carboxylate products. Include nitrogen coproducts and any acid workup.",
    ],
    [
      "How can CN− lengthen a carbon chain?",
      "Substitution introduces the nitrile carbon, increasing carbon count by one. Track that carbon through later reduction or hydrolysis.",
    ],
    [
      "How do amino-acid forms depend on pH?",
      "Protonation of amino and carboxyl groups changes with pH. Zwitterions can predominate; one neutral drawing is not always the solution form.",
    ],
  ],
  polymers: [
    [
      "How is an addition repeat unit drawn?",
      "Convert the monomer C=C into backbone single-bond connectivity, retaining substituents. Continuation bonds cross brackets; the original double bond is not retained.",
    ],
    [
      "What forms a condensation polymer?",
      "Bifunctional monomers give repeated links, commonly eliminating a small molecule. Identify reactive groups and ester or amide links.",
    ],
    [
      "How do you recover polyester monomers?",
      "Conceptually hydrolyse ester links. Alkaline conditions initially give carboxylates, not neutral acids.",
    ],
    [
      "What controls polymer properties?",
      "Flexibility, branching, crystallinity, crosslinks and intermolecular forces affect behaviour. One functional group cannot predict every property.",
    ],
    [
      "How do degradability and recyclability differ?",
      "Degradation depends on conditions and pathways; recycling also depends on sorting and processing. Avoid unsupported environmental labels.",
    ],
  ],
  synthesis: [
    [
      "How do you plan a route?",
      "Work backwards from target skeleton and functional group, then write a feasible forward sequence. Specify reagents, conditions and workup.",
    ],
    [
      "Why is chemoselectivity important?",
      "Several functional groups may react. Justify intended selectivity or protection rather than assuming only the desired site changes.",
    ],
    [
      "How do step yields combine?",
      "Multiply fractional yields. Two steps each at 80% give 0.80×0.80=64% overall, not 160%.",
    ],
    [
      "How should routes be compared?",
      "Consider selectivity, steps, hazards, energy, waste and purification. A short route is not necessarily the safest or highest-yielding.",
    ],
    [
      "What validates a product prediction?",
      "Structure, charge and atom balance are necessary checks, but analytical evidence must distinguish isomers. Valid SMILES does not prove synthesis occurred.",
    ],
  ],
  spectroscopy: [
    [
      "How do you interpret IR?",
      "Use diagnostic functional-group regions with formula and complementary data. One peak rarely establishes the complete structure.",
    ],
    [
      "What does a molecular ion show?",
      "A suitable ion assignment can indicate molecular mass. Fragmentation and isotopes add evidence; a weak molecular ion is not proof of a different formula.",
    ],
    [
      "What determines NMR signal count?",
      "Distinct environments under the experiment conditions, including symmetry and rapid exchange. Drawn positions are not necessarily distinct.",
    ],
    [
      "How do integration and splitting differ?",
      "Integration gives relative proton numbers; simple n+1 splitting applies only to appropriate first-order coupling. Exchange and complex coupling limit the shortcut.",
    ],
    [
      "How is chromatography interpreted?",
      "Distribution between phases gives separation. Rf and retention depend on conditions; matched standards strengthen identification.",
    ],
  ],
  stereochemistry: [
    [
      "How is R/S assigned?",
      "Rank by sequence rules, orient lowest priority away, then follow 1→2→3. Clockwise is R in that orientation; reverse the view and apparent direction changes.",
    ],
    [
      "How is E/Z assigned?",
      "Choose higher priority at each alkene carbon. Opposite sides give E and same side Z; each carbon needs distinguishable substituents.",
    ],
    [
      "How do enantiomers and diastereomers differ?",
      "Enantiomers are nonsuperimposable mirror images. Diastereomers are stereoisomers that are not mirror images.",
    ],
    [
      "How can stereocentres occur in an achiral compound?",
      "Internal symmetry can make the whole molecule superimposable on its mirror image. Such meso compounds show why centre counting alone is insufficient.",
    ],
    [
      "What is a racemate?",
      "Equal amounts of enantiomers have cancelling optical rotations. Zero observed rotation alone does not prove a racemic composition.",
    ],
  ],
  elimination: [
    [
      "What occurs in E2?",
      "Base removes a β hydrogen as the leaving group departs and a π bond forms. Antiperiplanar alignment commonly affects accessibility.",
    ],
    [
      "What occurs in E1?",
      "The simple model uses carbocation formation then deprotonation. Rearrangement and competing substitution may occur.",
    ],
    [
      "Where is a β hydrogen?",
      "It lies on a carbon adjacent to the carbon bearing the leaving group. Check its presence and suitable alignment before predicting an alkene.",
    ],
    [
      "How can bulky base affect selectivity?",
      "Removal of a more accessible proton can alter product ratios. The most substituted alkene is not universally predominant.",
    ],
    [
      "How do you compare competing pathways?",
      "Combine substrate, base/nucleophile, sterics, solvent and temperature. A single reagent keyword cannot determine SN1/SN2/E1/E2.",
    ],
  ],
  aromatic: [
    [
      "What is simple Hückel aromaticity?",
      "A cyclic, sufficiently planar, continuously conjugated system has 4n+2 π electrons. Alternating drawn bonds alone do not establish aromaticity.",
    ],
    [
      "Why does benzene favour substitution?",
      "Substitution can restore aromatic conjugation after intermediate formation. Simple addition would lose stabilisation.",
    ],
    [
      "What electrophile nitrates benzene?",
      "Suitable acid conditions generate NO2+. Attack followed by deprotonation restores aromaticity; preserve charge and nitrogen valence.",
    ],
    [
      "How do directing and activating effects differ?",
      "Substituents affect both rate and preferred position. Halogens are commonly deactivating but ortho/para-directing.",
    ],
    [
      "How does phenol differ from an aliphatic alcohol?",
      "Its OH is directly attached to an aromatic carbon. Delocalisation stabilises phenoxide and affects ring reactivity.",
    ],
  ],
  alkynes: [
    [
      "What bonds make C≡C?",
      "One σ and two π bonds, with approximately linear local sp geometry. The triple bond points along one VSEPR domain.",
    ],
    [
      "Can hydroxide quantitatively make an acetylide?",
      "Not from a typical terminal alkyne; a much stronger base is needed. Compare acid/base strengths in the relevant solvent.",
    ],
    [
      "How do acetylides make C–C bonds?",
      "Substitution on appropriate unhindered electrophiles can extend the chain. Crowding and elimination limit substrate choices.",
    ],
    [
      "How do selective reductions differ?",
      "Poisoned-catalyst hydrogenation commonly gives cis alkene; suitable dissolving-metal conditions can give trans. Ordinary excess hydrogenation can continue to alkane.",
    ],
    [
      "Why does hydration involve tautomerisation?",
      "An initial enol can rearrange to a carbonyl compound. Product position depends on hydration method.",
    ],
  ],
  enolates: [
    [
      "Where is an α carbonyl proton?",
      "On the carbon adjacent to carbonyl carbon. Deprotonation gives an enolate with charge delocalisation; the aldehydic proton is different.",
    ],
    [
      "How do enol and enolate differ?",
      "An enol is neutral and an enolate anionic. Their related acid/base chemistry does not make their charge states interchangeable.",
    ],
    [
      "What bond forms in aldol addition?",
      "An enol/enolate attacks a carbonyl to form a C–C bond and β-hydroxy carbonyl product. Dehydration is a separate step.",
    ],
    [
      "How do kinetic and thermodynamic enolates differ?",
      "Conditions can favour faster deprotonation or equilibration to greater stability. State base, solvent, temperature and reversibility.",
    ],
    [
      "Why can crossed aldols be mixtures?",
      "Multiple enolisable partners can self-react and cross-react. Selecting a non-enolisable electrophile or preformed enolate can improve control.",
    ],
  ],
  conjugation: [
    [
      "What is needed for conjugation?",
      "Adjacent overlapping p orbitals permit delocalisation. A saturated tetrahedral carbon can interrupt the sequence.",
    ],
    [
      "What stabilises an allylic intermediate?",
      "Valid contributors distribute radical or charge character over several sites. Retain skeleton and total charge.",
    ],
    [
      "Why can dienes give 1,2 and 1,4 addition?",
      "An allylic intermediate permits capture at different sites. Rates, reversibility and conditions determine ratios.",
    ],
    [
      "What forms in Diels–Alder?",
      "A suitable conjugated diene and dienophile form a six-membered ring in the usual concerted model. Track bonds and stereochemistry.",
    ],
    [
      "How can conjugation affect colour?",
      "It changes electronic-energy separations and absorption. Predicting visible colour requires chromophore and environmental evidence.",
    ],
  ],
  practical: [
    [
      "How do accuracy and precision differ?",
      "Accuracy concerns a reference value; precision concerns repeat spread. Repetition does not remove systematic calibration error.",
    ],
    [
      "How do you report measurement uncertainty?",
      "Use the actual instrument and procedure. A titre uses two burette readings; account for both, not one.",
    ],
    [
      "How do you evaluate a graph?",
      "Choose model-justified variables, units and residual inspection. A straight-looking graph does not prove causation or remove uncertainty.",
    ],
    [
      "What belongs in a risk assessment?",
      "Identify substance, exposure, scale, hazard, controls and disposal. An AI prediction cannot replace an approved procedure.",
    ],
    [
      "How do you handle anomalies?",
      "Use a stated criterion and retain traceability. Do not silently discard inconvenient values.",
    ],
  ],
  materials: [
    [
      "What carries charge in metals and molten salts?",
      "Delocalised electrons carry metallic current; mobile ions carry molten-salt current. A solid ionic lattice usually lacks mobile carriers.",
    ],
    [
      "Why can metals deform?",
      "Layers can move while metallic bonding persists. Ionic displacement can bring like charges adjacent and cause fracture.",
    ],
    [
      "How do network and molecular solids differ?",
      "Network solids have extended strong bonding; molecular solids contain discrete molecules with intermolecular attractions.",
    ],
    [
      "Why do graphite and diamond differ?",
      "Graphite has delocalised electrons and layers; diamond has a 3D σ network. Element identity alone does not determine conductivity.",
    ],
    [
      "How do you evaluate a material choice?",
      "Connect structure to required properties, lifetime, processing and disposal. Define a comparison before claiming sustainability.",
    ],
  ],
};

export function extraCards(key: string, moduleId: string): Flashcard[] {
  // Preserve explicit AS and IB scope rather than inserting unrelated A2 material.
  if (moduleId === "ALEVEL-19") key = "nitriles";
  let entries = DETAILS[key] || [];
  if (moduleId === "ALEVEL-22")
    entries = DETAILS.spectroscopy.slice(0, 2).concat(DETAILS.analysisAS);
  if (moduleId === "IB-S2.3") entries = DETAILS.materials;
  if (moduleId === "IB-S1.1") entries = DETAILS.classification;
  if (moduleId === "IB-S2.1") entries = DETAILS.ionic;
  if (moduleId === "IB-R1.3")
    entries = DETAILS.energy.concat(DETAILS.hydrocarbons.slice(4));
  if (moduleId === "ALEVEL-32")
    entries = DETAILS.alcohols.concat(DETAILS.aromatic.slice(4));
  if (moduleId === "UNDERGRAD-F5")
    entries = DETAILS.equilibrium.concat(DETAILS.kinetics);
  return entries.map(([term, definition], i) => ({
    id: `${moduleId}:extra:${i}`,
    term,
    definition,
  }));
}

DETAILS.nitriles = [
  [
    "What defines a nitrile?",
    "R–C≡N contains a carbon–nitrogen triple bond and differs from an amine. Include the nitrile carbon when counting the carbon chain.",
  ],
  [
    "How can cyanide extend a chain?",
    "Substitution of a suitable halogenoalkane introduces the CN carbon. Later hydrolysis turns that carbon into the carboxyl carbon.",
  ],
  [
    "What does acidic hydrolysis give?",
    "Appropriate aqueous acid and heating give a carboxylic acid and ammonium species. Include water and charged coproducts when balancing.",
  ],
  [
    "What does basic hydrolysis initially give?",
    "A carboxylate and nitrogen-containing coproduct under suitable conditions. Acidification is a separate workup if a neutral acid is wanted.",
  ],
  [
    "How is a synthesis answer checked?",
    "State substrate, reagent, conditions and product class. Check carbon count and distinguish nitrile from amine connectivity.",
  ],
];
DETAILS.analysisAS = [
  [
    "How do halogen isotope patterns help?",
    "Appropriate chlorine- or bromine-containing ions can show characteristic M and M+2 patterns. Interpret ion assignment and relative intensities, not spacing alone.",
  ],
  [
    "Why combine independent analytical methods?",
    "IR supports functional groups while mass spectra provide mass and fragmentation evidence. Combine these with formula and tests rather than claiming identification from one signal.",
  ],
  [
    "Where do NMR and chromatography belong in this course?",
    "Detailed NMR and chromatography are A2 module 37, not the AS analytical requirements here. Distinguish further reading from required assessment scope.",
  ],
];
DETAILS.classification = [
  [
    "How do elements, compounds and mixtures differ?",
    "Elements have one atomic-number type, compounds chemically combine elements in defined composition, and mixtures have physically combined components with variable composition.",
  ],
  [
    "What changes in a phase transition?",
    "Arrangement and energy change without necessarily changing chemical identity. Pure water boiling does not itself split H2O into its elements.",
  ],
  [
    "What do particle pictures represent?",
    "They model arrangements and mobility. Heating does not mean individual particles physically expand to fill a container.",
  ],
  [
    "How is a separation method selected?",
    "Use a property difference: filtration for an appropriate insoluble solid, distillation for volatility, or chromatography for phase distribution. State the method limitations.",
  ],
  [
    "How do observation and interpretation differ?",
    "Observations describe measured or seen results; a particle model explains them. Do not report an inferred molecular structure as directly observed.",
  ],
];
DETAILS.ionic = [
  [
    "Why is an ionic lattice not a collection of molecules?",
    "Electrostatic attractions extend through the crystal. A formula such as NaCl describes a simplest ion ratio, not isolated paired molecules in the solid.",
  ],
  [
    "How do ionic charges determine formula?",
    "Choose ion numbers that give overall neutrality. Mg2+ and Cl− require a 1:2 ratio, giving MgCl2.",
  ],
  [
    "Why can molten ionic compounds conduct?",
    "Mobile ions carry charge. Ions are constrained in an ordinary solid lattice, so solid conductivity is typically poor.",
  ],
  [
    "Why can ionic crystals be brittle?",
    "Layer displacement can bring like charges adjacent and cause repulsion. This differs from the nondirectional bonding explanation for metallic malleability.",
  ],
  [
    "Does ionic bonding guarantee water solubility?",
    "No. Solubility depends on competing lattice and solvation effects and conditions; not every ionic solid dissolves appreciably.",
  ],
];
