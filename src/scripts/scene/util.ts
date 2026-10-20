import * as THREE from "three";

// Every shader in the scene is hand-written in sRGB, so skip colour management
// and write colours straight to the canvas. Set here, at module load, because
// util is evaluated before any other scene module creates a THREE.Color.
THREE.ColorManagement.enabled = false;

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

// Frame-rate independent exponential smoothing toward a target.
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export { mulberry32 } from "./random";

// Soft radial sprite used for glows around small bright objects.
export function glowTexture(): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// Brand palette shared by every layer of the scene.
export const PALETTE = {
  aqua: "#38d9ff",
  violet: "#7b61ff",
  rose: "#ff5fa2",
  peach: "#ffb36b",
  flame: "#ff7849",
  white: "#f4f1ff",
};
