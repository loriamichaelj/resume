// Boots the WebGL backdrop. Three.js and the scene are fetched with a dynamic
// import after first paint, and only on WebGL-capable devices; otherwise the
// CSS gradient backdrop and the SVG hero cloud stay in place.

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

function boot() {
  const canvas = document.getElementById("scene3d") as HTMLCanvasElement | null;
  if (!canvas || !webglAvailable()) return;
  import("./world")
    .then(({ createWorld }) => createWorld(canvas))
    .catch(() => {
      /* Network/parse failure: keep the CSS fallbacks. */
    });
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(boot, { timeout: 1200 });
} else {
  setTimeout(boot, 200);
}
