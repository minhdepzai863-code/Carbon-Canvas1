export type InkTool = "pan" | "pen" | "erase";
export interface InkPointer {
  pointerId: number;
  pointerType: string;
  isPrimary: boolean;
  button: number;
}
// A Pencil may be non-primary when a palm touched the screen first. It must
// supersede that transient touch rather than being rejected as a second finger.
export function acceptsInkPointer(
  tool: InkTool,
  event: InkPointer,
  active: { id: number; type: string } | null,
  lastPenTime: number,
  now: number,
) {
  if (tool === "pan" || (event.pointerType === "mouse" && event.button !== 0))
    return false;
  if (event.pointerType === "pen") return !active || active.type !== "pen";
  if (!event.isPrimary || active) return false;
  return event.pointerType !== "touch" || now - lastPenTime > 800;
}
