import type { MoleculeData } from "../types";
const geometrySource =
  "https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf#page=21";
type Reference = Omit<MoleculeData, "atoms" | "bonds"> & { aliases: string[] };
const geometry = (shape: string, angle: string, note: string) => ({
  shape,
  angle,
  note,
  sourceUrl: geometrySource,
});
export const REFERENCE_MOLECULES: Reference[] = [
  {
    name: "Benzene",
    aliases: ["benzene", "c6h6"],
    smiles: "c1ccccc1",
    formula: "C6H6",
    description:
      "A planar aromatic ring with six delocalised π electrons. The six C–C bonds are equivalent; the Kekulé drawing is a representation.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/15-3-aromaticity-and-the-huckel-4n-2-rule",
    geometry: geometry(
      "Trigonal planar at each carbon",
      "approximately 120°",
      "Aromatic carbons are sp². The drawing does not measure physical bond lengths.",
    ),
  },
  {
    name: "Methane",
    aliases: ["methane", "ch4"],
    smiles: "C",
    formula: "CH4",
    description:
      "Four C–H σ bonds surround the central carbon in a tetrahedral molecular geometry.",
    provenance: "reference",
    sourceUrl: geometrySource,
    geometry: geometry(
      "Tetrahedral",
      "109.5°",
      "The 2D depiction is a projection; the four bonds are not coplanar.",
    ),
  },
  {
    name: "Water",
    aliases: ["water", "h2o"],
    smiles: "O",
    formula: "H2O",
    description:
      "Two O–H bonds and two lone pairs give a bent shape with tetrahedral electron-domain geometry.",
    provenance: "reference",
    sourceUrl: geometrySource,
    geometry: geometry(
      "Bent",
      "104.5°",
      "Lone pairs compress the bond angle relative to a regular tetrahedron.",
    ),
  },
  {
    name: "Ammonia",
    aliases: ["ammonia", "nh3"],
    smiles: "N",
    formula: "NH3",
    description:
      "Three N–H bonds and one nitrogen lone pair give a trigonal pyramidal molecule.",
    provenance: "reference",
    sourceUrl: geometrySource,
    geometry: geometry(
      "Trigonal pyramidal",
      "approximately 107°",
      "This is a rounded syllabus value, not a measurement from the screen.",
    ),
  },
  {
    name: "Carbon dioxide",
    aliases: ["carbon dioxide", "co2"],
    smiles: "O=C=O",
    formula: "CO2",
    description:
      "Two carbon–oxygen double bonds form a linear molecule. The bond dipoles cancel in the symmetric structure.",
    provenance: "reference",
    sourceUrl: geometrySource,
    geometry: geometry(
      "Linear",
      "180°",
      "Each double bond counts as one electron domain in VSEPR.",
    ),
  },
  {
    name: "Boron trifluoride",
    aliases: ["boron trifluoride", "bf3"],
    smiles: "FB(F)F",
    formula: "BF3",
    description:
      "An electron-deficient boron centre is surrounded by three fluorine atoms in a planar arrangement.",
    provenance: "reference",
    sourceUrl: geometrySource,
    geometry: geometry(
      "Trigonal planar",
      "120°",
      "Boron has six electrons in this simple Lewis model; the octet rule has exceptions.",
    ),
  },
  {
    name: "Ethene",
    aliases: ["ethene", "ethylene", "c2h4"],
    smiles: "C=C",
    formula: "C2H4",
    description:
      "A C=C double bond has one σ bond and one π bond. Each carbon is approximately trigonal planar.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/1-8-sp2-hybrid-orbitals-and-the-structure-of-ethylene",
    geometry: geometry(
      "Trigonal planar at each carbon",
      "approximately 120°",
      "A π bond restricts rotation; not all individual bond angles are exactly 120°.",
    ),
  },
  {
    name: "Ethyne",
    aliases: ["ethyne", "acetylene", "c2h2"],
    smiles: "C#C",
    formula: "C2H2",
    description:
      "The carbon–carbon triple bond contains one σ and two π bonds.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/1-9-sp-hybrid-orbitals-and-the-structure-of-acetylene",
    geometry: geometry(
      "Linear",
      "180°",
      "sp-hybridised carbons lie on a linear bond axis.",
    ),
  },
  {
    name: "Ethanol",
    aliases: ["ethanol", "c2h5oh"],
    smiles: "CCO",
    formula: "C2H6O",
    description:
      "A primary alcohol containing a terminal hydroxyl group. Its exact angles depend on conformation; no measured angle is assigned here.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/17-1-naming-alcohols-and-phenols",
  },
  {
    name: "Ethanoic acid",
    aliases: ["ethanoic acid", "acetic acid", "ch3cooh"],
    smiles: "CC(=O)O",
    formula: "C2H4O2",
    description:
      "A carboxylic acid whose conjugate base is stabilised by resonance over the two oxygen atoms.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/20-2-structure-and-properties-of-carboxylic-acids",
  },
  {
    name: "Ethyl ethanoate",
    aliases: ["ethyl ethanoate", "ethyl acetate"],
    smiles: "CCOC(C)=O",
    formula: "C4H8O2",
    description:
      "An ester formed in the reversible acid-catalysed reaction of ethanoic acid and ethanol, with water as a coproduct.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/21-6-chemistry-of-esters",
  },
  {
    name: "Nitrobenzene",
    aliases: ["nitrobenzene"],
    smiles: "O=[N+]([O-])c1ccccc1",
    formula: "C6H5NO2",
    description:
      "The nitro group requires formal charges in its common Lewis contributors. Charge separation is retained in this structure.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/chemistry-2e/pages/7-4-formal-charges-and-resonance",
  },
  {
    name: "Bromomethane",
    aliases: ["bromomethane", "methyl bromide", "ch3br"],
    smiles: "CBr",
    formula: "CH3Br",
    description:
      "A methyl halide used as a simple substrate when learning SN2 substitution.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/11-3-characteristics-of-the-sn2-reaction",
  },
  {
    name: "Methanol",
    aliases: ["methanol", "ch3oh"],
    smiles: "CO",
    formula: "CH4O",
    description:
      "The simplest alcohol; a potential product of hydroxide substitution on a methyl halide.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/organic-chemistry/pages/17-1-naming-alcohols-and-phenols",
  },
  {
    name: "Hydroxide",
    aliases: ["hydroxide", "oh-"],
    smiles: "[OH-]",
    formula: "OH-",
    description:
      "An anionic oxygen species with one hydrogen and a formal negative charge.",
    provenance: "reference",
    sourceUrl:
      "https://openstax.org/books/chemistry-2e/pages/7-4-formal-charges-and-resonance",
  },
];
export function getReference(input: string): MoleculeData | undefined {
  const item = REFERENCE_MOLECULES.find((m) =>
    m.aliases.includes(input.toLowerCase().trim()),
  );
  if (!item) return undefined;
  const { aliases: _aliases, ...molecule } = item;
  return { ...molecule, atoms: [], bonds: [] };
}
