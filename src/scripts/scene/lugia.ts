import * as THREE from "three";
import { blob, buildWing, cap, createSkin, eyeball, feather, flap, hex, loft, merge, mirror, mix, round, slab, smooth } from "./creature";
import type { EyeLook } from "./creature";

// Lugia, after its official art and 3D model: white with lavender-blue
// shading, in heavy outlines; a light blue belly plate with a V notch at the
// top of the chest; a narrow head pointed at the back with a beak-like snout,
// and from each eye a tall, thin navy spike rising up and out above the head;
// a fan of long navy blades down the back; hand-like wings ending in long,
// square-tipped fingers; a long tail ending in a fan of navy spikes. Same model units as hooh.ts (faces +z, left wing along +x).

const BODY = hex("#f4f4fb");
const SHADE = hex("#c9cbe6");
const WING = hex("#e2e3f2");
const BELLY = hex("#64a8ec");
const BELLY_DEEP = hex("#3f7fd0");
const NAVY = hex("#1f2b9c");
const NAVY_DEEP = hex("#151d74");
const MOUTH_INK = hex("#2b2a45");

// Where the eye sits (left side; mirrored for the right), and how it looks,
// after the official art and 3D model: a white almond, tapering to the front,
// with a small dark iris and pupil looking forward, set in the navy patch at
// the foot of the eye spike. The eyeball is drawn larger and flatter than the
// eye itself: its lids, painted navy, are that patch.
const EYE = new THREE.Vector3(0.062, 0.735, 0.915);
const EYE_SIZE = [0.014, 0.032, 0.054];
const EYES: EyeLook = {
  look: [1, -0.1, 0.35],
  sclera: "#f6f8ff",
  iris: "#26338c",
  irisRim: "#141c58",
  pupil: "#05060f",
  irisSize: 0.5,
  pupilSize: 0.26,
  lid: { color: "#1f2b9c", ink: "#151d74", height: 0.4, slant: 0, lower: -0.34, curve: 0.6, inkWidth: 0.08 },
};
// The mouth line, from the tip of the snout back to below the eye, with the
// small V-shaped ridge of Lugia's beak-like mouth.
const MOUTH = [
  [0.022, 0.64, 1.075],
  [0.038, 0.65, 1.03],
  [0.046, 0.652, 0.995],
  [0.05, 0.643, 0.975],
  [0.053, 0.656, 0.952],
  [0.056, 0.664, 0.92],
  [0.06, 0.684, 0.875],
];

const ARM = 0.42;
const FOREARM = 0.5;
const UP = [0, 1, 0];
const SIDE = [1, 0, 0];

// 0..1..0 triangle wave, for the plate's zigzag edge.
const tri = (x: number) => 1 - 2 * Math.abs((((x % 1) + 1) % 1) - 0.5);

function wingSegments(detail: number): [THREE.BufferGeometry, THREE.BufferGeometry, THREE.BufferGeometry] {
  // As in the 3D model: the arm is one thick, smooth limb whose trailing side
  // is a smooth sheet (no separate feathers), lavender in its shadows; the hand
  // ends in four long, flat, nearly parallel fingers with blunt ends, and a
  // short thumb on top at the wrist.
  const skin = (_t: number, up: number) => mix(BODY, SHADE, 1 - smooth(-0.6, 0.3, up));
  const bone = (len: number, r0: number, r1: number) =>
    loft(
      [
        [0, 0, 0],
        [len * 0.5, 0.02, 0.02],
        [len, 0, 0],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(r0, r1, t) * (t < 0.1 ? 0.75 + t * 2.5 : 1);
        return [r * 0.85, r];
      },
      skin,
      { segments: 12, radial: 14, detail },
    );
  // The sheet runs a little past each joint so the segments overlap smoothly.
  const sheet = (len: number, c0: number, c1: number) =>
    slab({ length: len + 0.06, chord: (u) => THREE.MathUtils.lerp(c0, c1, u), thickness: 0.045, paint: skin, detail });

  const arm = merge([bone(ARM, 0.09, 0.075), sheet(ARM, 0.46, 0.4)]);
  const forearm = merge([bone(FOREARM, 0.075, 0.06), sheet(FOREARM, 0.4, 0.22)]);

  const fingers = Array.from({ length: 4 }, (_, k) => {
    const u = k / 3;
    const a = THREE.MathUtils.lerp(0.82, 1.45, u); // radians out from straight back
    return feather({
      root: [0.03 + u * 0.2, -0.006 - k * 0.003, -0.05 - (1 - u) * 0.14],
      dir: [Math.sin(a), -0.04, -Math.cos(a)],
      normal: UP,
      length: 0.58 + Math.sin(u * Math.PI) * 0.08,
      width: 0.09,
      thickness: 0.036,
      curl: -0.12,
      bend: UP,
      tip: "blunt",
      paint: (t, up) => mix(mix(BODY, WING, smooth(0.2, 0.8, t)), SHADE, (1 - smooth(-0.6, 0.3, up)) * 0.8),
      detail,
    });
  });
  const thumb = feather({
    root: [0.05, 0.03, 0.0],
    dir: [0.75, 0.12, 0.3],
    normal: UP,
    length: 0.22,
    width: 0.07,
    thickness: 0.03,
    curl: -0.05,
    bend: UP,
    tip: "blunt",
    paint: (_t, up) => mix(BODY, SHADE, 1 - smooth(-0.6, 0.3, up)),
    detail,
  });
  const hand = merge([bone(0.22, 0.06, 0.05), ...fingers, thumb]);
  return [arm, forearm, hand];
}

function body(detail: number) {
  const parts: THREE.BufferGeometry[] = [];
  // Torso: deep-chested. The belly plate covers the front and underside, its
  // top edge a zigzag across the chest, deepening in colour underneath.
  parts.push(
    loft(
      [
        [0, 0.05, -0.45],
        [0, 0.0, -0.15],
        [0, 0.03, 0.15],
        [0, 0.14, 0.42],
      ],
      (t) => [round(0.3, t, 0.55, 0.5), round(0.26, t, 0.55, 0.5)],
      (_t, up, _side, p) => {
        // The plate's top edge: a V notch at the centre of the chest.
        const edge = 0.02 + 0.55 * Math.min(Math.abs(p.x), 0.11);
        const d = p.y + (0.4 - p.z) * 0.25;
        const plate = (1 - smooth(edge - 0.006, edge + 0.006, d)) * smooth(-0.32, -0.26, p.z);
        const skin = mix(BODY, SHADE, 1 - smooth(-0.4, 0.5, up));
        return mix(skin, mix(BELLY, BELLY_DEEP, 1 - smooth(-0.28, -0.12, p.y)), plate);
      },
      { segments: 48, radial: 40, detail },
    ),
  );
  // Neck: long and slender, rising forward.
  parts.push(
    loft(
      [
        [0, 0.18, 0.33],
        [0, 0.38, 0.52],
        [0, 0.55, 0.62],
        [0, 0.66, 0.72],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(0.12, 0.08, t) * cap(t);
        return [r, r * 0.9];
      },
      (_t, up) => mix(BODY, SHADE, 1 - smooth(-0.4, 0.5, up)),
      { segments: 20, radial: 14, detail },
    ),
  );
  // Head: streamlined, tapering at the back to a single point ("their head
  // has a point to the back") and forward to a beak-like, slightly hooked
  // snout. The lower jaw is a separate piece, so the mouth reads as a crease.
  parts.push(
    loft(
      [
        [0, 0.81, 0.58],
        [0, 0.77, 0.7],
        [0, 0.745, 0.84],
        [0, 0.7, 0.98],
        [0, 0.645, 1.1],
      ],
      (t) => {
        // Pointed at the back, fullest over the eyes, rounding off at the snout.
        const r = t < 0.38 ? 0.098 * Math.pow(t / 0.38, 0.75) : 0.098 * (1 - 0.7 * Math.pow((t - 0.38) / 0.62, 1.6));
        const cap = t > 0.92 ? Math.sqrt(Math.max(0, 1 - ((t - 0.92) / 0.08) ** 2)) : 1;
        return [Math.max(r * cap, 1e-4), Math.max(r * cap * 0.82, 1e-4)];
      },
      (_t, up) => mix(BODY, SHADE, 1 - smooth(-0.45, 0.45, up)),
      { segments: 56, radial: 48, detail },
    ),
    loft(
      [
        [0, 0.69, 0.84],
        [0, 0.66, 0.96],
        [0, 0.63, 1.05],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(0.05, 0.016, t);
        return [r * 0.7, r];
      },
      SHADE,
      { segments: 12, radial: 12, detail },
    ),
  );
  // The eyes, each at the root of a tall, thin navy spike that rises up, out
  // and back above the head ("their eyes have pointed blue spikes on them").
  const eyeSpike = feather({
    root: [0.06, 0.742, 0.905],
    dir: [0.32, 0.75, -0.8],
    normal: [1, -0.35, 0.3],
    length: 0.4,
    width: 0.044,
    thickness: 0.022,
    curl: 0.05,
    bend: [0, 1, 0],
    tip: "point",
    paint: (t) => mix(NAVY, NAVY_DEEP, smooth(0.3, 1, t)),
    detail,
  });
  const eye = [
    eyeSpike,
  ];
  parts.push(...eye, ...eye.map(mirror));

  // A fan of long navy blades down the back, upright at the shoulders and
  // sweeping further back toward the tail.
  for (let k = 0; k < 6; k++) {
    const u = k / 5;
    const a = THREE.MathUtils.lerp(0.35, 1.05, u); // radians back from vertical
    const size = THREE.MathUtils.lerp(0.34, 0.18, u);
    parts.push(
      feather({
        root: [0, THREE.MathUtils.lerp(0.27, 0.23, u), THREE.MathUtils.lerp(0.3, -0.3, u)],
        dir: [0, Math.cos(a), -Math.sin(a)],
        normal: SIDE,
        length: size,
        width: size * 0.3,
        thickness: 0.022,
        curl: -0.18,
        bend: UP,
        tip: "point",
        paint: (t) => mix(NAVY, NAVY_DEEP, smooth(0.3, 1, t)),
        detail,
      }),
    );
  }

  // Thick thighs, legs folded back, three blunt toes.
  const thigh = blob([0.15, -0.12, -0.08], [0.1, 0.14, 0.18], BODY, detail);
  const shin = loft(
    [
      [0.15, -0.2, -0.12],
      [0.16, -0.28, -0.24],
      [0.15, -0.3, -0.34],
    ],
    () => [0.055, 0.05],
    SHADE,
    { segments: 8, radial: 10, detail },
  );
  parts.push(thigh, mirror(thigh), shin, mirror(shin));
  for (let k = -1; k <= 1; k++) {
    const toe = blob([0.15 + k * 0.035, -0.31, -0.41], [0.018, 0.016, 0.05], BODY, detail);
    parts.push(toe, mirror(toe));
  }
  return merge(parts);
}

function tail(detail: number) {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(
    loft(
      [
        [0, 0, 0],
        [0, -0.05, -0.38],
        [0, -0.03, -0.76],
        [0, 0.04, -1.1],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(0.15, 0.03, Math.pow(t, 0.8));
        return [r, r * 0.95];
      },
      (_t, up) => mix(BODY, SHADE, 1 - smooth(-0.4, 0.5, up)),
      { segments: 28, radial: 12, detail },
    ),
  );
  // Two small plates along the tail, then a fan of three spikes at its tip.
  const spike = (root: number[], dir: number[], length: number, width: number) =>
    feather({ root, dir, normal: SIDE, length, width, thickness: 0.018, curl: -0.05, bend: UP, tip: "point", paint: (t) => mix(NAVY, NAVY_DEEP, t), detail });
  parts.push(spike([0, 0.08, -0.3], [0, 0.6, -1], 0.14, 0.07), spike([0, 0.06, -0.6], [0, 0.6, -1], 0.12, 0.06));
  parts.push(
    spike([0, 0.07, -1.0], [0, 1, -0.45], 0.2, 0.075),
    spike([0, 0.06, -1.04], [0, 0.45, -1], 0.26, 0.08),
    spike([0, 0.04, -1.07], [0, -0.05, -1], 0.2, 0.07),
  );
  return merge(parts);
}

export function createLugia(detail = 1) {
  const skin = createSkin({
    shadow: "#d3d4ec",
    rim: "#dfe6ff",
    ink: "#14141e",
    outline: 0.011,
    glow: "#9fc0ff",
    aura: { color: "#cfe0ff", width: 0.07, opacity: 0.22 },
  });
  const model = new THREE.Group();
  model.add(skin.part(body(detail)));
  // The mouth line each side: a fine dark crease along the jaw, no outline.
  const mouth = loft(MOUTH, () => [0.0035, 0.0035], MOUTH_INK, { segments: 24, radial: 6, detail });
  model.add(skin.part(merge([mouth, mirror(mouth)]), { ink: false }));
  const eye = eyeball([EYE.x, EYE.y, EYE.z], EYE_SIZE, detail);
  model.add(skin.eyes(merge([eye, mirror(eye)]), EYES));

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.05, -0.42);
  tailPivot.add(skin.part(tail(detail)));
  model.add(tailPivot);

  const segs = wingSegments(detail);
  const left = buildWing(skin, segs, [ARM, FOREARM], 1);
  const right = buildWing(skin, segs, [ARM, FOREARM], -1);
  for (const w of [left, right]) {
    w.shoulder.position.set(0.16, 0.2, 0.18);
    model.add(w.root);
  }

  // Mostly a glider: long, slow, powerful beats with long glides between.
  function pose(time: number) {
    // Eases between gliding and beating, with no kink at either end.
    const glide = 0.35 + 0.65 * THREE.MathUtils.smoothstep(Math.sin(time * 0.28), -0.25, 1);
    const phase = time * 1.7;
    for (const w of [left, right]) flap(w, phase, 0.5 * glide, 0.15, 0.3);
    // The tail undulates like it's swimming through the air.
    tailPivot.rotation.x = Math.sin(time * 1.3) * 0.08;
    tailPivot.rotation.y = Math.sin(time * 0.9 + 1) * 0.12;
    model.position.y = -Math.sin(phase - 0.4) * 0.04 * glide;
    return phase;
  }

  return { object: model, skin, pose };
}
