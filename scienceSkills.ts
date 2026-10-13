export const SCIENCE_SKILLS = [
  {
    name: "RDKit",
    description:
      "Learn graph sanitization, aromaticity, formal charges, stereochemistry, and 2D/3D depiction workflows. CarbonCanvas uses RDKit.js for its structure checks.",
    href: "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/rdkit",
    accent: "",
  },
  {
    name: "Scientific critical thinking",
    description:
      "Keep claims traceable to evidence and separate model predictions from experimental conclusions.",
    href: "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/skills/scientific-critical-thinking",
    accent: "",
  },
  {
    name: "PubChem",
    description:
      "Resolve compounds, inspect properties, safety data, structures, and related molecules.",
    href: "https://github.com/google-deepmind/science-skills/tree/main/skills/pubchem_database",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    name: "ChEMBL",
    description:
      "Explore curated bioactive compounds, targets, mechanisms, and medicinal chemistry data.",
    href: "https://github.com/google-deepmind/science-skills/tree/main/skills/chembl_database",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    name: "Protein Data Bank",
    description:
      "Find experimental 3D structures and inspect ligands, chains, and molecular assemblies.",
    href: "https://github.com/google-deepmind/science-skills/tree/main/skills/pdb_database",
    accent: "from-violet-500 to-purple-600",
  },
  {
    name: "PyMOL",
    description:
      "Follow reproducible molecular visualization workflows for structures and organic ligands.",
    href: "https://github.com/google-deepmind/science-skills/tree/main/skills/pymol",
    accent: "from-orange-500 to-rose-600",
  },
] as const;
