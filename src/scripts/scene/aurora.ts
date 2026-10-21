import * as THREE from "three";
import { clamp, damp, PALETTE } from "./util";

// Full-screen backdrop of slowly drifting colour fields and an aurora ribbon.
// The palette blends section by section as the page scrolls. Output is
// premultiplied so it composites correctly on both the dark and light page.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uFlash; // lightning lighting up the whole sky
  uniform vec2 uRes;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  uniform vec3 uC4;
  varying vec2 vUv;

  float blob(vec2 p, vec2 c, float r) {
    vec2 d = p - c;
    return exp(-dot(d, d) / (r * r));
  }
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    float asp = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * asp, vUv.y);
    float t = uTime * 0.06;

    float b1 = blob(p, vec2(asp * (0.82 + 0.07 * sin(t * 1.3)), 0.88 + 0.05 * cos(t * 1.7)), 0.5);
    float b2 = blob(p, vec2(asp * (0.1 + 0.08 * cos(t * 1.1)), 0.7 + 0.09 * sin(t * 1.4)), 0.46);
    float b3 = blob(p, vec2(asp * (0.55 + 0.2 * sin(t * 0.8)), 0.04 + 0.06 * sin(t * 1.9)), 0.55);

    // Drifting aurora ribbon across the upper half.
    float wave = 0.66 + 0.07 * sin(vUv.x * 3.1 + t * 3.0) + 0.04 * sin(vUv.x * 7.3 - t * 4.0);
    float ribbon = exp(-pow((vUv.y - wave) * 7.5, 2.0)) * (0.5 + 0.5 * sin(vUv.x * 8.0 + t * 5.0));

    float w1 = b1 * 0.9;
    float w2 = b2 * 0.75;
    float w3 = b3 * 0.7;
    float w4 = ribbon * 0.4;
    float total = w1 + w2 + w3 + w4;
    vec3 hue = (uC1 * w1 + uC2 * w2 + uC3 * w3 + uC4 * w4) / max(total, 1e-3);
    float s = clamp(total, 0.0, 1.0) * uIntensity;
    // A lightning flash washes the sky in cold light, brightest up top.
    float wash = uFlash * (0.05 + 0.1 * vUv.y);
    hue = mix(hue, vec3(0.75, 0.82, 1.0), clamp(wash * 4.0, 0.0, 0.6));
    s = clamp(s + wash, 0.0, 1.0);

    // Film grain keeps the soft gradients from banding.
    float g = (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.035;
    gl_FragColor = vec4(hue * s + g * s, s);
  }
`;

// One palette per section: hero, about, experience, services, skills, contact.
// Slots 1-3 are the large colour fields, slot 4 the ribbon. Warm peach only
// goes in the ribbon: as a big low-intensity field on dark it turns muddy.
const INDIGO = "#4f46ff";
const MAGENTA = "#c35cff";
const toColors = (sets: string[][]) => sets.map((set) => set.map((hex) => new THREE.Color(hex)));
const DARK_SECTIONS = toColors([
  [PALETTE.violet, MAGENTA, PALETTE.aqua, PALETTE.peach],
  [PALETTE.aqua, INDIGO, MAGENTA, PALETTE.rose],
  [MAGENTA, INDIGO, PALETTE.aqua, PALETTE.rose],
  [INDIGO, PALETTE.aqua, PALETTE.rose, PALETTE.peach],
  [PALETTE.rose, PALETTE.violet, PALETTE.aqua, PALETTE.aqua],
  [PALETTE.aqua, MAGENTA, PALETTE.violet, PALETTE.peach],
]);
// Light theme: a warm, sunlit sky of gold, amber, orange and coral.
const GOLD = "#ffd166";
const AMBER = "#ffb347";
const ORANGE = "#ff8a3d";
const CORAL = "#ff6b5b";
const BLUSH = "#ff8fab";
const LIGHT_SECTIONS = toColors([
  [GOLD, ORANGE, CORAL, AMBER],
  [ORANGE, AMBER, BLUSH, GOLD],
  [CORAL, GOLD, ORANGE, AMBER],
  [AMBER, CORAL, GOLD, ORANGE],
  [ORANGE, BLUSH, AMBER, GOLD],
  [GOLD, CORAL, ORANGE, AMBER],
]);


export function createAurora(opts: { light: boolean }) {
  let sections = opts.light ? LIGHT_SECTIONS : DARK_SECTIONS;
  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 0 },
    uFlash: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uC1: { value: sections[0][0].clone() },
    uC2: { value: sections[0][1].clone() },
    uC3: { value: sections[0][2].clone() },
    uC4: { value: sections[0][3].clone() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100;

  let intensity = opts.light ? 0.34 : 0.3;
  const tmp = new THREE.Color();
  const slots = [uniforms.uC1, uniforms.uC2, uniforms.uC3, uniforms.uC4];

  function setTheme(light: boolean) {
    intensity = light ? 0.34 : 0.3;
    sections = light ? LIGHT_SECTIONS : DARK_SECTIONS;
  }

  function resize(w: number, h: number) {
    uniforms.uRes.value.set(w, h);
  }

  function update(time: number, section: number, dt: number, flash = 0) {
    uniforms.uTime.value = time;
    uniforms.uFlash.value = flash;
    uniforms.uIntensity.value = damp(uniforms.uIntensity.value, intensity, 1.2, dt);
    const s = clamp(section, 0, sections.length - 1);
    const i = Math.floor(s);
    const j = Math.min(i + 1, sections.length - 1);
    const f = s - i;
    slots.forEach((slot, k) => {
      tmp.copy(sections[i][k]).lerp(sections[j][k], f);
      slot.value.lerp(tmp, 1 - Math.exp(-2.5 * dt));
    });
  }

  return { object: mesh, update, setTheme, resize };
}
