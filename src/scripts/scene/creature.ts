import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A small modelling and shading kit for the legendary birds (hooh.ts,
// lugia.ts) that fly around the cloud. Everything is built from code:
//
//   loft()    sweeps an elliptical cross-section along a smooth curve, for
//             bodies, necks, tails, limbs and (flattened) feathers
//   feather() a curved, tapered blade with a rounded tip
//   blob()    a painted ellipsoid (eyes, feet)
//
// Each part is vertex-coloured, so a whole wing segment or body merges into
// one geometry and draws in one call, plus one for its ink outline. Shading
// is anime-style cel shading: a soft two-tone terminator toward the sun or
// moon, a thin highlight band and a rim of sky light.
//
// Model space: the bird faces +z, up is +y, its left wing points along +x.

export type Paint = THREE.Color | ((t: number, up: number, side: number, p: THREE.Vector3) => THREE.Color);

const curveOf = (points: number[][]) =>
  new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "centripetal");

const T = new THREE.Vector3();
const A = new THREE.Vector3();
const B = new THREE.Vector3();
const C = new THREE.Vector3();
const P = new THREE.Vector3();

// Sweeps an ellipse along `points`. radius(t) gives the semi-axes [a, b]: a
// along `ref` (projected square to the curve), b along tangent x ref. Ends
// close when the radius there is ~0, so taper profiles (see round()) cap them.
export function loft(
  points: number[][],
  radius: (t: number) => [number, number],
  paint: Paint,
  opts: { segments?: number; radial?: number; ref?: THREE.Vector3; detail?: number } = {},
) {
  const detail = opts.detail ?? 1;
  const segments = Math.max(4, Math.round((opts.segments ?? 24) * detail));
  const radial = Math.max(5, Math.round((opts.radial ?? 12) * Math.sqrt(detail)));
  const ref = opts.ref ?? new THREE.Vector3(0, 1, 0);
  const curve = curveOf(points);
  const pos: number[] = [];
  const col: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= segments; j++) {
    const t = j / segments;
    curve.getPointAt(t, C);
    curve.getTangentAt(t, T);
    A.copy(ref).addScaledVector(T, -ref.dot(T));
    if (A.lengthSq() < 1e-8) A.set(1, 0, 0).addScaledVector(T, -T.x);
    A.normalize();
    B.crossVectors(T, A);
    const [ra, rb] = radius(t);
    for (let i = 0; i < radial; i++) {
      const th = (i / radial) * Math.PI * 2;
      const up = Math.cos(th);
      const side = Math.sin(th);
      P.copy(C).addScaledVector(A, up * ra).addScaledVector(B, side * rb);
      pos.push(P.x, P.y, P.z);
      const c = typeof paint === "function" ? paint(t, up, side, P) : paint;
      col.push(c.r, c.g, c.b);
      if (j < segments) {
        const a = j * radial + i;
        const b = (j + 1) * radial + i;
        const c2 = j * radial + ((i + 1) % radial);
        const d = (j + 1) * radial + ((i + 1) % radial);
        index.push(a, c2, d, a, d, b);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

// Rounded-end profile for loft radii: 0 at both ends, `r` in the middle.
// `bias` < 0.5 puts the fullest point nearer the start.
export function round(r: number, t: number, bias = 0.5, power = 0.5) {
  const u = t < bias ? (t / bias) * 0.5 : 0.5 + ((t - bias) / (1 - bias)) * 0.5;
  return r * Math.pow(Math.max(0, Math.sin(Math.PI * u)), power);
}

// A feather: a thin blade from `root` along `dir` (bent by `curl` toward
// `bend`), `length` long and `width` wide at its fullest, with a rounded tip.
// Its flat faces look along `normal`. `tip` shapes the end: round, pointed
// (Ho-Oh's flight feathers) or blunt and square (Lugia's fingers). `serrate`
// cuts zigzag notches into the edge, `notches` of them (Ho-Oh's tail plumes).
export function feather(o: {
  root: number[];
  dir: number[];
  normal: number[];
  length: number;
  width: number;
  thickness?: number;
  curl?: number;
  bend?: number[];
  serrate?: number;
  notches?: number;
  tip?: "round" | "point" | "blunt";
  paint: Paint;
  detail?: number;
}) {
  const root = new THREE.Vector3(...(o.root as [number, number, number]));
  const dir = new THREE.Vector3(...(o.dir as [number, number, number])).normalize();
  const bend = new THREE.Vector3(...((o.bend ?? o.normal) as [number, number, number])).normalize();
  const pts: number[][] = [];
  for (let k = 0; k <= 4; k++) {
    const s = k / 4;
    const p = root
      .clone()
      .addScaledVector(dir, s * o.length)
      .addScaledVector(bend, (o.curl ?? 0) * o.length * s * s);
    pts.push([p.x, p.y, p.z]);
  }
  const thick = o.thickness ?? o.width * 0.12;
  const serrate = o.serrate ?? 0;
  const notches = o.notches ?? 4.5;
  const tip = o.tip ?? "round";
  return loft(
    pts,
    (t) => {
      // Narrow quill at the root, widest past the middle, then the tip.
      const quill = Math.min(1, t * 6 + 0.25);
      let w: number;
      if (tip === "point") w = o.width * quill * Math.pow(Math.min(1, (1 - t) / 0.5), 0.9);
      else if (tip === "blunt") w = o.width * quill * Math.pow(Math.min(1, (1 - t) / 0.08), 0.3);
      else w = o.width * quill * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.88)), 0.55);
      // Zigzag notches: a sawtooth bite out of the edge, deeper toward the tip.
      const saw = (t * notches) % 1;
      const notch = 1 - serrate * Math.min(1, t * 1.5) * (saw < 0.75 ? saw / 0.75 : (1 - saw) / 0.25);
      return [Math.max(thick * (1 - t * 0.6), 1e-4) * Math.min(1, t * 8 + 0.3), Math.max(w * notch, 1e-4)];
    },
    o.paint,
    { segments: serrate ? 24 : 14, radial: 12, ref: new THREE.Vector3(...(o.normal as [number, number, number])), detail: o.detail },
  );
}

// Rounds off the ends of an otherwise open tube (necks), as a radius factor.
export const cap = (t: number, end = 0.06) =>
  Math.sqrt(Math.max(0, 1 - Math.max(0, (end - t) / end, (t - 1 + end) / end) ** 2));

// A smooth wing sheet behind a bone that runs along +x for `length`: a flat
// slab whose chord (front to back, along -z) is chord(u) at fraction u of the
// way out, `thickness` thick, its edges rounded and its ends closed. For wings
// that are one smooth surface rather than separate feathers (Lugia's arm).
export function slab(o: {
  length: number;
  chord: (u: number) => number;
  thickness: number;
  paint: Paint;
  detail?: number;
}) {
  const pts: number[][] = [];
  for (let k = 0; k <= 8; k++) {
    const u = k / 8;
    pts.push([u * o.length, -0.004, -o.chord(u) / 2 + 0.02]);
  }
  return loft(
    pts,
    (t) => {
      const end = cap(t, 0.05);
      return [Math.max(o.thickness * (0.6 + 0.4 * end), 1e-4) * end, Math.max((o.chord(t) / 2) * end, 1e-4)];
    },
    o.paint,
    { segments: 24, radial: 16, ref: new THREE.Vector3(0, 1, 0), detail: o.detail },
  );
}

// A painted ellipsoid, optionally turned (Euler angles) about its centre.
export function blob(center: number[], radii: number[], color: THREE.Color, detail = 1, turn?: number[]) {
  const n = Math.max(6, Math.round(14 * Math.sqrt(detail)));
  const geo = new THREE.SphereGeometry(1, n, Math.round(n * 0.7));
  geo.scale(radii[0], radii[1], radii[2]);
  if (turn) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(turn[0], turn[1], turn[2])));
  geo.translate(center[0], center[1], center[2]);
  geo.deleteAttribute("uv");
  const c = new Float32Array(geo.getAttribute("position").count * 3);
  for (let i = 0; i < c.length; i += 3) color.toArray(c, i);
  geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return geo;
}

// An eyeball: an ellipsoid that remembers each vertex's direction from its
// centre (aDir), so skin.eyes() can paint the iris, pupil, glint and lids per
// pixel, crisp at any size.
export function eyeball(center: number[], radii: number[], detail = 1) {
  const n = Math.max(12, Math.round(28 * Math.sqrt(detail)));
  const geo = new THREE.SphereGeometry(1, n, Math.round(n * 0.75));
  geo.deleteAttribute("uv");
  geo.setAttribute("aDir", geo.getAttribute("position").clone());
  const white = new Float32Array(geo.getAttribute("position").count * 3).fill(1);
  geo.setAttribute("color", new THREE.BufferAttribute(white, 3));
  geo.scale(radii[0], radii[1], radii[2]).translate(center[0], center[1], center[2]);
  return geo;
}

// How an eye looks, in the left eye's frame (the right one is its mirror).
// Angles are radians from the look direction. The upper lid covers the eye
// above `height` (in the eye's unit sphere), dropping by `slant` toward the
// front; `lower` adds a lower lid below that height; `curve` bows both lids
// in toward the corners, for an almond; `inkWidth` is how thick the ink line
// along each lid's edge is.
export type EyeLook = {
  look: number[];
  sclera: string;
  iris: string;
  irisRim: string;
  pupil: string;
  irisSize: number;
  pupilSize: number;
  lid?: { color: string; ink: string; height: number; slant?: number; lower?: number; curve?: number; inkWidth?: number };
};

// Feathers have two vanes either side of the shaft; the inner one is a shade
// darker, which gives every feather its edge.
export const vane = (c: THREE.Color, side: number) => c.multiplyScalar(1 - 0.12 * smooth(0.05, 0.4, -side));

// Mirror a part across the bird's centre plane (left <-> right).
export function mirror(geo: THREE.BufferGeometry) {
  const m = geo.clone().scale(-1, 1, 1);
  const dir = m.getAttribute("aDir");
  if (dir) for (let i = 0; i < dir.count; i++) dir.setX(i, -dir.getX(i));
  // Scaling by -1 flips the winding: swap two indices of every triangle.
  const idx = m.getIndex();
  if (idx) {
    const a = idx.array;
    for (let i = 0; i < a.length; i += 3) [a[i + 1], a[i + 2]] = [a[i + 2], a[i + 1]];
    idx.needsUpdate = true;
  }
  m.computeVertexNormals();
  return m;
}

export const merge = (parts: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(parts.map((g) => (g.index ? g : g.toNonIndexed()))) as THREE.BufferGeometry;
  for (const g of parts) g.dispose();
  return merged;
};

// Paint helpers.
export const hex = (h: string) => new THREE.Color(h);
// A new colour each time, so paints can nest mix() calls.
export const mix = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, Math.min(1, Math.max(0, t)));
export const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

// ---- Shading ---------------------------------------------------------------------

const toonVertex = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vColor = color;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = cameraPosition - w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const toonFragment = /* glsl */ `
  uniform vec3 uLight; // toward the sun or moon, world space
  uniform vec3 uShadow; // multiplies the colour on the shaded side
  uniform vec3 uRim; // sky light around the silhouette
  uniform vec3 uGlow; // emissive tint (Ho-Oh's golden aura)
  uniform float uGlowAmount;
  uniform float uOpacity;
  varying vec3 vColor;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vec3 n = normalize(vNormalW);
    if (!gl_FrontFacing) n = -n;
    vec3 v = normalize(vViewW);
    float d = dot(n, uLight);
    // Anime cel shading: flat colour, one hard-edged shadow tone, and a
    // faint rim of sky light.
    float lit = smoothstep(-0.03, 0.03, d);
    vec3 col = vColor * mix(uShadow, vec3(1.0), lit);
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    col += uRim * smoothstep(0.55, 0.75, 1.0 - ndv) * 0.18;
    col = mix(col, col + uGlow, uGlowAmount * (0.4 + 0.6 * pow(1.0 - ndv, 2.0)));
    gl_FragColor = vec4(col, uOpacity);
  }
`;

// Inverted hull: the back faces, pushed out along the normals, in ink.
const outlineVertex = /* glsl */ `
  uniform float uWidth;
  void main() {
    vec3 p = position + normal * uWidth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const outlineFragment = /* glsl */ `
  uniform vec3 uInk;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uInk, uOpacity);
  }
`;

// Aura: a much wider hull that fades out toward its edge, so a soft glow
// hugs the silhouette (Ho-Oh's golden aura in the anime).
const auraVertex = /* glsl */ `
  uniform float uWidth;
  varying float vFacing;
  void main() {
    vec3 p = position + normal * uWidth;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * normal);
    vFacing = abs(dot(n, normalize(cameraPosition - w.xyz)));
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const auraFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFacing;
  void main() {
    float a = pow(vFacing, 1.6) * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const eyeVertex = /* glsl */ `
  attribute vec3 aDir;
  varying vec3 vDir;
  void main() {
    vDir = aDir;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Each feature is a region of the eye's unit sphere, edged with a one-pixel
// smoothstep so outlines stay crisp at any size.
const eyeFragment = /* glsl */ `
  uniform vec3 uLook;
  uniform vec3 uGlint;
  uniform vec3 uSclera;
  uniform vec3 uIris;
  uniform vec3 uIrisRim;
  uniform vec3 uPupil;
  uniform vec3 uLid;
  uniform vec3 uLidInk;
  uniform float uIrisSize;
  uniform float uPupilSize;
  uniform float uHasLid;
  uniform float uLidHeight;
  uniform float uLidSlant;
  uniform float uLidLower;
  uniform float uLidInkWidth;
  uniform float uLidCurve;
  uniform float uOpacity;
  varying vec3 vDir;
  // 1 where x < 0, antialiased.
  float inside(float x) {
    float w = fwidth(x) * 0.75;
    return 1.0 - smoothstep(-w, w, x);
  }
  void main() {
    vec3 d = normalize(vDir);
    float a = acos(clamp(dot(d, uLook), -1.0, 1.0));
    vec3 col = uSclera;
    // Iris, darkening toward its rim, with a thin dark ring at its edge.
    vec3 iris = mix(uIris, uIrisRim, smoothstep(uPupilSize, uIrisSize, a));
    col = mix(col, uIrisRim * 0.6, inside(a - uIrisSize - 0.04));
    col = mix(col, iris, inside(a - uIrisSize));
    col = mix(col, uPupil, inside(a - uPupilSize));
    float g = acos(clamp(dot(d, uGlint), -1.0, 1.0));
    col = mix(col, vec3(1.0), inside(g - uPupilSize * 0.55));
    if (uHasLid > 0.5) {
      float bow = uLidCurve * d.z * d.z;
      float edge = uLidHeight - uLidSlant * d.z - bow;
      float lower = uLidLower + bow;
      col = mix(col, uLidInk, inside(edge - uLidInkWidth - d.y));
      col = mix(col, uLid, inside(edge - d.y));
      col = mix(col, uLidInk, inside(d.y - lower - uLidInkWidth * 0.7));
      col = mix(col, uLid, inside(d.y - lower));
    }
    gl_FragColor = vec4(col, uOpacity);
  }
`;

export type Skin = ReturnType<typeof createSkin>;

// One toon material and one outline material per creature, shared by all its
// parts. Transparent (so they sort with the cloud by renderOrder) but they
// write depth, so the creature occludes itself correctly.
export function createSkin(o: {
  shadow: string;
  rim: string;
  ink: string;
  outline: number;
  glow?: string;
  aura?: { color: string; width: number; opacity: number };
}) {
  const toon = new THREE.ShaderMaterial({
    uniforms: {
      uLight: { value: new THREE.Vector3(0.45, 0.85, 0.4).normalize() },
      uShadow: { value: hex(o.shadow) },
      uRim: { value: hex(o.rim) },
      uGlow: { value: hex(o.glow ?? "#000000") },
      uGlowAmount: { value: 0 },
      uOpacity: { value: 1 },
    },
    vertexShader: toonVertex,
    fragmentShader: toonFragment,
    vertexColors: true,
    transparent: true,
  });
  const outline = new THREE.ShaderMaterial({
    uniforms: { uWidth: { value: o.outline }, uInk: { value: hex(o.ink) }, uOpacity: { value: 1 } },
    vertexShader: outlineVertex,
    fragmentShader: outlineFragment,
    side: THREE.BackSide,
    transparent: true,
  });
  const aura = o.aura
    ? new THREE.ShaderMaterial({
        uniforms: { uWidth: { value: o.aura.width }, uColor: { value: hex(o.aura.color) }, uOpacity: { value: o.aura.opacity } },
        vertexShader: auraVertex,
        fragmentShader: auraFragment,
        side: THREE.BackSide,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      })
    : null;
  const meshes: THREE.Mesh[] = [];
  const auras: THREE.Mesh[] = [];
  const eyeMats: THREE.ShaderMaterial[] = [];

  // A part: the shaded mesh, its outline and its aura, as one object. Fine
  // line work (a mouth crease) goes without the outline or aura.
  function part(geo: THREE.BufferGeometry, opts: { ink?: boolean } = {}) {
    const mesh = new THREE.Mesh(geo, toon);
    meshes.push(mesh);
    if (opts.ink !== false) {
      const ink = new THREE.Mesh(geo, outline);
      mesh.add(ink);
      meshes.push(ink);
      ink.frustumCulled = false;
    }
    if (aura && opts.ink !== false) {
      const glow = new THREE.Mesh(geo, aura);
      glow.frustumCulled = false;
      mesh.add(glow);
      auras.push(glow);
    }
    mesh.frustumCulled = false;
    return mesh;
  }

  // Both eyes (one geometry, the right mirrored from the left), painted per
  // pixel by the eye shader, with an ink outline like every other part.
  function eyes(geo: THREE.BufferGeometry, e: EyeLook) {
    const look = new THREE.Vector3(...(e.look as [number, number, number])).normalize();
    const lid = e.lid;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uLook: { value: look },
        uGlint: { value: look.clone().add(new THREE.Vector3(0, 0.55, 0.25)).normalize() },
        uSclera: { value: hex(e.sclera) },
        uIris: { value: hex(e.iris) },
        uIrisRim: { value: hex(e.irisRim) },
        uPupil: { value: hex(e.pupil) },
        uLid: { value: hex(lid?.color ?? "#000000") },
        uLidInk: { value: hex(lid?.ink ?? "#000000") },
        uIrisSize: { value: e.irisSize },
        uPupilSize: { value: e.pupilSize },
        uHasLid: { value: lid ? 1 : 0 },
        uLidHeight: { value: lid?.height ?? 2 },
        uLidSlant: { value: lid?.slant ?? 0 },
        uLidLower: { value: lid?.lower ?? -9 },
        uLidInkWidth: { value: lid?.inkWidth ?? 0.18 },
        uLidCurve: { value: lid?.curve ?? 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: eyeVertex,
      fragmentShader: eyeFragment,
      transparent: true,
    });
    // Eyes are small: a body-weight outline would ring them like a monocle.
    const eyeInk = outline.clone();
    eyeInk.uniforms.uWidth.value = o.outline * 0.35;
    eyeMats.push(mat, eyeInk);
    const mesh = new THREE.Mesh(geo, mat);
    const ink = new THREE.Mesh(geo, eyeInk);
    mesh.add(ink);
    meshes.push(mesh, ink);
    for (const m of [mesh, ink]) m.frustumCulled = false;
    return mesh;
  }

  // Behind the cloud the creature draws before it (so the cloud covers it),
  // in front of it after the cloud and the face. Its aura goes just before it.
  function setOrder(order: number) {
    for (const m of meshes) m.renderOrder = order;
    for (const m of auras) m.renderOrder = order - 0.3;
  }

  function setOpacity(a: number) {
    toon.uniforms.uOpacity.value = a;
    outline.uniforms.uOpacity.value = a;
    if (aura && o.aura) aura.uniforms.uOpacity.value = o.aura.opacity * a;
    for (const m of eyeMats) m.uniforms.uOpacity.value = a;
  }

  return { toon, outline, part, eyes, setOrder, setOpacity };
}

// ---- Wings -----------------------------------------------------------------------
// Three jointed segments (arm, forearm, hand), each a group whose children are
// already merged into one mesh per segment. A flap is a travelling wave down
// the joints, so the wing bends through the stroke instead of hinging.

export type WingJoints = { shoulder: THREE.Group; elbow: THREE.Group; wrist: THREE.Group };

export function buildWing(
  skin: Skin,
  segments: [THREE.BufferGeometry, THREE.BufferGeometry, THREE.BufferGeometry],
  lengths: [number, number],
  side: 1 | -1,
): WingJoints & { root: THREE.Group } {
  const root = new THREE.Group();
  if (side < 0) root.scale.x = -1; // the right wing is the left one, mirrored
  const shoulder = new THREE.Group();
  const elbow = new THREE.Group();
  const wrist = new THREE.Group();
  root.add(shoulder);
  shoulder.add(skin.part(segments[0]), elbow);
  elbow.position.x = lengths[0];
  elbow.add(skin.part(segments[1]), wrist);
  wrist.position.x = lengths[1];
  wrist.add(skin.part(segments[2]));
  return { root, shoulder, elbow, wrist };
}

// Poses a wing for a flap phase. `amp` is the stroke amplitude, `lift` a
// dihedral (wings held up in a V), `sweep` folds the hand back on the upstroke.
export function flap(w: WingJoints, phase: number, amp: number, lift: number, sweep: number) {
  w.shoulder.rotation.z = lift + Math.sin(phase) * amp;
  w.elbow.rotation.z = Math.sin(phase - 0.6) * amp * 0.55;
  w.wrist.rotation.z = Math.sin(phase - 1.2) * amp * 0.7;
  // Feathers feather: the wing twists and the hand tucks back on the upstroke.
  w.shoulder.rotation.x = Math.cos(phase) * amp * 0.18;
  w.wrist.rotation.y = sweep * (0.5 + 0.5 * Math.cos(phase));
}
