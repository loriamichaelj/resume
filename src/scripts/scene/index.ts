// Boots the WebGL backdrop. Three.js and the scene are fetched with a dynamic
// import after first paint, and only on devices with a hardware WebGL2 GPU;
// otherwise the CSS gradient backdrop and the SVG hero cloud stay in place.
// The device's quality tier (quality.ts) is settled here, before the scene
// is built.

import { detectQuality, probeGpu } from "./quality";

function boot() {
  const canvas = document.getElementById("scene3d") as HTMLCanvasElement | null;
  if (!canvas) return;
  const probe = probeGpu();
  if (!probe) return;
  if (probe.software) {
    // Software rendering: the page composites on the CPU too, so drop the blurs.
    document.documentElement.dataset.quality = "low";
    return;
  }
  const quality = detectQuality(probe.gpu);
  import("./world")
    .then(({ createWorld }) => createWorld(canvas, quality))
    .catch(() => {
      /* Network/parse failure: keep the CSS fallbacks. */
    });
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(boot, { timeout: 1200 });
} else {
  setTimeout(boot, 200);
}
