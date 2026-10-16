import type { InkStroke, PaperInk } from "./paperStorage";
export function renderInkImage(
  strokes: InkStroke[],
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = Math.min(2400, Math.round((1200 * height) / width));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const s of strokes) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width * canvas.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    s.points.forEach((p, i) =>
      i
        ? ctx.lineTo(p.x * canvas.width, p.y * canvas.height)
        : ctx.moveTo(p.x * canvas.width, p.y * canvas.height),
    );
    if (s.points.length === 1)
      ctx.lineTo(
        s.points[0].x * canvas.width + 0.1,
        s.points[0].y * canvas.height,
      );
    ctx.stroke();
  }
  return canvas.toDataURL("image/jpeg", 0.85);
}
export async function exportAnnotatedPaper(
  bytes: Uint8Array,
  ink: PaperInk,
  filename: string,
) {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes.slice());
  for (const [number, strokes] of Object.entries(ink)) {
    const page = doc.getPages()[Number(number) - 1];
    if (!page) continue;
    const { width: w, height: h } = page.getSize();
    const angle = ((page.getRotation().angle % 360) + 360) % 360;
    const xy = (p: { x: number; y: number }) =>
      angle === 90
        ? { x: p.y * w, y: p.x * h }
        : angle === 180
          ? { x: (1 - p.x) * w, y: p.y * h }
          : angle === 270
            ? { x: (1 - p.y) * w, y: (1 - p.x) * h }
            : { x: p.x * w, y: (1 - p.y) * h };
    for (const s of strokes) {
      const hex = s.color.slice(1);
      const color = rgb(
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      );
      const thickness = s.width * (angle % 180 ? h : w);
      if (s.points.length === 1)
        page.drawCircle({ ...xy(s.points[0]), size: thickness / 2, color });
      else
        for (let i = 1; i < s.points.length; i++)
          page.drawLine({
            start: xy(s.points[i - 1]),
            end: xy(s.points[i]),
            thickness,
            color,
          });
    }
  }
  const data = await doc.save();
  const url = URL.createObjectURL(
    new Blob([data.slice().buffer], { type: "application/pdf" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(".pdf", "-annotated.pdf");
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
