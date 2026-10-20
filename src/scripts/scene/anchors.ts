import { lerp, smoothstep } from "./util";

export type CloudTarget = {
  x: number; // canvas px
  y: number; // canvas px
  size: number; // px width the cloud should fill
  alpha: number;
  section: number; // fractional section index, for palette blending
};

type Sample = { cx: number; cy: number; size: number; alpha: number; d: number; section: number };

// The cloud parks on elements marked [data-cloud-anchor="<section index>"],
// with optional data-cloud-alpha. Anchors are read in document order; the two
// that straddle the viewport's vertical centre are blended by how far the page
// has scrolled between them, so the cloud glides from one to the next.
// Hidden anchors (display: none at a breakpoint) are skipped.
export class CloudPath {
  private anchors: HTMLElement[];

  constructor(root: ParentNode = document) {
    this.anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-cloud-anchor]"));
  }

  sample(canvasRect: DOMRect, viewportH: number): CloudTarget | null {
    const pts: Sample[] = [];
    for (const el of this.anchors) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cy = r.top + r.height / 2;
      pts.push({
        cx: r.left + r.width / 2 - canvasRect.left,
        cy: cy - canvasRect.top,
        size: r.width,
        alpha: Number(el.dataset.cloudAlpha ?? 1),
        d: cy - viewportH / 2,
        section: Number(el.dataset.cloudAnchor || 0),
      });
    }
    if (pts.length === 0) return null;

    const next = pts.findIndex((p) => p.d >= 0);
    if (next === 0) return toTarget(pts[0]);
    if (next === -1) return toTarget(pts[pts.length - 1]);

    const a = pts[next - 1];
    const b = pts[next];
    const t = smoothstep(-a.d / (b.d - a.d));
    return {
      x: lerp(a.cx, b.cx, t),
      y: lerp(a.cy, b.cy, t),
      size: lerp(a.size, b.size, t),
      alpha: lerp(a.alpha, b.alpha, t),
      section: lerp(a.section, b.section, t),
    };
  }
}

function toTarget(p: Sample): CloudTarget {
  return { x: p.cx, y: p.cy, size: p.size, alpha: p.alpha, section: p.section };
}
