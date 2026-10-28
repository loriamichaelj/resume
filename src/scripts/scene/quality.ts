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
type Rung = { ratio: number; cloud: number };
export const LEVELS: Rung[] = [
  { ratio: 0.5, cloud: 0.5 },
  { ratio: 0.75, cloud: 0.5 },
  { ratio: 1, cloud: 0.5 },
  { ratio: 1, cloud: 0.75 },
  { ratio: 1.25, cloud: 0.75 },
  { ratio: 1.5, cloud: 0.75 },
  { ratio: 1.5, cloud: 1 },
  { ratio: 2, cloud: 1 },
];
// Phones and tablets have dense screens (2-3x) and GPUs that draw the cheap
// layers well but struggle with the cloud's ray march. So the cloud stays at
// about half the CSS resolution (it is soft, and upscales smoothly) while the
// canvas goes up to 1.5x: crisp saucers, face and lines. (2x costs about three
// times as much GPU time again, too much to keep scrolling smooth.)
export const TOUCH_LEVELS: Rung[] = [
  { ratio: 0.75, cloud: 0.5 },
  { ratio: 1, cloud: 0.5 },
  { ratio: 1.5, cloud: 0.34 },
];

export type Quality = {
  tier: Tier;
  gpu: string;
  touch: boolean; // phones and tablets only ever step down
  antialias: boolean;
  // Ray-march budget for the cloud and the size of its baked noise volume.
  cloud: { steps: number; step: number; lightSteps: number; lightStep: number; noise: number };
  levels: Rung[]; // the adaptive ladder (LEVELS or TOUCH_LEVELS)
  start: number; // levels index to begin at
  max: number; // highest levels index to climb to
  maxFps: number; // 0: the display's own rate
  // While nothing on the page moves; 0: no throttling. The birds keep flying
  // and the cloud keeps drifting, so anything under 60 shows as stutter (a
  // 30 fps cadence on a 60 Hz screen judders unevenly), and no tier goes below
  // it: the throttle only stops a 120 Hz screen doing double the work.
  idleFps: number;
};

const TIERS: Record<Tier, Omit<Quality, "tier" | "gpu" | "touch" | "levels">> = {
  low: {
    antialias: false,
    cloud: { steps: 56, step: 0.07, lightSteps: 4, lightStep: 0.13, noise: 36 },
    start: 2,
    max: 3,
    maxFps: 60,
    idleFps: 60,
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

  const q: Quality = { tier, gpu, touch, levels: LEVELS, ...TIERS[tier] };
  if (touch) {
    // Apple's mobile GPUs resolve multisampling on chip, so antialiasing costs
    // them next to nothing; start them on the sharp canvas. Other phones start
    // a rung lower and climb if they can.
    const apple = /apple/i.test(gpu);
    q.levels = TOUCH_LEVELS;
    q.antialias = q.antialias || apple;
    q.start = apple ? 2 : 1;
    q.max = TOUCH_LEVELS.length - 1;
  }
  return q;
}

// ---- Remembered level -----------------------------------------------------------
// Shared with the inline script in Layout.astro, which reads `css` before first
// paint so the page's glass effects don't switch off after load.
const KEY = "scene-quality";
// v: the ladder's version, so a level saved against an older ladder is ignored.
const VERSION = 2;
type Saved = { v: number; gpu: string; tier: Tier; level: number; css: string };

export function savedLevel(q: Quality): number | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null") as Saved | null;
    return s && s.v === VERSION && s.gpu === q.gpu && s.tier === q.tier && Number.isInteger(s.level) ? s.level : null;
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
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, gpu: q.gpu, tier: q.tier, level, css } satisfies Saved));
  } catch {
    /* Storage blocked: fine, just not remembered. */
  }
}
