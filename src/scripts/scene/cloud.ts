import * as THREE from "three";
import { clamp, damp, glowTexture, PALETTE, smoothstep } from "./util";
import { bakeNoise } from "./noise";
import type { CloudTarget } from "./anchors";
import { createUfo } from "./ufo";
import { createLightning } from "./lightning";

// A volumetric cumulus, ray-marched on the GPU inside a box. Its shape is a
// soft union of spheres with a flattened base, eroded by baked 3D noise into
// billows and wisps, and lit with self-shadowing toward a sun up and to the
// right. Three little UFOs (AWS, Azure, GCP) orbit it.

// Sphere lobes in the cloud's local space (x, y, z, radius). A flat-ish row
// underneath, billows on top, and two lobes front and back for depth.
const LOBES: [number, number, number, number][] = [
  [-0.8, -0.16, 0.0, 0.3],
  [-0.42, -0.12, 0.06, 0.38],
  [0.02, -0.1, -0.04, 0.42],
  [0.45, -0.12, 0.04, 0.37],
  [0.82, -0.16, 0.0, 0.29],
  [-0.4, 0.15, 0.0, 0.4],
  [0.06, 0.3, 0.0, 0.5],
  [0.5, 0.13, 0.02, 0.37],
  [-0.14, 0.48, -0.06, 0.3],
  [0.0, 0.02, -0.32, 0.42],
  [0.12, 0.04, 0.34, 0.4],
];
const FLOOR = -0.36;
const TOP = 0.86;
const WIDTH = 2.05; // visual width, used to fit the cloud to its anchor
const BOX_MIN = new THREE.Vector3(-1.32, FLOOR - 0.08, -0.98);
const BOX_MAX = new THREE.Vector3(1.32, TOP + 0.12, 0.98);
// Default light direction (world space); world.ts steers it toward the sun
// or moon in the sky.
const SUN = new THREE.Vector3(0.45, 0.85, 0.4).normalize();

// Orbits are tilted only a little so the saucers read from the front.
const ORBS = [
  { label: "AWS", color: "#ff9900", radius: 1.38, tilt: 0.3, roll: 0.14, speed: 0.42, phase: 0.4 },
  { label: "Azure", color: "#2f9bff", radius: 1.58, tilt: -0.34, roll: -0.18, speed: 0.32, phase: 2.4 },
  { label: "GCP", color: "#34c759", radius: 1.22, tilt: 0.5, roll: 0.26, speed: 0.52, phase: 4.4 },
];
const ORBIT_Z = 0.62; // orbits are ellipses, shallower front to back

const vertexShader = /* glsl */ `
  varying vec3 vOrigin;
  varying vec3 vDir;
  void main() {
    // Ray origin and direction in the box's local space.
    vOrigin = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
    vDir = position - vOrigin;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler3D uNoise;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uPuff;
  uniform vec3 uBoxMin;
  uniform vec3 uBoxMax;
  uniform vec3 uSunDir;
  uniform vec3 uSun;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  uniform vec2 uAmbient; // sky light: base, extra toward the top
  uniform vec4 uPointer; // billow drawn toward the cursor (xyz, radius)
  uniform vec4 uPointer2; // a second one trailing it, for a gooey stretch
  uniform float uPointerK; // how softly the billows blend in
  uniform float uStorm; // 0..1: a click turns the cloud into a thunderhead
  uniform float uFlash; // lightning brightness this frame
  uniform vec3 uFlashPos; // where the current strike starts (local space)
  uniform vec3 uFlashColor;
  uniform vec4 uLobes[LOBES];
  varying vec3 vOrigin;
  varying vec3 vDir;

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Signed distance to the cloud's overall silhouette.
  float shape(vec3 p) {
    float d = 1e3;
    for (int i = 0; i < LOBES; i++) {
      vec4 l = uLobes[i];
      d = smin(d, length(p - l.xyz) - l.w, 0.1);
    }
    d = smin(d, length(p - uPointer.xyz) - uPointer.w, uPointerK);
    d = smin(d, length(p - uPointer2.xyz) - uPointer2.w, uPointerK);
    // Flatten the base like a cumulus.
    return -smin(-d, p.y - FLOOR_Y, 0.12);
  }

  vec3 drift() {
    return vec3(uTime * 0.016, uTime * 0.006, -uTime * 0.011);
  }

  // The billow noise displaces the silhouette into round puffs; the detail
  // noise only frays the outermost edge. Solid inside, with a soft skin.
  float density(vec3 p, float d) {
    if (d > 0.2) return 0.0;
    float base = texture(uNoise, p * 0.55 + drift()).r;
    float detail = texture(uNoise, p * 1.15 - drift() * 2.0).g;
    float dd = d - (base - 0.5) * 0.3 * (1.0 + uPuff * 0.5) + (1.0 - detail) * 0.07;
    return smoothstep(0.03, -0.1, dd);
  }

  // Cheaper density for shadow rays: no detail octave.
  float densityLight(vec3 p) {
    float d = shape(p);
    if (d > 0.2) return 0.0;
    float base = texture(uNoise, p * 0.55 + drift()).r;
    return smoothstep(0.03, -0.1, d - (base - 0.5) * 0.3);
  }

  float sunlight(vec3 p) {
    float sum = 0.0;
    vec3 s = uSunDir * LIGHT_STEP;
    for (int i = 0; i < LIGHT_STEPS; i++) {
      p += s;
      sum += densityLight(p);
    }
    return exp(-sum * LIGHT_STEP * 6.0);
  }

  vec2 hitBox(vec3 ro, vec3 rd) {
    vec3 inv = 1.0 / rd;
    vec3 t0 = (uBoxMin - ro) * inv;
    vec3 t1 = (uBoxMax - ro) * inv;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);
    return vec2(max(max(tmin.x, tmin.y), tmin.z), min(min(tmax.x, tmax.y), tmax.z));
  }

  void main() {
    vec3 ro = vOrigin;
    vec3 rd = normalize(vDir);
    vec2 hit = hitBox(ro, rd);
    if (hit.x > hit.y) discard;
    hit.x = max(hit.x, 0.0);

    // Per-pixel jitter on the start (stable, so no shimmer) hides step banding.
    float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float t = hit.x + STEP * ign;

    vec3 col = vec3(0.0);
    float T = 1.0;
    for (int i = 0; i < MAX_STEPS; i++) {
      if (t > hit.y || T < 0.02) break;
      vec3 p = ro + rd * t;
      float d = shape(p);
      if (d > 0.26) {
        // Far outside the silhouette: skip ahead by the distance.
        t += max(d - 0.2, STEP);
        continue;
      }
      float dens = density(p, d);
      if (dens > 0.003) {
        float h = smoothstep(FLOOR_Y, TOP_Y, p.y);
        float sun = sunlight(p) * mix(1.0, 0.35, uStorm);
        // Sky light: a violet underside shifting between rose and aqua across
        // the cloud, lavender-white on top.
        vec3 tint = mix(uCool, uWarm, 0.5 + 0.5 * sin(p.x * 1.7 + p.z + uTime * 0.25));
        vec3 sky = mix(mix(uSkyBottom, tint, 0.45), uSkyTop, smoothstep(0.0, 0.85, h));
        // "Powder" darkening on thin, sunlit edges reads as cauliflower billows.
        float powder = 1.0 - exp(-dens * 5.0);
        sky = mix(sky, sky * vec3(0.5, 0.52, 0.72), uStorm); // brooding storm light
        vec3 lit = uSun * sun * mix(0.5, 1.0, powder) + sky * (uAmbient.x + uAmbient.y * h);
        // Lightning lights the cloud from inside: bright around the strike,
        // with a dimmer wash through the whole cloud.
        vec3 fd = p - uFlashPos;
        lit += uFlashColor * uFlash * (exp(-dot(fd, fd) * 1.8) * 3.0 + 0.3);
        float a = 1.0 - exp(-dens * STEP * 12.0);
        col += T * a * lit;
        T *= 1.0 - a;
      }
      t += STEP;
    }

    float alpha = 1.0 - T;
    if (alpha < 0.003) discard;
    // Faint glow where the cloud thins out at its edges.
    float edge = alpha * (1.0 - alpha) * 4.0;
    vec3 edgeCol = mix(mix(uCool, uWarm, 0.5 + 0.5 * sin(uTime * 0.3)), uFlashColor, uStorm);
    col += edgeCol * edge * (0.22 + uStorm * 0.05 + uFlash * 0.6);
    gl_FragColor = vec4(col, alpha) * uAlpha;
  }
`;

const THEMES = {
  dark: { sun: "#fff1ea", top: "#d6c8ff", bottom: "#4b2fd6", warm: PALETTE.rose, cool: PALETTE.aqua, ambient: [0.3, 0.42] },
  // Light: a sunlit cloud with a warm coral underside. Shadows stay lifted,
  // because dark ones on a pale page read as a storm cloud.
  light: { sun: "#fff0d6", top: "#fffaf3", bottom: "#f7a983", warm: "#ff8f70", cool: "#ffc46b", ambient: [0.72, 0.26] },
};

function noiseTexture(data: Uint8Array, size: number) {
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RGFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

// Bake the noise volume in a worker so start-up never stalls scrolling; fall
// back to an idle-time bake on the main thread if workers are unavailable.
function loadNoise(size: number): Promise<THREE.Data3DTexture> {
  return new Promise((resolve) => {
    const fallback = () => {
      const run = () => resolve(noiseTexture(bakeNoise(size), size));
      "requestIdleCallback" in window ? requestIdleCallback(run) : setTimeout(run, 0);
    };
    try {
      const worker = new Worker(new URL("./noise.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<Uint8Array>) => {
        resolve(noiseTexture(e.data, size));
        worker.terminate();
      };
      worker.onerror = () => {
        worker.terminate();
        fallback();
      };
      worker.postMessage(size);
    } catch {
      fallback();
    }
  });
}

export type CloudFrame = {
  dt: number;
  time: number;
  target: CloudTarget | null;
  scrollVel: number;
  pointer: { x: number; y: number; active: boolean };
  camera: THREE.PerspectiveCamera;
  width: number;
  height: number;
};

export function createCloud(opts: {
  lowPower: boolean;
  light: boolean;
  labels: HTMLElement[];
  onReady?: () => void;
}) {
  const noiseSize = opts.lowPower ? 36 : 48;
  const uniforms = {
    // 1-voxel placeholder until the baked volume arrives.
    uNoise: { value: noiseTexture(new Uint8Array([128, 128]), 1) },
    uTime: { value: 0 },
    uAlpha: { value: 0 },
    uPuff: { value: 0 },
    uBoxMin: { value: BOX_MIN },
    uBoxMax: { value: BOX_MAX },
    uSunDir: { value: SUN.clone() },
    uSun: { value: new THREE.Color() },
    uSkyTop: { value: new THREE.Color() },
    uSkyBottom: { value: new THREE.Color() },
    uWarm: { value: new THREE.Color() },
    uCool: { value: new THREE.Color() },
    uAmbient: { value: new THREE.Vector2() },
    uPointer: { value: new THREE.Vector4(0, 0, 0, 0) },
    uPointer2: { value: new THREE.Vector4(0, 0, 0, 0) },
    uPointerK: { value: 0.05 },
    uStorm: { value: 0 },
    uFlash: { value: 0 },
    uFlashPos: { value: new THREE.Vector3() },
    uFlashColor: { value: new THREE.Color() },
    uLobes: { value: LOBES.map(([x, y, z, r]) => new THREE.Vector4(x, y, z, r)) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    defines: {
      LOBES: LOBES.length,
      FLOOR_Y: FLOOR.toFixed(3),
      TOP_Y: TOP.toFixed(3),
      MAX_STEPS: opts.lowPower ? 56 : 96,
      STEP: opts.lowPower ? "0.07" : "0.045",
      LIGHT_STEPS: opts.lowPower ? 4 : 6,
      LIGHT_STEP: opts.lowPower ? "0.13" : "0.09",
    },
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    side: THREE.BackSide,
  });

  const size = new THREE.Vector3().subVectors(BOX_MAX, BOX_MIN);
  const center = new THREE.Vector3().addVectors(BOX_MAX, BOX_MIN).multiplyScalar(0.5);
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z).translate(center.x, center.y, center.z);
  const volume = new THREE.Mesh(geometry, material);
  volume.renderOrder = 2;
  volume.frustumCulled = false;

  const root = new THREE.Group(); // anchored position + size
  const body = new THREE.Group(); // sway, tilt, squash
  volume.position.y = -(FLOOR + TOP) / 2 + 0.06; // centre the cloud on its anchor
  body.add(volume);
  root.add(body);

  // Lightning lives in root space (unrotated), so its bolts face the camera.
  const lightning = createLightning();
  root.add(lightning.object);

  // ---- Orbiting provider UFOs ---------------------------------------------
  const glow = glowTexture();
  const orbits = new THREE.Group();
  root.add(orbits);
  const ufos = ORBS.map((o) => {
    const plane = new THREE.Group();
    plane.rotation.set(o.tilt, 0, o.roll);
    orbits.add(plane);

    // Faint flight path.
    const ringPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius * ORBIT_Z));
    }
    const ringMat = new THREE.LineBasicMaterial({ color: o.color, transparent: true, opacity: 0.12, depthWrite: false });
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), ringMat);
    ring.renderOrder = 0;
    plane.add(ring);

    const ufo = createUfo(o.color, glow, o.phase);
    plane.add(ufo.ship, ufo.trail);
    return { ...o, ufo, ringMat };
  });

  // ---- State ---------------------------------------------------------------
  const tmp = new THREE.Vector3();
  const ndc = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  // Billow physics. A lead blob springs toward the cursor and a second one
  // trails it, so quick moves stretch the cloud like taffy; nearby billows
  // swell toward them. Letting go doesn't switch anything off: the blobs
  // shrink and sink back inside on underdamped springs and settle with a soft
  // wobble.
  const CENTRE = new THREE.Vector3(0, 0.1, 0);
  const RADII = new THREE.Vector3(1.0, 0.5, 0.62); // the cloud as an ellipsoid
  const lead = { p: CENTRE.clone(), v: new THREE.Vector3() };
  const trailing = { p: CENTRE.clone(), v: new THREE.Vector3() };
  const aim = new THREE.Vector3(0.3, 0.3, 0.4); // last cursor position, local
  const goal = new THREE.Vector3();
  const force = new THREE.Vector3();
  let reach = 0; // 0..1 (may overshoot a little): how drawn-out the billow is
  let reachV = 0;
  const spring = (s: { p: THREE.Vector3; v: THREE.Vector3 }, to: THREE.Vector3, k: number, c: number, dt: number) => {
    force.copy(to).sub(s.p).multiplyScalar(k).addScaledVector(s.v, -c);
    s.v.addScaledVector(force, dt);
    s.p.addScaledVector(s.v, dt);
  };
  const flashRoot = new THREE.Vector3();
  const sunWorld = SUN.clone();
  let storm = 0;
  let stormTime = 0; // seconds of storm left after a click
  let nextStrike = 0;
  let shake = 0;
  let puff = 0;
  let placed = false;
  let alpha = 0;
  let labelsAlpha = 0;
  let lastX = 0;
  let bank = 0;
  let squash = 0;
  let yaw = 0;
  let screen = { x: 0, y: 0, r: 0 };
  let ready = false; // the cloud fades in once its noise is baked
  loadNoise(noiseSize).then((tex) => {
    uniforms.uNoise.value.dispose();
    uniforms.uNoise.value = tex;
    ready = true;
    opts.onReady?.();
  });

  function setTheme(light: boolean) {
    const t = light ? THEMES.light : THEMES.dark;
    uniforms.uSun.value.set(t.sun);
    uniforms.uSkyTop.value.set(t.top);
    uniforms.uSkyBottom.value.set(t.bottom);
    uniforms.uWarm.value.set(t.warm);
    uniforms.uCool.value.set(t.cool);
    uniforms.uAmbient.value.set(t.ambient[0], t.ambient[1]);
    for (const o of ufos) o.ufo.setTheme(light);
    lightning.setTheme(light);
    uniforms.uFlashColor.value.set(light ? "#ff8a3d" : "#9cc4ff");
  }
  setTheme(opts.light);

  // Canvas px -> the point on the z = 0 plane under it.
  function screenToPlane(x: number, y: number, f: CloudFrame, out: THREE.Vector3) {
    ndc.set((x / f.width) * 2 - 1, -(y / f.height) * 2 + 1, 0.5).unproject(f.camera);
    dir.copy(ndc).sub(f.camera.position).normalize();
    const t = -f.camera.position.z / dir.z;
    return out.copy(f.camera.position).addScaledVector(dir, t);
  }

  function update(f: CloudFrame) {
    const { dt, time, target } = f;
    uniforms.uTime.value = time;
    puff = damp(puff, 0, 2.2, dt);
    uniforms.uPuff.value = puff;

    // Each lobe breathes and drifts a little, every frame, and swells and
    // leans toward the hover billow when it's close.
    const breathe = 1 + puff * 0.14;
    const pull = Math.max(reach, 0);
    LOBES.forEach(([x, y, z, r], i) => {
      const lx = x + Math.sin(time * 0.5 + i * 1.7) * 0.025;
      const ly = y + Math.cos(time * 0.6 + i * 2.3) * 0.02;
      const lz = z + Math.sin(time * 0.4 + i * 3.1) * 0.025;
      const dx = lead.p.x - lx, dy = lead.p.y - ly, dz = lead.p.z - lz;
      const w = Math.exp(-(dx * dx + dy * dy + dz * dz) / 0.2) * pull;
      uniforms.uLobes.value[i].set(
        lx + dx * w * 0.18,
        ly + dy * w * 0.18,
        lz + dz * w * 0.18,
        r * breathe * (1 + Math.sin(time * 0.8 + i) * 0.04) * (1 + w * 0.12),
      );
    });

    if (target) {
      screenToPlane(target.x, target.y, f, tmp);
      const worldPerPx = (2 * Math.tan(THREE.MathUtils.degToRad(f.camera.fov / 2)) * f.camera.position.z) / f.height;
      const scale = (target.size * worldPerPx * 0.92) / WIDTH;
      // Scrolling is already smoothed (Lenis), so follow the anchor closely.
      const k = placed ? 1 - Math.exp(-9 * dt) : 1;
      root.position.lerp(tmp, k);
      root.scale.setScalar(THREE.MathUtils.lerp(root.scale.x, scale, k));
      if (!placed) lastX = root.position.x;
      placed = true;
      alpha = damp(alpha, ready ? target.alpha : 0, 3, dt);

      // Bank into sideways motion, stretch a touch with scroll speed.
      const vx = (root.position.x - lastX) / Math.max(dt, 1e-3);
      lastX = root.position.x;
      bank = damp(bank, clamp(-vx * 0.05, -0.3, 0.3), 4, dt);
      squash = damp(squash, clamp(Math.abs(f.scrollVel) / 12000, 0, 0.06), 5, dt);

      // Gentle continuous sway, plus a slow turn as the page progresses.
      yaw = damp(yaw, target.section * 0.55, 2.5, dt);
      body.rotation.y = yaw + Math.sin(time * 0.3) * 0.28;
      body.rotation.x = 0.12 + Math.sin(time * 0.37) * 0.05;
      body.rotation.z = bank + Math.sin(time * 0.27) * 0.03;
      body.scale.set(1 - squash * 0.5, 1 + squash, 1 - squash * 0.5);
      body.position.y = Math.sin(time * 0.7) * 0.04;

      screen = { x: target.x, y: target.y, r: target.size * 0.5 };
    }
    uniforms.uAlpha.value = alpha;

    // Sun direction in the volume's local space.
    volume.updateWorldMatrix(true, false);
    volume.getWorldQuaternion(quat).invert();
    uniforms.uSunDir.value.copy(sunWorld).applyQuaternion(quat);

    // How close the cursor is (the cloud is wider than tall, so squash y).
    let near = 0;
    if (f.pointer.active && screen.r > 0) {
      const dist = Math.hypot(f.pointer.x - screen.x, (f.pointer.y - screen.y) * 1.3) / (screen.r * 1.6);
      near = (1 - smoothstep(dist)) * smoothstep((alpha - 0.3) / 0.5);
      if (near > 0.001) {
        screenToPlane(f.pointer.x, f.pointer.y, f, tmp);
        tmp.z += root.scale.x * 0.35;
        aim.copy(volume.worldToLocal(tmp));
      }
    }
    // The lead blob sits on the cloud's surface in the cursor's direction and
    // reaches out toward the cursor as it nears; with no cursor it sinks
    // back inside.
    goal.copy(aim).sub(CENTRE);
    if (goal.lengthSq() < 1e-6) goal.set(0, 1, 0);
    const surface = goal.length() / Math.hypot(goal.x / RADII.x, goal.y / RADII.y, goal.z / RADII.z);
    goal.setLength(surface * (0.8 + 0.3 * near));
    force.copy(aim).sub(CENTRE).sub(goal).multiplyScalar(0.25 * near);
    goal.add(force).clampLength(0, surface * 1.4).add(CENTRE);
    reachV += (45 * (near - reach) - 7.5 * reachV) * dt;
    reach += reachV * dt;
    spring(lead, goal, 70, 10, dt);
    spring(trailing, lead.p, 26, 6, dt);
    const r = Math.max(reach, 0);
    uniforms.uPointer.value.set(lead.p.x, lead.p.y, lead.p.z, 0.3 * r);
    uniforms.uPointer2.value.set(trailing.p.x, trailing.p.y, trailing.p.z, 0.2 * r);
    uniforms.uPointerK.value = 0.05 + 0.25 * r;

    // After a click the cloud storms for a couple of seconds: it darkens and
    // keeps throwing lightning, then calms.
    stormTime = Math.max(0, stormTime - dt);
    const raging = stormTime > 0;
    storm = damp(storm, raging ? 1 : 0, raging ? 6 : 1.5, dt);
    uniforms.uStorm.value = storm;
    if (raging) {
      nextStrike -= dt;
      if (nextStrike <= 0) {
        const roll = Math.random();
        if (roll < 0.55) lightning.strikeDown();
        else if (roll < 0.8) lightning.strikeSpider();
        else lightning.strikeArc();
        if (Math.random() < 0.3) lightning.strikeArc(); // crackle alongside
        shake = 1;
        nextStrike = 0.12 + Math.random() * 0.4;
      }
    }

    const flash = lightning.update(dt, time, root.scale.x, flashRoot);
    uniforms.uFlash.value = flash;
    tmp.copy(flashRoot);
    root.localToWorld(tmp);
    volume.worldToLocal(tmp);
    uniforms.uFlashPos.value.copy(tmp);

    // Thunder: each strike jolts the cloud.
    shake = damp(shake, 0, 7, dt);
    body.position.x = (Math.random() - 0.5) * 0.045 * shake;
    body.position.y += (Math.random() - 0.5) * 0.03 * shake;

    // UFOs: fade while flying behind the cloud.
    const fleetAlpha = smoothstep((alpha - 0.3) / 0.5);
    orbits.rotation.y = time * 0.05;
    const behind: boolean[] = [];
    for (const o of ufos) {
      const angle = time * o.speed + o.phase;
      o.ufo.ship.position.set(Math.cos(angle) * o.radius, 0, Math.sin(angle) * o.radius * ORBIT_Z);
      o.ufo.ship.getWorldPosition(tmp);
      const depth = (tmp.z - root.position.z) / Math.max(root.scale.x, 1e-3);
      const front = smoothstep((depth + 0.35) / 0.7);
      behind.push(front < 0.5);
      o.ufo.update({
        time,
        angle,
        radius: o.radius,
        zScale: ORBIT_Z,
        opacity: fleetAlpha * (0.22 + 0.78 * front),
        worldScale: root.scale.x,
      });
      o.ringMat.opacity = fleetAlpha * 0.12;
    }

    // DOM labels ride just above each saucer.
    labelsAlpha = damp(labelsAlpha, alpha > 0.85 ? 1 : 0, 4, dt);
    ufos.forEach((o, i) => {
      const el = opts.labels[i];
      if (!el) return;
      o.ufo.ship.getWorldPosition(tmp).project(f.camera);
      const x = (tmp.x * 0.5 + 0.5) * f.width;
      const y = (-tmp.y * 0.5 + 0.5) * f.height;
      el.style.transform = `translate3d(${(x + 12).toFixed(1)}px, ${(y - 30).toFixed(1)}px, 0)`;
      el.style.opacity = (labelsAlpha * (behind[i] ? 0.3 : 1)).toFixed(3);
    });

    // How brightly lightning is flashing, so the sky can light up with it.
    return flash;
  }

  // A click (or tap) on the cloud billows it up and sets off a storm: an
  // immediate strike, then more for the next couple of seconds. Clicking again
  // keeps it going. (The cloud is wider than tall, hence the squashed distance.)
  function poke(x: number, y: number) {
    if (screen.r === 0 || alpha < 0.4) return;
    if (Math.hypot(x - screen.x, (y - screen.y) * 1.6) < screen.r * 0.9) {
      puff = 1;
      stormTime = 2.4;
      lightning.strikeDown();
      lightning.strikeSpider();
      shake = 1;
      nextStrike = 0.15;
    }
  }

  // Where the light comes from (world space, normalised).
  function setLightDir(dir: THREE.Vector3) {
    sunWorld.copy(dir);
  }

  // Point sprite sizes depend on the canvas height (in device pixels).
  function resize(heightPx: number, fov: number) {
    for (const o of ufos) o.ufo.resize(heightPx, fov);
  }

  return { object: root, update, setTheme, poke, resize, setLightDir };
}
