import * as THREE from "three";
import { glowTexture } from "./util";

// Lightning for the storm cloud. Each strike plays out like the real thing:
// a faint stepped leader grows from the cloud, the return stroke cracks
// bright down the whole channel, then 1-3 restrikes flicker along a slightly
// shifted path before the afterglow cools away. Bolts fork, and their forks
// fork again. Ground strikes throw sparks and a flare where they land.
//
// Kinds: ground strikes from the base, "spider" lightning crawling across the
// underside, arcs skittering around the rim, and aimed strikes at a point (the
// UFOs). Each bolt is a
// camera-facing ribbon with a white-hot core, a coloured glow and a wide
// haze. Coordinates are in the cloud's root space (cloud ~2 wide, base
// around y = -0.55).

const POOL = 6;
const SPARKS = 28;
// Main channel + forks + sub-forks, plus a coarse copy of each for the haze.
const MAX_POINTS = 2 * (2 ** 6 + 1 + 4 * (2 ** 4 + 1) + 4 * (2 ** 3 + 1));
const RIBBON = 1.5; // channel ribbon is this many times the core width, for its glow
const HAZE_WIDTH = 3.5; // the haze ribbon, relative to the core width
const HAZE_LEVEL = 10; // aLevel offset that marks a haze ribbon

const vertexShader = /* glsl */ `
  attribute float aSide;
  attribute float aT;
  attribute float aLevel;
  varying float vSide;
  varying float vT;
  varying float vLevel;
  void main() {
    vSide = aSide;
    vT = aT;
    vLevel = aLevel;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uGlow;
  uniform vec3 uAfter;
  uniform float uLife;
  uniform float uReveal;
  uniform float uHeat; // 1 = fresh stroke (white-blue), 0 = cooling afterglow
  uniform float uTime;
  varying float vSide;
  varying float vT;
  varying float vLevel;
  void main() {
    if (vT > uReveal) discard;
    bool isHaze = vLevel >= ${HAZE_LEVEL.toFixed(1)};
    float lv = isHaze ? vLevel - ${HAZE_LEVEL.toFixed(1)} : vLevel;
    // Forks are fainter than the main channel, sub-forks fainter still.
    float level = mix(1.0, 0.55, lv * 0.5);
    // Current shimmering slowly along the channel.
    float shimmer = 0.88 + 0.12 * sin(vT * 24.0 - uTime * 40.0);
    // While the leader grows, its tip burns brightest.
    float tip = uReveal < 0.999 ? smoothstep(uReveal - 0.08, uReveal, vT) * 1.5 : 0.0;
    float taper = 1.0 - vT * 0.55;
    vec3 glowCol = mix(uAfter, uGlow, uHeat);
    float core = 0.0;
    float shape;
    if (isHaze) {
      // Wide soft haze around the channel, from a smoothed path.
      shape = exp(-pow(vSide * 1.7, 2.0)) * 0.24;
    } else {
      float s = vSide * ${RIBBON.toFixed(1)};
      core = exp(-pow(s * 3.0, 2.0));
      shape = core + exp(-pow(s * 1.25, 2.0)) * 0.7;
    }
    vec3 col = mix(glowCol, uCore, core * (0.4 + 0.6 * uHeat));
    float a = clamp(shape * level * taper * shimmer * (uLife + tip), 0.0, 1.0);
    gl_FragColor = vec4(col * a, a);
  }
`;

type Line = { pts: THREE.Vector3[]; width: number; t0: number; t1: number; level: number };
type Spark = { p: THREE.Vector3; v: THREE.Vector3 };

type Bolt = {
  mesh: THREE.Mesh;
  geo: THREE.BufferGeometry;
  mat: THREE.ShaderMaterial;
  flare: THREE.Sprite; // where the bolt leaves the cloud
  impact: THREE.Sprite; // where it lands (ground strikes)
  sparks: THREE.Points;
  sparkData: Spark[];
  lines: Line[];
  age: number;
  active: boolean;
  leader: number; // seconds the leader takes to reach the end
  restrikes: { t: number; amp: number; done: boolean }[];
  end: number; // when the bolt is gone
  power: number; // how much it lights the cloud
  ground: boolean;
  origin: THREE.Vector3;
  tip: THREE.Vector3;
};

// Midpoint displacement: a jagged path from a to b.
function jagged(a: THREE.Vector3, b: THREE.Vector3, depth: number, roughness: number) {
  let pts = [a.clone(), b.clone()];
  let disp = roughness * a.distanceTo(b);
  for (let d = 0; d < depth; d++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const mid = p.clone().lerp(q, 0.5);
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const off = (Math.random() - 0.5) * disp;
      mid.x += (-dy / len) * off;
      mid.y += (dx / len) * off;
      mid.z += (Math.random() - 0.5) * disp * 0.3;
      next.push(mid, q);
    }
    pts = next;
    disp *= 0.55;
  }
  return pts;
}

// Forks off a path: each heads away at an angle from its parent, shorter and
// thinner; with `subforks`, each fork can fork once more.
function forks(parent: Line, count: number, depth: number, subforks: boolean, down: boolean): Line[] {
  const out: Line[] = [];
  for (let i = 0; i < count; i++) {
    const k = 0.15 + Math.random() * 0.6;
    const idx = Math.floor(k * (parent.pts.length - 1));
    const at = parent.pts[idx];
    const next = parent.pts[Math.min(idx + 1, parent.pts.length - 1)];
    const dir = new THREE.Vector3().subVectors(next, at).normalize();
    const turn = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6);
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    const len = (0.25 + Math.random() * 0.35) * (parent.level === 0 ? 1 : 0.55);
    const end = new THREE.Vector3(at.x + (dir.x * c - dir.y * s) * len, at.y + (dir.x * s + dir.y * c) * len, at.z);
    if (down) end.y = Math.min(end.y, at.y - len * 0.3);
    const t0 = parent.t0 + k * (parent.t1 - parent.t0);
    const fork: Line = {
      pts: jagged(at, end, depth, 0.38),
      width: parent.width * 0.55,
      t0,
      t1: t0 + (1 - t0) * 0.7,
      level: parent.level + 1,
    };
    out.push(fork);
    if (subforks && Math.random() < 0.75) out.push(...forks(fork, 1, depth - 1, false, down));
  }
  return out;
}

export function createLightning() {
  const group = new THREE.Group();
  const glow = glowTexture();
  const tmp = new THREE.Vector3();

  const sprite = (color: string) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    s.renderOrder = 7;
    s.visible = false;
    group.add(s);
    return s;
  };

  const bolts: Bolt[] = Array.from({ length: POOL }, () => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 2 * 3), 3));
    geo.setAttribute("aSide", new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 2), 1));
    geo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 2), 1));
    geo.setAttribute("aLevel", new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 2), 1));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(MAX_POINTS * 6), 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uCore: { value: new THREE.Color("#ffffff") },
        uGlow: { value: new THREE.Color("#8fb8ff") },
        uAfter: { value: new THREE.Color("#8a5cff") },
        uLife: { value: 0 },
        uReveal: { value: 0 },
        uHeat: { value: 1 },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    mesh.visible = false;
    group.add(mesh);

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    const sparks = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        map: glow,
        color: "#dbe8ff",
        size: 0.05,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sparks.frustumCulled = false;
    sparks.renderOrder = 7;
    sparks.visible = false;
    group.add(sparks);

    return {
      mesh,
      geo,
      mat,
      flare: sprite("#d8e6ff"),
      impact: sprite("#c4d8ff"),
      sparks,
      sparkData: Array.from({ length: SPARKS }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3() })),
      lines: [],
      age: 0,
      active: false,
      leader: 0.06,
      restrikes: [],
      end: 0,
      power: 0,
      ground: false,
      origin: new THREE.Vector3(),
      tip: new THREE.Vector3(),
    };
  });

  // Writes the bolt's lines into its ribbon buffers: each line as a channel
  // ribbon, plus a wide haze ribbon along a coarse copy of it (a smooth path,
  // so the wide ribbon doesn't fold over itself at the kinks). `jitter` bends
  // the channel smoothly, so a restrike runs down a slightly different path.
  function build(bolt: Bolt, jitter = 0) {
    const pos = bolt.geo.getAttribute("position") as THREE.BufferAttribute;
    const side = bolt.geo.getAttribute("aSide") as THREE.BufferAttribute;
    const tAttr = bolt.geo.getAttribute("aT") as THREE.BufferAttribute;
    const lvl = bolt.geo.getAttribute("aLevel") as THREE.BufferAttribute;
    const index = bolt.geo.getIndex()!;
    let v = 0;
    let n = 0;
    const ribbons: { pts: THREE.Vector3[]; width: number; t0: number; t1: number; level: number }[] = [];
    for (const line of bolt.lines) {
      let pts = line.pts;
      if (jitter) {
        const ph = Math.random() * 6.28;
        const fx = 2 + Math.random() * 2;
        pts = pts.map((p, i) => {
          const t = i / (pts.length - 1);
          const amp = jitter * Math.sin(t * Math.PI); // ends stay put
          return p.clone().add(tmp.set(Math.sin(t * fx * 3.14 + ph), Math.cos(t * fx * 2.6 + ph), 0).multiplyScalar(amp));
        });
      }
      ribbons.push({ ...line, pts, width: line.width * RIBBON });
      const coarse = pts.filter((_, i) => i % 4 === 0);
      if ((pts.length - 1) % 4 !== 0) coarse.push(pts[pts.length - 1]);
      ribbons.push({ ...line, pts: coarse, width: line.width * HAZE_WIDTH, level: line.level + HAZE_LEVEL });
    }
    for (const line of ribbons) {
      const pts = line.pts;
      const start = v;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // Direction averaged over neighbours either side, for gentler bends.
        const q = pts[Math.min(i + 2, pts.length - 1)];
        const o = pts[Math.max(i - 2, 0)];
        const dx = q.x - o.x;
        const dy = q.y - o.y;
        const len = Math.hypot(dx, dy) || 1;
        const t = i / (pts.length - 1);
        const w = line.width * (1 - t * 0.7);
        const nx = (-dy / len) * w;
        const ny = (dx / len) * w;
        const along = line.t0 + t * (line.t1 - line.t0);
        for (const sgn of [-1, 1]) {
          pos.setXYZ(v, p.x + nx * -sgn, p.y + ny * -sgn, p.z);
          side.setX(v, sgn);
          tAttr.setX(v, along);
          lvl.setX(v, line.level);
          v++;
        }
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = start + i * 2;
        index.setX(n++, a);
        index.setX(n++, a + 1);
        index.setX(n++, a + 2);
        index.setX(n++, a + 1);
        index.setX(n++, a + 3);
        index.setX(n++, a + 2);
      }
    }
    bolt.geo.setDrawRange(0, n);
    pos.needsUpdate = side.needsUpdate = tAttr.needsUpdate = lvl.needsUpdate = index.needsUpdate = true;
  }

  function freeBolt() {
    return bolts.find((b) => !b.active) ?? bolts.reduce((a, b) => (a.age > b.age ? a : b));
  }

  function launch(bolt: Bolt, origin: THREE.Vector3, tip: THREE.Vector3, power: number, ground: boolean) {
    build(bolt);
    bolt.age = 0;
    bolt.active = true;
    bolt.power = power;
    bolt.ground = ground;
    bolt.origin.copy(origin);
    bolt.tip.copy(tip);
    bolt.leader = ground ? 0.05 + Math.random() * 0.04 : 0.03;
    // 1-3 restrikes in the half second after the return stroke.
    const count = 1 + Math.floor(Math.random() * 3);
    bolt.restrikes = Array.from({ length: count }, (_, i) => ({
      t: bolt.leader + 0.07 + i * (0.08 + Math.random() * 0.12),
      amp: 0.55 + Math.random() * 0.45,
      done: false,
    }));
    bolt.end = bolt.restrikes[bolt.restrikes.length - 1].t + 0.35;
    bolt.mesh.visible = true;
    bolt.flare.position.copy(origin);
    bolt.flare.visible = true;
    bolt.impact.visible = false;
    bolt.sparks.visible = false;
  }

  // Cloud-to-ground: from the base down past the cloud, forking downward.
  function strikeDown() {
    const bolt = freeBolt();
    const from = new THREE.Vector3((Math.random() - 0.5) * 1.3, -0.4 - Math.random() * 0.1, 0.35 + Math.random() * 0.3);
    const to = new THREE.Vector3(from.x + (Math.random() - 0.5) * 0.9, -1.45 - Math.random() * 0.45, from.z);
    const main: Line = { pts: jagged(from, to, 6, 0.3), width: 0.07, t0: 0, t1: 1, level: 0 };
    bolt.lines = [main, ...forks(main, 2 + Math.floor(Math.random() * 3), 4, true, true)];
    launch(bolt, from, to, 1, true);
  }

  // Spider lightning: crawls sideways across the underside, branching.
  function strikeSpider() {
    const bolt = freeBolt();
    const dir = Math.random() < 0.5 ? -1 : 1;
    const from = new THREE.Vector3(-dir * (0.2 + Math.random() * 0.5), -0.42, 0.5);
    const to = new THREE.Vector3(dir * (0.5 + Math.random() * 0.5), -0.48 - Math.random() * 0.12, 0.5);
    const main: Line = { pts: jagged(from, to, 6, 0.22), width: 0.05, t0: 0, t1: 1, level: 0 };
    bolt.lines = [main, ...forks(main, 3 + Math.floor(Math.random() * 2), 4, true, false)];
    launch(bolt, from, to, 0.75, false);
  }

  // A short crackling arc around the cloud's rim.
  function strikeArc() {
    const bolt = freeBolt();
    const a0 = Math.random() * Math.PI * 2;
    const a1 = a0 + (0.35 + Math.random() * 0.6) * (Math.random() < 0.5 ? -1 : 1);
    const rim = (a: number) => new THREE.Vector3(Math.cos(a) * 1.02, 0.02 + Math.sin(a) * 0.55, 0.45);
    const from = rim(a0);
    const to = rim(a1);
    const main: Line = { pts: jagged(from, to, 5, 0.42), width: 0.04, t0: 0, t1: 1, level: 0 };
    bolt.lines = [main, ...forks(main, 1, 3, false, false)];
    launch(bolt, from, to, 0.45, false);
  }

  // An aimed bolt from the cloud to a point (a UFO): one quick, bright stroke
  // with a couple of forks and a single restrike. Returns the seconds until it
  // lands, so the caller can time the hit.
  function strikeAt(from: THREE.Vector3, to: THREE.Vector3) {
    const bolt = freeBolt();
    const main: Line = { pts: jagged(from, to, 6, 0.24), width: 0.085, t0: 0, t1: 1, level: 0 };
    bolt.lines = [main, ...forks(main, 1 + Math.floor(Math.random() * 2), 4, true, false)];
    // Lights the cloud less than a ground strike, so the bolt isn't lost in
    // the flash.
    launch(bolt, from, to, 0.45, true);
    bolt.leader = 0.045;
    bolt.restrikes = [{ t: 0.13, amp: 0.7, done: false }];
    bolt.end = 0.45;
    return bolt.leader;
  }

  function burstSparks(bolt: Bolt) {
    for (const s of bolt.sparkData) {
      s.p.copy(bolt.tip);
      const a = Math.random() * Math.PI;
      const speed = 0.6 + Math.random() * 1.4;
      s.v.set(Math.cos(a) * speed, Math.sin(a) * speed * 0.9 + 0.2, (Math.random() - 0.5) * 0.4);
    }
    bolt.sparks.visible = true;
    bolt.impact.position.copy(bolt.tip);
    bolt.impact.visible = true;
  }

  // Advances every bolt; returns how brightly the cloud should flash and where.
  function update(dt: number, time: number, worldScale: number, flashOrigin: THREE.Vector3) {
    let flash = 0;
    let strongest = 0;
    for (const b of bolts) {
      if (!b.active) continue;
      const prevAge = b.age;
      b.age += dt;
      const u = b.mat.uniforms;
      u.uTime.value = time;

      let intensity: number;
      if (b.age < b.leader) {
        // The faint stepped leader feels its way down.
        u.uReveal.value = b.age / b.leader;
        intensity = 0.3;
      } else {
        u.uReveal.value = 1;
        if (prevAge < b.leader && b.ground) burstSparks(b);
        const since = b.age - b.leader;
        intensity = Math.exp(-since * 13);
        for (const r of b.restrikes) {
          if (b.age >= r.t) {
            if (!r.done) {
              r.done = true;
              build(b, 0.025);
            }
            intensity += Math.exp(-(b.age - r.t) * 20) * r.amp;
          }
        }
        // The afterglow lingers dimly, cooling in colour.
        intensity += 0.12 * Math.max(0, 1 - since / (b.end - b.leader));
      }
      u.uLife.value = Math.min(intensity, 1.4);
      u.uHeat.value = Math.min(1, intensity * 1.6);

      const flareMat = b.flare.material as THREE.SpriteMaterial;
      flareMat.opacity = Math.min(1, intensity);
      b.flare.scale.setScalar((0.45 + b.power * 0.5) * (0.8 + intensity * 0.5));

      if (b.impact.visible) {
        const im = b.impact.material as THREE.SpriteMaterial;
        im.opacity = Math.min(1, intensity * 1.1);
        b.impact.scale.setScalar(0.5 + intensity * 0.6);
      }
      if (b.sparks.visible) {
        const pos = b.sparks.geometry.getAttribute("position") as THREE.BufferAttribute;
        b.sparkData.forEach((s, i) => {
          s.v.y -= 2.6 * dt; // gravity
          s.v.multiplyScalar(1 - 1.5 * dt); // drag
          s.p.addScaledVector(s.v, dt);
          pos.setXYZ(i, s.p.x, s.p.y, s.p.z);
        });
        pos.needsUpdate = true;
        const sm = b.sparks.material as THREE.PointsMaterial;
        sm.opacity = Math.max(0, 1 - (b.age - b.leader) / 0.55);
        sm.size = 0.045 * worldScale;
      }

      if (b.age > b.end) {
        b.active = false;
        b.mesh.visible = b.flare.visible = b.impact.visible = b.sparks.visible = false;
      }

      const f = (b.age < b.leader ? 0.15 : Math.min(intensity, 1.2)) * b.power;
      flash += f;
      if (f > strongest) {
        strongest = f;
        tmp.copy(b.origin);
      }
    }
    if (strongest > 0) flashOrigin.copy(tmp);
    return Math.min(flash, 1.6);
  }

  function setTheme(light: boolean) {
    const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    for (const b of bolts) {
      // On the pale page, a deep orange glow keeps the bolts visible.
      b.mat.blending = blending;
      b.mat.uniforms.uGlow.value.set(light ? "#f97316" : "#8fb8ff");
      b.mat.uniforms.uAfter.value.set(light ? "#e11d48" : "#8a5cff");
      b.mat.uniforms.uCore.value.set(light ? "#fff7ed" : "#ffffff");
      b.mat.needsUpdate = true;
      for (const s of [b.flare, b.impact]) {
        const m = s.material as THREE.SpriteMaterial;
        m.blending = blending;
        m.color.set(light ? "#ffb37a" : "#d8e6ff");
      }
      const sm = b.sparks.material as THREE.PointsMaterial;
      sm.blending = blending;
      sm.color.set(light ? "#ea580c" : "#dbe8ff");
    }
  }

  return { object: group, strikeDown, strikeSpider, strikeArc, strikeAt, update, setTheme };
}
