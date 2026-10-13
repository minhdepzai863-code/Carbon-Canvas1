export const SCIENCE_SKILLS = [
  {
    name: 'PubChem',
    description: 'Resolve compounds, inspect properties, safety data, structures, and related molecules.',
    href: 'https://github.com/google-deepmind/science-skills/tree/main/skills/pubchem_database',
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'ChEMBL',
    description: 'Explore curated bioactive compounds, targets, mechanisms, and medicinal chemistry data.',
    href: 'https://github.com/google-deepmind/science-skills/tree/main/skills/chembl_database',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Protein Data Bank',
    description: 'Find experimental 3D structures and inspect ligands, chains, and molecular assemblies.',
    href: 'https://github.com/google-deepmind/science-skills/tree/main/skills/pdb_database',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    name: 'PyMOL',
    description: 'Follow reproducible molecular visualization workflows for structures and organic ligands.',
    href: 'https://github.com/google-deepmind/science-skills/tree/main/skills/pymol',
    accent: 'from-orange-500 to-rose-600',
  },
] as const;
