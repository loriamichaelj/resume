// Device quality tiers for the WebGL backdrop. No three.js here: index.ts uses
// this before deciding whether to download the scene at all.
//
// The tier is a first guess from the GPU, CPU and memory; world.ts then adapts
// the render resolution to the frame rate it actually gets, and remembers the
// level a device settled on (per GPU) so the next visit starts there.

export type Tier = "low" | "medium" | "high";

// Rungs of the adaptive ladder, cheapest first: the canvas pixel ratio (capped
// at the screen's) and the cloud's resolution relative to the canvas. The
// ray-marched cloud is by far the most expensive layer, so it gives way first.
export const LEVELS = [
  { ratio: 0.5, cloud: 0.5 },
  { ratio: 0.75, cloud: 0.5 },
  { ratio: 1, cloud: 0.5 },
  { ratio: 1, cloud: 0.75 },
  { ratio: 1.25, cloud: 0.75 },
  { ratio: 1.5, cloud: 0.75 },
  { ratio: 1.5, cloud: 1 },
  { ratio: 2, cloud: 1 },
];

export type Quality = {
  tier: Tier;
  gpu: string;
  touch: boolean; // phones and tablets only ever step down
  antialias: boolean;
  // Ray-march budget for the cloud and the size of its baked noise volume.
  cloud: { steps: number; step: number; lightSteps: number; lightStep: number; noise: number };
  start: number; // LEVELS index to begin at
  max: number; // highest LEVELS index to climb to
  maxFps: number; // 0: the display's own rate
  // While nothing on the page moves; 0: no throttling. The birds keep flying
  // and the cloud keeps drifting, so anything under 60 shows as stutter: only
  // the low tier trades that for battery and heat.
  idleFps: number;
};

const TIERS: Record<Tier, Omit<Quality, "tier" | "gpu" | "touch">> = {
  low: {
    antialias: false,
    cloud: { steps: 56, step: 0.07, lightSteps: 4, lightStep: 0.13, noise: 36 },
    start: 2,
    max: 3,
    maxFps: 60,
    idleFps: 30,
  },
  medium: {
    antialias: true,
    cloud: { steps: 72, step: 0.058, lightSteps: 5, lightStep: 0.105, noise: 48 },
    start: 4,
    max: 6,
    maxFps: 0,
    idleFps: 60, // a no-op at 60 Hz; halves idle work on 120 Hz screens
  },
  high: {
    antialias: true,
    cloud: { steps: 96, step: 0.045, lightSteps: 6, lightStep: 0.09, noise: 48 },
    start: 6,
    max: 7,
    maxFps: 0,
    idleFps: 0,
  },
};

const RANK: Record<Tier, number> = { low: 0, medium: 1, high: 2 };
const lower = (a: Tier, b: Tier) => (RANK[a] <= RANK[b] ? a : b);

// Software rasterisers: a ray-marched cloud on the CPU would crawl.
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|gdi generic/i;

function gpuTier(gpu: string): Tier {
  const g = gpu.toLowerCase();
  if (/geforce (gtx|rtx)|quadro|nvidia rtx|radeon (rx|pro)|arc\(tm\) a\d|arc a\d|apple m\d+ (pro|max|ultra)/.test(g)) return "high";
  const m = g.match(/apple m(\d+)/);
  if (m) return Number(m[1]) >= 3 ? "high" : "medium";
  // Older Intel integrated graphics, phone and tablet GPUs.
  if (/intel.*\b(hd|uhd)\b|\bgma\b|mali|adreno|powervr|apple a\d|videocore/.test(g)) return "low";
  // Iris / Iris Xe, integrated Radeon, GeForce MX, Safari's "Apple GPU" and
  // anything unrecognised.
  return "medium";
}

type Probe = { gpu: string; software: boolean } | null;

// One throwaway WebGL2 context (three.js needs WebGL2) to read the GPU name.
export function probeGpu(): Probe {
  try {
    const c = document.createElement("canvas");
    let gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    let software = false;
    if (!gl) {
      gl = c.getContext("webgl2");
      if (!gl) return null;
      software = true;
    }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { gpu, software: software || SOFTWARE.test(gpu) };
  } catch {
    return null;
  }
}

export function detectQuality(gpu: string): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const touch = matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8; // Chromium only, capped at 8

  let tier = gpuTier(gpu);
  // On Safari the GPU only reads "Apple GPU": the bigger chips have more cores.
  if (/apple gpu/i.test(gpu) && !touch && cores >= 10) tier = "high";
  if (cores <= 4 || memory <= 4) tier = lower(tier, "medium");
  if (touch || cores <= 2 || memory < 4 || nav.connection?.saveData) tier = "low";

  // ?quality=low|medium|high forces a tier, for testing.
  const forced = new URLSearchParams(location.search).get("quality") as Tier | null;
  if (forced && forced in TIERS) tier = forced;

  return { tier, gpu, touch, ...TIERS[tier] };
}

// ---- Remembered level -----------------------------------------------------------
// Shared with the inline script in Layout.astro, which reads `css` before first
// paint so the page's glass effects don't switch off after load.
const KEY = "scene-quality";
type Saved = { gpu: string; tier: Tier; level: number; css: string };

export function savedLevel(q: Quality): number | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null") as Saved | null;
    return s && s.gpu === q.gpu && s.tier === q.tier && Number.isInteger(s.level) ? s.level : null;
  } catch {
    return null;
  }
}

// The page drops its backdrop blurs on low-tier devices, and on any device
// that has had to fall to the bottom rungs of the ladder.
export function cssQuality(q: Quality, level: number): string {
  return q.tier === "low" || level <= 1 ? "low" : q.tier;
}

export function applyQuality(q: Quality, level: number) {
  const css = cssQuality(q, level);
  document.documentElement.dataset.quality = css;
  try {
    localStorage.setItem(KEY, JSON.stringify({ gpu: q.gpu, tier: q.tier, level, css } satisfies Saved));
  } catch {
    /* Storage blocked: fine, just not remembered. */
  }
}
