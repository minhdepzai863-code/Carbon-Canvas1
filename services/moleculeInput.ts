/** Input syntax only; RDKit remains responsible for chemical validation. */
export function parseMoleculeInput(raw: string): {
  kind: "name" | "smiles";
  value: string;
} {
  const value = raw.trim();
  if (!value)
    throw new Error(
      "Enter a molecule name, such as ethanol, or a structure such as smiles:CCO.",
    );
  if (value.length > 1000)
    throw new Error(
      "Use a molecule name or SMILES of 1,000 characters or fewer.",
    );
  if (/^smiles\s*:?\s*$/i.test(value))
    throw new Error(
      "SMILES is a structure notation, not a molecule name. Enter a name such as ethanol, or a structure such as smiles:CCO.",
    );
  const supplied = /^smiles\s*:\s*(.*)$/is.exec(value);
  return supplied
    ? { kind: "smiles", value: supplied[1].trim() }
    : { kind: "name", value };
}
