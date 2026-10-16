import { useEffect, useState } from "react";
import {
  Download,
  Minus,
  Plus,
  RotateCcw,
  Check,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import type { MoleculeData } from "../types";
import { depictMolecule, normalizeMolecule } from "../services/chemistry";

export default function MoleculeVisualizer({
  data,
  loading,
  onAnalyze,
}: {
  data: MoleculeData | null;
  loading: boolean;
  onAnalyze?: (data: MoleculeData) => void;
}) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [explicitH, setExplicitH] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [editing, setEditing] = useState(false);
  const [smiles, setSmiles] = useState("");
  const [local, setLocal] = useState<MoleculeData | null>(data);
  const [rendering, setRendering] = useState(false);
  useEffect(() => {
    setLocal(data);
    setSmiles(data?.smiles || "");
    setZoom(1);
    setEditing(false);
  }, [data]);
  useEffect(() => {
    let cancelled = false;
    setError("");
    setSvg("");
    if (!local || !local.atoms.length) return;
    setRendering(true);
    depictMolecule(local, explicitH)
      .then((value) => {
        if (!cancelled) setSvg(value);
      })
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Could not depict this molecule.",
          );
      })
      .finally(() => {
        if (!cancelled) setRendering(false);
      });
    return () => {
      cancelled = true;
    };
  }, [local, explicitH]);
  const saveEdit = async () => {
    if (!local || !smiles.trim()) return;
    setError("");
    setRendering(true);
    try {
      const updated = await normalizeMolecule({
        name: "Edited structure",
        description:
          "User-edited structure. Chemical identity and physical properties require independent verification.",
        atoms: [],
        bonds: [],
        smiles,
        provenance: "user",
      });
      setLocal(updated);
      setEditing(false);
      onAnalyze?.(updated);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Invalid SMILES. Check the structure and try again.",
      );
    } finally {
      setRendering(false);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download =
      (local?.name || "molecule").replace(/[^a-z0-9-]/gi, "-") + ".svg";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section
      className="molecule-workbench"
      aria-label="Molecular structure viewer"
    >
      <div className="bench-toolbar">
        <span className="bench-kind">2D structure</span>
        <div className="toolbar-actions">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={explicitH}
              onChange={(e) => setExplicitH(e.target.checked)}
            />{" "}
            Show hydrogens
          </label>
          <button
            className="icon-button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
          >
            <Minus size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          >
            <Plus size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Reset view"
            onClick={() => {
              setZoom(1);
              setLocal(data);
              setSmiles(data?.smiles || "");
              setEditing(false);
            }}
          >
            <RotateCcw size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Export molecule SVG"
            disabled={!svg}
            onClick={download}
          >
            <Download size={17} />
          </button>
          {onAnalyze && (
            <button
              className="icon-button"
              aria-label="Edit structure"
              disabled={!local}
              onClick={() => setEditing(!editing)}
            >
              <Pencil size={17} />
            </button>
          )}
        </div>
      </div>
      {editing && (
        <form
          className="structure-editor"
          onSubmit={(e) => {
            e.preventDefault();
            void saveEdit();
          }}
        >
          <label htmlFor="edit-smiles">
            Edit connectivity and stereochemistry with SMILES
          </label>
          <div className="input-action">
            <input
              id="edit-smiles"
              value={smiles}
              onChange={(e) => setSmiles(e.target.value)}
              required
              spellCheck={false}
            />
            <button className="button" disabled={rendering}>
              <Check size={16} /> Apply
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Cancel edit"
              onClick={() => setEditing(false)}
            >
              <X size={17} />
            </button>
          </div>
          <p className="fine-print">
            Use bracketed charges and @ or @@ for specified stereochemistry.
            Edits clear reference claims and cited geometry.
          </p>
        </form>
      )}
      <div className="structure-stage">
        {loading || rendering ? (
          <div className="loading-state" role="status">
            <Loader2 size={24} className="spin" />
            <span>Preparing the structure…</span>
          </div>
        ) : error ? (
          <div className="notice error" role="alert">
            {error}
          </div>
        ) : svg ? (
          <div
            className="rdkit-svg"
            role="img"
            aria-label={"2D chemical structure of " + local?.name}
            style={{ transform: "scale(" + zoom + ")" }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="empty-state">
            <h3>Inspect a molecule</h3>
            <p>Choose a reference example or enter a name or SMILES above.</p>
          </div>
        )}
      </div>
      <div className="bench-foot">
        <span>Carbon at line ends and vertices; hydrogens implied.</span>
        <span>2D projection, not measured geometry</span>
      </div>
    </section>
  );
}
