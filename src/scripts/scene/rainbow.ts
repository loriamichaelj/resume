import * as THREE from "three";
import { createSparkles, hsv } from "./sparkles";

// The cloud's daytime reaction to a tap (light mode): instead of a storm, it
// casts a rainbow. The arc springs out of the cloud's flank toward the middle
// of the screen, holds and shimmers for a few seconds, then dissolves from
// the cloud end outward. Twinkling four-pointed sparkles pop off the cloud
// and drift down from the arc. Coordinates are in the cloud's root space
// (unrotated, so the arc faces the camera; the cloud is ~2 wide).

const SEGMENTS = 96;
const R_MID = 0.95; // arc radius, middle of the band
const BAND = 0.22; // band width
const FOOT_Y = -0.08; // where the arc's ends sit (its cloud end is hidden inside the cloud)
const DEPTH = -0.3; // behind the cloud's face, so the cloud covers the arc's foot
const GROW = 0.9; // seconds for the arc to reach its far end
const HOLD = 2.8; // seconds it holds after the last tap
const SPARKS = 64;

const arcVertex = /* glsl */ `
  attribute float aArc;
  attribute float aBand;
  varying float vArc;
  varying float vBand;
  void main() {
    vArc = aArc;
    vBand = aBand;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Red on the outside through violet on the inside, pastel so it reads as
// light through mist on the pale page. Premultiplied output.
const arcFragment = /* glsl */ `
  uniform float uReveal; // 0..1: how far the arc has grown from the cloud
  uniform float uRetract; // 0..1: how much has dissolved, from the cloud end
  uniform float uOpacity;
  uniform float uTime;
  varying float vArc;
  varying float vBand;
  ${hsv}
  void main() {
    float head = smoothstep(uReveal, uReveal - 0.08, vArc);
    float tail = smoothstep(uRetract - 0.08, uRetract, vArc);
    float edge = smoothstep(0.0, 0.2, vBand) * smoothstep(1.0, 0.8, vBand);
    float far = smoothstep(1.0, 0.72, vArc); // the far end fades into the sky
    float shimmer = 0.85 + 0.15 * sin(vArc * 38.0 - uTime * 3.0 + vBand * 5.0);
    vec3 col = hsv((1.0 - vBand) * 0.78, 0.5, 1.0);
    float a = 0.36 * edge * head * tail * far * shimmer * uOpacity;
    gl_FragColor = vec4(col * a, a);
  }
`;

function arcGeometry() {
  const pos: number[] = [];
  const arc: number[] = [];
  const band: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const a = i / SEGMENTS; // 0 at the cloud end
    const theta = Math.PI * (1 - a);
    for (const b of [0, 1]) {
      const r = R_MID + (b - 0.5) * BAND;
      // Shifted so the cloud end sits at x = 0.
      pos.push(R_MID + Math.cos(theta) * r, Math.sin(theta) * r, 0);
      arc.push(a);
      band.push(b);
    }
    if (i < SEGMENTS) {
      const k = i * 2;
      index.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aArc", new THREE.Float32BufferAttribute(arc, 1));
  geo.setAttribute("aBand", new THREE.Float32BufferAttribute(band, 1));
  geo.setIndex(index);
  return geo;
}

export function createRainbow() {
  const group = new THREE.Group();

  // ---- Arc -------------------------------------------------------------------
  const arcUniforms = {
    uReveal: { value: 0 },
    uRetract: { value: 0 },
    uOpacity: { value: 1 },
    uTime: { value: 0 },
  };
  const arc = new THREE.Mesh(
    arcGeometry(),
    new THREE.ShaderMaterial({
      uniforms: arcUniforms,
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide, // mirrored for arcs to the left
    }),
  );
  arc.position.set(0, FOOT_Y, DEPTH);
  arc.renderOrder = 1; // under the cloud (2)
  arc.frustumCulled = false;
  arc.visible = false;
  group.add(arc);

  // ---- Sparkles ----------------------------------------------------------------
  const sparks = createSparkles(SPARKS);
  sparks.object.renderOrder = 4; // over the cloud and its face
  group.add(sparks.object);

  // ---- State -------------------------------------------------------------------
  let active = false;
  let reveal = 0;
  let retract = 0;
  let holdUntil = 0;
  let dir = 1; // +1: the arc goes right, -1: left
  let emit = 0; // sparkles owed to the arc this frame (fractional)
  let now = 0;
  const p = new THREE.Vector3();

  // A point on the arc (root space): a 0..1 from the cloud end, b across the band.
  function arcPoint(a: number, b: number, out: THREE.Vector3) {
    const theta = Math.PI * (1 - a);
    const r = R_MID + (b - 0.5) * BAND;
    return out.set((R_MID + Math.cos(theta) * r) * dir, FOOT_Y + Math.sin(theta) * r, DEPTH + 0.05);
  }

  const spawn = sparks.spawn;

  // A tap: grow a new arc toward `side`, or keep the current one up longer.
  // Either way, a handful of sparkles pop off the top of the cloud.
  function burst(side: number) {
    if (!active || retract > 0.5) {
      active = true;
      dir = side;
      reveal = 0;
      retract = 0;
      arc.scale.x = dir;
    }
    holdUntil = now + GROW + HOLD;
    for (let k = 0; k < 5; k++) {
      const ang = Math.PI * (0.15 + 0.7 * Math.random());
      p.set(Math.cos(ang) * 0.85, 0.05 + Math.sin(ang) * 0.5, 0.45);
      const v = new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0).multiplyScalar(0.35 + Math.random() * 0.35);
      spawn(p, v, 0.08 + Math.random() * 0.06, Math.random(), 0.7 + Math.random() * 0.5);
    }
  }

  // `opacity` fades everything (theme changes, the cloud ghosting behind
  // cards); `worldScale` is the cloud's scale, for the sparkle sizes.
  function update(dt: number, time: number, worldScale: number, opacity: number) {
    now = time;
    arcUniforms.uTime.value = time;
    arcUniforms.uOpacity.value = opacity;

    if (active) {
      reveal = Math.min(1, reveal + dt / GROW);
      const holding = time < holdUntil;
      retract = holding ? Math.max(0, retract - dt) : retract + (1 - retract) * (1 - Math.exp(-1.8 * dt));
      if (retract > 0.985) active = false;
      arcUniforms.uReveal.value = 1 - Math.pow(1 - reveal, 3) + 0.08; // eases out
      arcUniforms.uRetract.value = retract;

      // Sparkles: a burst at the growing tip, then a gentle drizzle off the arc.
      emit += dt * (reveal < 1 ? 10 : 3) * (1 - retract);
      while (emit >= 1) {
        emit -= 1;
        const a = reveal < 1 ? reveal * (0.85 + Math.random() * 0.15) : retract + Math.random() * (0.8 - retract);
        const b = Math.random();
        arcPoint(Math.max(0.1, a), b, p);
        const v = new THREE.Vector3((Math.random() - 0.5) * 0.12, -0.1 - Math.random() * 0.15, 0);
        spawn(p, v, 0.06 + Math.random() * 0.05, (1 - b) * 0.78, 0.9 + Math.random() * 0.8);
      }
    }
    arc.visible = active && opacity > 0.01;

    sparks.update(dt, worldScale, opacity * 0.6);
  }

  // Point sprite sizes depend on the canvas height (in device pixels).
  function resize(heightPx: number, fov: number) {
    sparks.resize(heightPx, fov);
  }

  // Nothing showing or still to fade.
  const idle = () => !active && !sparks.active();

  return { object: group, burst, update, resize, idle };
}
