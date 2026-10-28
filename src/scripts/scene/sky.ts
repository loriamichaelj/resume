import * as THREE from "three";
import { damp, glowTexture } from "./util";

// The sky's light source, top right above the hero: a full moon in dark mode,
// the sun in light mode, crossfading on theme change. Whichever is showing is
// also where the cloud's light comes from (see world.ts). Both sit far back in
// the scrolling column, so they drift away slowly as you scroll.

const DEPTH = -24;

const moonVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosObj;
  varying vec3 vPosW;
  void main() {
    vPosObj = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

// A full moon: evenly lit (no phase, no crater shadows), so its face is all
// albedo: dark maria, mottled highlands, small bright craters and one young
// crater throwing bright rays, with the slight limb darkening a real full
// moon has.
const moonFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vNormalW;
  varying vec3 vPosObj;
  varying vec3 vPosW;

  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }
  float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 5; i++) {
      s += a * vnoise(p);
      p = p * 2.03 + 1.7;
      a *= 0.5;
    }
    return s;
  }
  vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
  }
  // Small bright craters: a soft bright ring and floor per occupied cell.
  float brightCraters(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    float acc = 0.0;
    for (int z = -1; z <= 1; z++)
      for (int y = -1; y <= 1; y++)
        for (int x = -1; x <= 1; x++) {
          vec3 o = vec3(float(x), float(y), float(z));
          vec3 h = hash33(i + o);
          if (h.z < 0.7) continue;
          vec3 c = o + h * 0.8 + 0.1 - f;
          float d = length(c) / (0.1 + 0.2 * h.x);
          acc += exp(-d * d * 2.0) * 0.5 + exp(-pow((d - 1.0) * 5.0, 2.0)) * 0.35;
        }
    return acc;
  }

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 sp = normalize(vPosObj);
    // Domain-warped noise gives the big, smooth-edged dark seas.
    vec3 q = sp * 1.25;
    float warp = fbm(q + fbm(q * 1.8 + 3.1) * 0.9);
    float maria = smoothstep(0.5, 0.6, warp);
    vec3 highland = vec3(0.86, 0.85, 0.82);
    vec3 sea = vec3(0.52, 0.53, 0.55);
    vec3 alb = mix(highland, sea, maria * 0.9);
    alb *= 0.9 + 0.14 * fbm(sp * 7.0 + 2.0);
    alb += brightCraters(sp * 7.0) * 0.12 * (1.0 - maria * 0.6);
    // A young crater with bright rays splashing across the face.
    vec3 c0 = normalize(vec3(-0.18, -0.62, 0.76));
    float cd = acos(clamp(dot(sp, c0), -1.0, 1.0));
    vec3 t = normalize(cross(c0, vec3(0.0, 1.0, 0.0)));
    vec3 b = cross(c0, t);
    float ang = atan(dot(sp, b), dot(sp, t));
    float rays = pow(abs(sin(ang * 9.0 + sin(ang * 3.0) * 1.3)), 6.0) * exp(-cd * 2.8) * 0.07;
    alb += rays + exp(-cd * cd * 700.0) * 0.25;

    vec3 v = normalize(cameraPosition - vPosW);
    float ndv = max(dot(n, v), 0.0);
    vec3 col = alb * mix(0.8, 1.0, pow(ndv, 0.35)) * vec3(1.0, 0.99, 0.96);
    // Faint cool rim from the atmosphere-scattered glow.
    col += vec3(0.6, 0.7, 1.0) * pow(1.0 - ndv, 4.0) * 0.12;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const sunVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A photographed sun: an overexposed white disc, a tight hot bloom, a wide
// warm glare, and only faint thin streaks. Premultiplied output, so it
// composites on the cream page.
const sunFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  const float R = 0.12; // disc radius in plane units
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    float a = atan(p.y, p.x);
    float disc = smoothstep(R, R * 0.96, d);
    float beyond = max(d - R, 0.0);
    // One smooth falloff from the blown-out disc: no ring at its edge.
    float glow = exp(-beyond * 11.0) * 0.95 + exp(-beyond * 3.6) * 0.42 + exp(-d * 1.7) * 0.18;
    float alpha = clamp(disc + glow, 0.0, 1.0);
    // White core -> pale yellow -> warm amber, as in a bright sky.
    vec3 col = mix(vec3(1.0, 0.995, 0.97), vec3(1.0, 0.93, 0.7), smoothstep(R * 0.9, R * 2.2, d));
    col = mix(col, vec3(1.0, 0.76, 0.42), smoothstep(R * 2.2, 0.75, d));
    col *= alpha;
    // Faint thin streaks, as a lens would show them; they slowly breathe.
    float streaks = pow(0.5 + 0.5 * sin(a * 18.0 + sin(a * 4.0) * 0.8), 40.0)
      * exp(-beyond * 4.5) * (0.05 + 0.015 * sin(uTime * 0.4));
    streaks += pow(abs(cos(a * 3.0)), 300.0) * exp(-beyond * 3.0) * 0.06;
    streaks *= smoothstep(R, R * 1.8, d);
    col += vec3(1.0, 0.8, 0.5) * streaks;
    float edge = smoothstep(1.0, 0.7, d);
    gl_FragColor = vec4(col, clamp(alpha + streaks, 0.0, 1.0)) * edge * uOpacity;
  }
`;

// A soft ring sprite for lens-flare ghosts.
function ringTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.1)");
  grad.addColorStop(0.7, "rgba(255,255,255,0.14)");
  grad.addColorStop(0.86, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// Ghost positions along the line from the sun through the screen centre
// (1 = at the sun, 0 = centre, negative = past it), size and colour.
const GHOSTS: [number, number, string, "glow" | "ring"][] = [
  [0.55, 0.2, "#ffe1b0", "glow"],
  [0.2, 0.1, "#ffc38a", "ring"],
  [-0.2, 0.28, "#ffb08a", "ring"],
  [-0.5, 0.08, "#ffd2b8", "glow"],
];

export function createSky(opts: { light: boolean }) {
  const glow = glowTexture();
  const ring = ringTexture();
  const group = new THREE.Group();

  // ---- Moon ------------------------------------------------------------------
  const moonMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: opts.light ? 0 : 1 } },
    vertexShader: moonVertex,
    fragmentShader: moonFragment,
    transparent: true,
    depthWrite: false,
  });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), moonMat);
  moon.rotation.set(0.2, -0.4, 0.1);
  moon.renderOrder = -50;
  const halo = (scale: number, opacity: number, color: string) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    s.userData = { base: opacity, scale };
    s.renderOrder = -51;
    return s;
  };
  // A tight bright glow and a wide faint one, like moonlight in haze.
  const moonHalos = [halo(3.2, 0.42, "#f0f5ff"), halo(9, 0.12, "#9ab8ff")];
  const moonGroup = new THREE.Group();
  moonGroup.add(...moonHalos, moon);
  group.add(moonGroup);

  // ---- Sun -------------------------------------------------------------------
  const sunMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: opts.light ? 1 : 0 } },
    vertexShader: sunVertex,
    fragmentShader: sunFragment,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
  });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sunMat);
  sun.renderOrder = -50;
  group.add(sun);

  // Lens-flare ghosts ride on the camera (added in attach()).
  const flare = new THREE.Group();
  const ghosts = GHOSTS.map(([k, size, color, kind]) => {
    const mat = new THREE.SpriteMaterial({
      map: kind === "ring" ? ring : glow,
      color,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const s = new THREE.Sprite(mat);
    s.renderOrder = 8;
    flare.add(s);
    return { k, size, sprite: s, mat };
  });

  let moonVis = opts.light ? 0 : 1;
  let sunVis = opts.light ? 1 : 0;
  let light = opts.light;
  let portrait = false;
  const tmp = new THREE.Vector3();

  function attach(camera: THREE.PerspectiveCamera) {
    camera.add(flare);
  }

  // Top right of the hero, far back, sized to the viewport. Portrait screens:
  // tucked into the corner beside the hero text, below the nav.
  function layout(camera: THREE.PerspectiveCamera) {
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - DEPTH);
    const halfW = halfH * camera.aspect;
    portrait = camera.aspect < 0.9;
    const x = halfW * (portrait ? 0.72 : 0.62);
    const y = halfH * (portrait ? 0.8 : 0.62);
    const radius = halfH * (portrait ? 0.065 : 0.085);
    moonGroup.position.set(x, y, DEPTH);
    moon.scale.setScalar(radius);
    for (const h of moonHalos) h.scale.setScalar(radius * h.userData.scale);
    sun.position.set(x, y, DEPTH);
    sun.scale.setScalar(radius / 0.12); // disc radius is 0.12 of the plane's half-size
  }

  function setTheme(l: boolean) {
    light = l;
  }

  // World position of whichever body is showing (where the light comes from).
  function lightPosition(out: THREE.Vector3) {
    return (light ? sun : moonGroup).getWorldPosition(out);
  }

  function update(time: number, dt: number, camera: THREE.PerspectiveCamera) {
    moonVis = damp(moonVis, light ? 0 : 1, 2.5, dt);
    sunVis = damp(sunVis, light ? 1 : 0, 2.5, dt);
    moonMat.uniforms.uOpacity.value = moonVis;
    moonGroup.visible = moonVis > 0.01;
    for (const h of moonHalos) (h.material as THREE.SpriteMaterial).opacity = h.userData.base * moonVis;
    moon.rotation.y = -0.4 + time * 0.008;

    sunMat.uniforms.uTime.value = time;
    sunMat.uniforms.uOpacity.value = sunVis;
    sun.visible = sunVis > 0.01;
    sun.quaternion.copy(camera.quaternion);

    // Lens flare: ghosts along the line through the screen centre, while the
    // sun is on screen.
    sun.getWorldPosition(tmp).project(camera);
    const sx = tmp.x;
    const sy = tmp.y;
    const onScreen = 1 - THREE.MathUtils.smoothstep(Math.max(Math.abs(sx), Math.abs(sy)), 0.9, 1.3);
    const visible = sunVis * onScreen * (tmp.z < 1 ? 1 : 0);
    flare.visible = visible > 0.01;
    const d = 6;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    for (const g of ghosts) {
      g.sprite.position.set(sx * g.k * tanHalf * d * camera.aspect, sy * g.k * tanHalf * d, -d);
      g.sprite.scale.setScalar(g.size * tanHalf * d);
      g.mat.opacity = visible * (portrait ? 0.12 : 0.2);
    }
  }

  return { object: group, attach, layout, setTheme, lightPosition, update };
}
