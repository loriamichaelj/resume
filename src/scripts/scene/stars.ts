import * as THREE from "three";
import { mulberry32, PALETTE } from "./util";

// Twinkling starfield spread down the full scroll column, plus a few large,
// soft "bokeh" particles close to the camera for depth. In the dark theme a
// scattering of small four-point rainbow sparkles twinkle over the top.

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  uniform float uWarp;
  uniform float uSharp; // >1 makes the twinkle a brief flash
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vTwinkle = pow(0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0), uSharp);
    gl_PointSize = aSize * uScale * (1.0 + uWarp) / -mv.z;
    vColor = aColor;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uSoft;
  uniform float uLight;
  uniform vec3 uWarm; // light theme: warm dust instead of coloured stars
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), uSoft) * vTwinkle * uOpacity;
    if (a < 0.003) discard;
    vec3 col = mix(vColor, uWarm * (0.75 + 0.25 * vColor.r), uLight * 0.9);
    gl_FragColor = vec4(col, a);
  }
`;

// A small cross-shaped glint: two thin crossing rays and a bright core.
const sparkleFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float h = exp(-abs(p.y) * 70.0) * smoothstep(0.5, 0.0, abs(p.x));
    float v = exp(-abs(p.x) * 70.0) * smoothstep(0.5, 0.0, abs(p.y));
    float core = smoothstep(0.1, 0.0, length(p));
    float a = clamp(h + v + core, 0.0, 1.0) * vTwinkle * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.6), a);
  }
`;

const COLORS: [string, number][] = [
  [PALETTE.white, 0.46],
  [PALETTE.aqua, 0.18],
  [PALETTE.violet, 0.14],
  [PALETTE.rose, 0.14],
  [PALETTE.peach, 0.08],
];

function pickColor(r: number, out: THREE.Color) {
  let acc = 0;
  for (const [hex, w] of COLORS) {
    acc += w;
    if (r <= acc) return out.set(hex);
  }
  return out.set(PALETTE.white);
}

function makeLayer(opts: {
  count: number;
  seed: number;
  span: number;
  box: { x: number; z: [number, number] };
  size: [number, number];
  soft: number;
  opacity: number;
  sparkle?: boolean; // rainbow four-point glints instead of round stars
}) {
  const rand = mulberry32(opts.seed);
  const pos = new Float32Array(opts.count * 3);
  const col = new Float32Array(opts.count * 3);
  const size = new Float32Array(opts.count);
  const seed = new Float32Array(opts.count);
  const c = new THREE.Color();
  for (let i = 0; i < opts.count; i++) {
    pos[i * 3] = (rand() * 2 - 1) * opts.box.x;
    pos[i * 3 + 1] = 8 - rand() * (opts.span + 16);
    pos[i * 3 + 2] = opts.box.z[0] + rand() * (opts.box.z[1] - opts.box.z[0]);
    if (opts.sparkle) c.setHSL(rand(), 1, 0.68);
    else pickColor(rand(), c);
    c.toArray(col, i * 3);
    size[i] = opts.size[0] + Math.pow(rand(), 3) * (opts.size[1] - opts.size[0]);
    seed[i] = rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 1 },
      uWarp: { value: 0 },
      uSharp: { value: opts.sparkle ? 3 : 1 },
      uOpacity: { value: opts.opacity },
      uSoft: { value: opts.soft },
      uLight: { value: 0 },
      uWarm: { value: new THREE.Color("#e8732a") },
    },
    vertexShader,
    fragmentShader: opts.sparkle ? sparkleFragment : fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  return { points, material, baseOpacity: opts.opacity, darkOnly: !!opts.sparkle };
}

export function createStars(opts: { lowPower: boolean; span: number; light: boolean }) {
  const group = new THREE.Group();
  const far = makeLayer({
    count: opts.lowPower ? 650 : 1500,
    seed: 7,
    span: opts.span,
    box: { x: 20, z: [-26, -4] },
    size: [0.05, 0.16],
    soft: 2.4,
    opacity: 0.95,
  });
  const bokeh = makeLayer({
    count: opts.lowPower ? 22 : 46,
    seed: 21,
    span: opts.span,
    box: { x: 9, z: [-2, 4] },
    size: [0.25, 0.7],
    soft: 1.1,
    opacity: 0.16,
  });
  const sparkles = makeLayer({
    count: opts.lowPower ? 40 : 90,
    seed: 53,
    span: opts.span,
    box: { x: 14, z: [-14, -4] },
    size: [0.12, 0.3],
    soft: 1,
    opacity: 0.9,
    sparkle: true,
  });
  group.add(far.points, bokeh.points, sparkles.points);
  const layers = [far, bokeh, sparkles];

  function setTheme(light: boolean) {
    for (const l of layers) {
      l.material.uniforms.uLight.value = light ? 1 : 0;
      l.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      l.material.uniforms.uOpacity.value = l.baseOpacity * (light ? 0.55 : 1);
      l.material.needsUpdate = true;
      if (l.darkOnly) l.points.visible = !light;
    }
  }
  setTheme(opts.light);

  function resize(heightPx: number, fov: number) {
    // World size -> pixels at distance 1, so aSize is in world units.
    const scale = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
    for (const l of layers) l.material.uniforms.uScale.value = scale;
  }

  function update(time: number, scrollVel: number) {
    const warp = Math.min(Math.abs(scrollVel) / 4000, 1) * 0.8;
    for (const l of layers) {
      l.material.uniforms.uTime.value = time;
      l.material.uniforms.uWarp.value = warp;
    }
    bokeh.points.position.x = Math.sin(time * 0.07) * 0.6;
  }

  return { object: group, update, setTheme, resize };
}
