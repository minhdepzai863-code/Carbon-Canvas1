import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const output = resolve(".checks/chemistry.mjs");
await build({
  entryPoints: ["scripts/chemistry-fixtures.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: output,
  external: ["@rdkit/rdkit"],
  plugins: [
    {
      name: "local-wasm",
      setup(builder) {
        builder.onResolve({ filter: /RDKit_minimal\.wasm\?url$/ }, () => ({
          path: "rdkit-wasm",
          namespace: "test",
        }));
        builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents:
            "export default " +
            JSON.stringify(require.resolve("@rdkit/rdkit/RDKit_minimal.wasm")),
          loader: "js",
        }));
      },
    },
  ],
});
const chemistry = await import(pathToFileURL(output));
let checks = 0;
// These paths must not depend on Gemini or spend its quota.
const originalFetch = globalThis.fetch;
let networkCalls = 0;
globalThis.fetch = async () => {
  networkCalls++;
  throw new Error("Unexpected network request in local molecule path");
};
try {
  for (const invalid of [
    "",
    "  ",
    "smiles",
    "SMILES",
    "smiles:",
    " SMILES : ",
    "x".repeat(1001),
  ]) {
    await assert.rejects(
      chemistry.generateMoleculeData(invalid),
      /Enter|SMILES|1,000/,
    );
    checks++;
  }
  for (const input of ["smiles:CCO", " SMILES : CCO "]) {
    const mol = await chemistry.generateMoleculeData(input);
    assert.equal(mol.formula, "C2H6O");
    assert.equal(mol.provenance, "user");
    checks++;
  }
  await assert.rejects(
    chemistry.generateMoleculeData("smiles:invalid"),
    /valence|aromaticity/,
  );
  const reference = await chemistry.generateMoleculeData("  Benzene  ");
  assert.equal(reference.formula, "C6H6");
  assert.equal(networkCalls, 0);
  checks += 3;
} finally {
  globalThis.fetch = originalFetch;
}
for (const item of chemistry.REFERENCE_MOLECULES) {
  const normalized = await chemistry.normalizeMolecule({
    ...item,
    atoms: [],
    bonds: [],
  });
  assert.ok(normalized.atoms.length, item.name);
  assert.ok(
    (await chemistry.depictMolecule(normalized)).includes("<svg"),
    item.name,
  );
  assert.ok(
    (await chemistry.depictMolecule(normalized, true)).includes("<svg"),
    item.name + " explicit H",
  );
  if (item.name === "Nitrobenzene")
    assert.equal(normalized.atoms.filter((a) => a.formalCharge).length, 2);
  if (item.name === "Benzene")
    assert.equal(
      normalized.atoms.reduce((sum, a) => sum + (a.implicitHydrogens || 0), 0),
      6,
    );
  if (item.name === "Water") assert.equal(normalized.formula, "H2O");
  if (item.name === "Methane") assert.equal(normalized.formula, "CH4");
  if (item.name === "Hydroxide") assert.equal(normalized.formula, "HO^-");
  checks += 3;
}
for (const smiles of [
  "C(C)(C)(C)(C)C",
  "N(C)(C)(C)C",
  "O(C)(C)C",
  "not-smiles",
]) {
  await assert.rejects(
    chemistry.normalizeMolecule({
      name: "Invalid",
      description: "",
      smiles,
      atoms: [],
      bonds: [],
    }),
  );
  checks++;
}
for (const smiles of [
  "[NH4+]",
  "[O-][N+](=O)c1ccccc1",
  "F[C@](Cl)(Br)I",
  "F/C=C/F",
]) {
  const normalized = await chemistry.normalizeMolecule({
    name: "Charge/stereo test",
    description: "",
    smiles,
    atoms: [],
    bonds: [],
  });
  assert.ok(normalized.smiles);
  if (smiles.includes("@")) assert.match(normalized.smiles, /@/);
  if (smiles.includes("/")) assert.match(normalized.smiles, /\//);
  checks++;
}
for (const [equation, balanced] of [
  ["C2H4O2 + C2H6O ⇌ C4H8O2 + H2O", true],
  ["CH3Br + OH^- -> CH4O + Br^-", true],
  ["2H2 + O2 -> 2H2O", true],
  ["H2 + O2 -> H2O", false],
  ["Na^+ + Cl^- -> NaCl", true],
  ["Na^+ + Cl^- -> NaCl^+", false],
  ["Ca(OH)2 + 2HCl -> CaCl2 + 2H2O", true],
  ["acid + alcohol -> ester + water", null],
  ["Xx + H2 -> XxH2", null],
  ["H0 -> H0", null],
]) {
  assert.equal(chemistry.checkEquation(equation).balanced, balanced, equation);
  checks++;
}
assert.equal(
  chemistry.productMatchesEquation("C2H4O2 + C2H6O ⇌ C4H8O2 + H2O", "C4H8O2"),
  true,
);
assert.equal(
  chemistry.productMatchesEquation("C2H4O2 + C2H6O ⇌ C4H8O2 + H2O", "CH4"),
  false,
);
checks += 2;
for (const [id, course] of Object.entries(chemistry.COURSES)) {
  assert.equal(
    new Set(course.modules.map((m) => m.id)).size,
    course.modules.length,
  );
  for (const module of course.modules) {
    const guide = chemistry.getStudyGuide(module, id);
    assert.ok(guide.flashcards.length >= 3, module.id);
    assert.ok(guide.resources.every((r) => /^https:\/\//.test(r.url)));
    checks += 2;
  }
}
assert.equal(
  chemistry.COURSES.ALEVEL.modules.filter((m) => /^\d+$/.test(m.code)).length,
  37,
);
assert.equal(
  chemistry.COURSES.IB.modules.some((m) => /option/i.test(m.title)),
  false,
);
console.log(
  "Passed " +
    (checks + 2) +
    " chemistry/content checks using the real RDKit WASM module.",
);
