export interface InkPoint {
  x: number;
  y: number;
}
export interface InkStroke {
  points: InkPoint[];
  color: string;
  width: number;
}
export type PaperInk = Record<string, InkStroke[]>;
const key = (filename: string) => `cc-ink-v1:${filename}`;
export function readInk(filename: string): PaperInk {
  try {
    const raw = JSON.parse(localStorage.getItem(key(filename)) || "{}");
    if (!raw || Array.isArray(raw) || typeof raw !== "object") return {};
    const result: PaperInk = {};
    let count = 0;
    for (const [page, strokes] of Object.entries(raw)) {
      if (!/^\d{1,3}$/.test(page) || !Array.isArray(strokes)) continue;
      result[page] = strokes.slice(0, 500).filter((s): s is InkStroke => {
        if (
          !s ||
          !["#173d42", "#956144", "#b42318"].includes(s.color) ||
          !Number.isFinite(s.width) ||
          s.width < 0.0005 ||
          s.width > 0.015 ||
          !Array.isArray(s.points) ||
          s.points.length > 3000
        )
          return false;
        count += s.points.length;
        return (
          count <= 100000 &&
          s.points.every(
            (p: InkPoint) =>
              Number.isFinite(p.x) &&
              Number.isFinite(p.y) &&
              p.x >= 0 &&
              p.x <= 1 &&
              p.y >= 0 &&
              p.y <= 1,
          )
        );
      });
    }
    return result;
  } catch {
    return {};
  }
}
export function saveInk(filename: string, ink: PaperInk) {
  localStorage.setItem(key(filename), JSON.stringify(ink));
}
async function cache() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("carboncanvas-documents", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("files", { keyPath: "filename" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function cachedPaper(
  filename: string,
): Promise<Uint8Array | null> {
  const db = await cache();
  try {
    return await new Promise((resolve, reject) => {
      const r = db.transaction("files").objectStore("files").get(filename);
      r.onsuccess = () => resolve(r.result?.bytes || null);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
export async function cachePaper(filename: string, bytes: Uint8Array) {
  const db = await cache();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      store.put({ filename, bytes, touched: Date.now() });
      const r = store.getAll();
      r.onsuccess = () => {
        const all = r.result.sort((a, b) => b.touched - a.touched);
        for (const old of all.slice(20)) store.delete(old.filename);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function forgetPaper(filename: string) {
  const db = await cache();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").delete(filename);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
