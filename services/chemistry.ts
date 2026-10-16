import initRDKit, { type MainModule } from "@rdkit/rdkit";
import wasmUrl from "@rdkit/rdkit/RDKit_minimal.wasm?url";
import type { MoleculeData } from "../types";

let toolkit: Promise<MainModule> | undefined;
export function getToolkit() {
  if (!toolkit)
    toolkit = initRDKit({ locateFile: () => wasmUrl }).catch((error) => {
      toolkit = undefined;
      throw error;
    });
  return toolkit;
}
const pad = (n: number) => String(n).padStart(3);
const ELEMENTS = new Set(
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(
    " ",
  ),
);
export function graphToMolblock(data: MoleculeData): string {
  if (!data.atoms.length || data.atoms.length > 999 || data.bonds.length > 999)
    throw new Error(
      "Use a nonempty molecule with fewer than 1000 atoms and bonds.",
    );
  const ids = new Map(data.atoms.map((a, i) => [a.id, i + 1]));
  if (ids.size !== data.atoms.length)
    throw new Error("Atom IDs must be unique.");
  const pairs = new Set<string>();
  const atoms = data.atoms.map((a) => {
    if (!/^[A-Z][a-z]?$/.test(a.element))
      throw new Error(`Invalid element symbol: ${a.element}`);
    return `    0.0000    0.0000    0.0000 ${a.element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`;
  });
  const bonds = data.bonds.map((b) => {
    const s = ids.get(b.source),
      t = ids.get(b.target);
    const key = [s, t].sort((a, b) => (a || 0) - (b || 0)).join(":");
    if (
      !s ||
      !t ||
      s === t ||
      pairs.has(key) ||
      ![1, 2, 3, 4].includes(b.order)
    )
      throw new Error("Invalid, duplicate, or dangling bond.");
    pairs.add(key);
    return `${pad(s)}${pad(t)}${pad(b.order)}${pad(b.stereo === "wedge" ? 1 : b.stereo === "dash" ? 6 : 0)}  0  0  0`;
  });
  const charges = data.atoms.flatMap((a, i) =>
    a.formalCharge ? [[i + 1, a.formalCharge]] : [],
  );
  const chargeLines: string[] = [];
  for (let i = 0; i < charges.length; i += 8) {
    const group = charges.slice(i, i + 8);
    chargeLines.push(
      `M  CHG${pad(group.length)}${group.map(([id, charge]) => `${String(id).padStart(4)}${String(charge).padStart(4)}`).join("")}`,
    );
  }
  return [
    "CarbonCanvas",
    "  RDKit",
    "",
    "" +
      pad(atoms.length) +
      pad(bonds.length) +
      "  0  0  0  0            999 V2000",
    ...atoms,
    ...bonds,
    ...chargeLines,
    "M  END",
  ].join("\n");
}

export async function normalizeMolecule(
  data: MoleculeData,
): Promise<MoleculeData> {
  const rdkit = await getToolkit();
  const mol = rdkit.get_mol(data.smiles?.trim() || graphToMolblock(data));
  if (!mol?.is_valid()) {
    mol?.delete();
    throw new Error(
      "This structure could not pass the valence and aromaticity checks. Check bonds, formal charges, and SMILES.",
    );
  }
  try {
    mol.set_new_coords(true);
    const raw = JSON.parse(mol.get_json());
    const graph = raw.molecules[0];
    const atomDefault = raw.defaults.atom;
    const bondDefault = raw.defaults.bond;
    const block = mol.get_v2Kmolblock().split("\n");
    const coords = block.slice(4, 4 + graph.atoms.length);
    const table: Record<number, string> = {
      1: "H",
      5: "B",
      6: "C",
      7: "N",
      8: "O",
      9: "F",
      11: "Na",
      12: "Mg",
      14: "Si",
      15: "P",
      16: "S",
      17: "Cl",
      19: "K",
      20: "Ca",
      26: "Fe",
      29: "Cu",
      30: "Zn",
      35: "Br",
      53: "I",
    };
    const atoms = graph.atoms.map(
      (a: { z?: number; chg?: number; impHs?: number }, i: number) => ({
        id: `a${i}`,
        element: table[a.z ?? atomDefault.z] || coords[i].slice(31, 34).trim(),
        formalCharge: a.chg ?? atomDefault.chg ?? 0,
        implicitHydrogens: a.impHs ?? atomDefault.impHs ?? 0,
        x: Number(coords[i].slice(0, 10)),
        y: Number(coords[i].slice(10, 20)),
      }),
    );
    const bonds = graph.bonds.map(
      (b: { atoms: [number, number]; bo?: number }) => ({
        source: `a${b.atoms[0]}`,
        target: `a${b.atoms[1]}`,
        order: b.bo ?? bondDefault.bo,
      }),
    );
    const counts: Record<string, number> = {};
    let totalCharge = 0;
    for (const a of atoms) {
      counts[a.element] = (counts[a.element] || 0) + 1;
      if (a.implicitHydrogens) counts.H = (counts.H || 0) + a.implicitHydrogens;
      totalCharge += a.formalCharge;
    }
    const elements = Object.keys(counts).sort((a, b) => {
      if (!counts.C) return a.localeCompare(b);
      const rank = (s: string) => (s === "C" ? 0 : s === "H" ? 1 : 2);
      return rank(a) - rank(b) || a.localeCompare(b);
    });
    const formula =
      elements.map((el) => el + (counts[el] === 1 ? "" : counts[el])).join("") +
      (totalCharge
        ? "^" +
          (Math.abs(totalCharge) === 1 ? "" : Math.abs(totalCharge)) +
          (totalCharge > 0 ? "+" : "-")
        : "");
    return {
      ...data,
      name: data.name || "Molecule",
      formula,
      smiles: mol.get_smiles(),
      atoms,
      bonds,
    };
  } finally {
    mol.delete();
  }
}

export async function depictMolecule(data: MoleculeData, explicitH = false) {
  const rdkit = await getToolkit();
  const mol = rdkit.get_mol(data.smiles || graphToMolblock(data));
  if (!mol?.is_valid()) {
    mol?.delete();
    throw new Error(
      "Unable to render this structure. Check its bonds and charges.",
    );
  }
  try {
    if (explicitH) mol.add_hs_in_place();
    mol.set_new_coords(true);
    return mol.get_svg_with_highlights(
      JSON.stringify({
        width: 640,
        height: 360,
        bondLineWidth: 1.8,
        backgroundColour: [1, 1, 1, 0],
        clearBackground: false,
        fixedFontSize: 20,
        padding: 0.12,
        addStereoAnnotation: true,
      }),
    );
  } finally {
    mol.delete();
  }
}

// Formula equation check deliberately accepts only explicit integer-coefficient formula equations.
// Reversible arrows and ionic charges are supported; qualitative names are not certified.
export function formulaInventory(
  formula: string,
): { atoms: Record<string, number>; charge: number } | null {
  const withoutState = formula.trim().replace(/\((?:s|l|g|aq)\)$/, "");
  const chargeMatch = withoutState.match(/\^(\d*)([+-])$/);
  let charge = chargeMatch
    ? Number(chargeMatch[1] || 1) * (chargeMatch[2] === "+" ? 1 : -1)
    : 0;
  let body = chargeMatch
    ? withoutState.slice(0, -chargeMatch[0].length)
    : withoutState;
  if (!chargeMatch && /[+-]$/.test(body)) {
    charge = body.endsWith("+") ? 1 : -1;
    body = body.slice(0, -1);
  }
  const tokens = body.match(/[A-Z][a-z]?|\d+|[()]/g);
  if (!tokens || tokens.join("") !== body) return null;
  const stack: Record<string, number>[] = [{}];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "(") stack.push({});
    else if (token === ")") {
      if (stack.length < 2) return null;
      const inner = stack.pop()!;
      const factor = /^\d+$/.test(tokens[i + 1] || "")
        ? Number(tokens[++i])
        : 1;
      if (factor <= 0 || !Object.keys(inner).length) return null;
      for (const [el, n] of Object.entries(inner))
        stack[stack.length - 1][el] =
          (stack[stack.length - 1][el] || 0) + n * factor;
    } else if (/^[A-Z]/.test(token)) {
      if (!ELEMENTS.has(token)) return null;
      const factor = /^\d+$/.test(tokens[i + 1] || "")
        ? Number(tokens[++i])
        : 1;
      if (factor <= 0) return null;
      stack[stack.length - 1][token] =
        (stack[stack.length - 1][token] || 0) + factor;
    } else return null;
  }
  return stack.length === 1 ? { atoms: stack[0], charge } : null;
}
export function checkEquation(equation: string): {
  balanced: boolean | null;
  note: string;
} {
  const sides = equation
    .replace(/[₀-₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .split(/\s*(?:⇌|→|->|<=>|=)\s*/);
  if (sides.length !== 2)
    return {
      balanced: null,
      note: "Qualitative equation; atom and charge balance has not been checked.",
    };
  const total = (side: string) => {
    const result: Record<string, number> = { charge: 0 };
    for (const term of side.split(/\s+\+\s+/)) {
      const match = term.trim().match(/^(\d+)?\s*(.+)$/);
      const parsed = match && formulaInventory(match[2]);
      if (!match || !parsed) return null;
      const coefficient = Number(match[1] || 1);
      if (coefficient <= 0) return null;
      for (const [key, n] of Object.entries(parsed.atoms))
        result[key] = (result[key] || 0) + n * coefficient;
      result.charge += parsed.charge * coefficient;
    }
    return result;
  };
  const a = total(sides[0]),
    b = total(sides[1]);
  if (!a || !b)
    return {
      balanced: null,
      note: "Qualitative equation; use formulae and spaced plus signs to check atom and charge balance.",
    };
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const balanced = [...keys].every((k) => (a[k] || 0) === (b[k] || 0));
  return {
    balanced,
    note: balanced
      ? "Atom counts and net charge match. This does not establish reaction feasibility."
      : "Atom counts or net charge do not match. This prediction cannot be accepted as balanced.",
  };
}

export function productMatchesEquation(
  equation: string,
  formula: string,
): boolean | null {
  const right = equation
    .replace(/[₀-₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .split(/\s*(?:⇌|→|->|<=>|=)\s*/)[1];
  const product = formulaInventory(formula);
  if (!right || !product) return null;
  let parsedAny = false;
  for (const term of right.split(/\s+\+\s+/)) {
    const value = formulaInventory(term.replace(/^\d+\s*/, ""));
    if (!value) continue;
    parsedAny = true;
    const keys = new Set([
      ...Object.keys(value.atoms),
      ...Object.keys(product.atoms),
    ]);
    if (
      value.charge === product.charge &&
      [...keys].every((k) => (value.atoms[k] || 0) === (product.atoms[k] || 0))
    )
      return true;
  }
  return parsedAny ? false : null;
}
