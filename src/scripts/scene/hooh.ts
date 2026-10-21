import * as THREE from "three";
import { blob, buildWing, cap, createSkin, eyeball, feather, flap, hex, loft, merge, mirror, mix, round, smooth, vane } from "./creature";
import type { EyeLook } from "./creature";

// Ho-Oh, the rainbow phoenix, after the anime and its official art: it flies
// with its neck stretched out level and a long, hooked yellow-orange beak; a
// large dark eye under a stern red brow; and a pompadour crest of rounded
// orange-gold lobes. A lime ring circles the base of the neck. The body is
// mostly white, red across the back and upper chest; dark navy-grey feet are
// tucked beneath. Each wing is a layer of long, broad red feathers (with a
// dark maroon streak) over long, pointed white flight feathers that stand out
// beyond them. The tail is a fan of orange plumes paling to yellow, with
// notched ends. A golden aura (from the anime) hugs the whole silhouette.
// Model units: the body is ~1 long; legends.ts scales it to the cloud.

const RED = hex("#ec4a2c");
const RED_ORANGE = hex("#f46a33");
const MAROON = hex("#a3392a");
const WHITE = hex("#fffcef");
const CREAM = hex("#fdf3d8");
const GOLD = hex("#ffc53a");
const GOLD_DEEP = hex("#f0a020");
const ORANGE = hex("#f39a1e");
const PALE = hex("#fdf1a0");
const LIME = hex("#a8d55a");
const LIME_DEEP = hex("#86b83e");
const BEAK = hex("#f7b92e");
const BEAK_DEEP = hex("#dc9a1c");
const BELLY_SHADE = hex("#dde0e8");
const CLAW = hex("#f2f0ea");
const FEET = hex("#4b4d6b");
const FEET_DEEP = hex("#36384f");

// The eye, as the anime draws it: a large dark slate oval (the "black ring"),
// with a white crescent and a small dark pupil at its front edge, and a
// red-orange brow cutting diagonally across its top front, edged in ink, for
// Ho-Oh's stern look. Dark and high-contrast, so it still reads when small.
const EYE_AT = [0.066, 0.238, 0.893];
const EYE_SIZE = [0.024, 0.042, 0.062];
const EYES: EyeLook = {
  look: [0.5, 0.02, 1],
  sclera: "#4a4d5a",
  iris: "#fbf8f2",
  irisRim: "#ece4da",
  pupil: "#3a1210",
  irisSize: 0.5,
  pupilSize: 0.2,
  lid: { color: "#e2552f", ink: "#2a150e", height: 0.5, slant: 0.6 },
};

const ARM = 0.38;
const FOREARM = 0.45;
const UP = [0, 1, 0];

type FeatherPaint = Parameters<typeof feather>[0]["paint"];
// Red covert: orange toward the leading edge of the wing, red behind.
const redFeather = (t: number, _up: number, side: number) => vane(mix(RED_ORANGE, RED, smooth(0.0, 0.6, t)), side);
// Maroon-patched covert: the long dark streak through the middle of the red.
const patched = (t: number, _up: number, side: number) =>
  vane(mix(RED, MAROON, smooth(0.18, 0.32, t) * (1 - smooth(0.62, 0.78, t))), side);
// Flight feather, as the anime draws it: red for most of its length, white
// for the part that stands out beyond the red coverts, so the wing is red
// from above and below with a white trailing edge.
const whiteFeather = (t: number, _up: number, side: number) =>
  vane(mix(RED, CREAM, smooth(0.56, 0.66, t)).lerp(WHITE, smooth(0.7, 0.9, t)), side);

function wingSegments(detail: number): [THREE.BufferGeometry, THREE.BufferGeometry, THREE.BufferGeometry] {
  const bone = (len: number, r0: number, r1: number) =>
    loft(
      [
        [0, 0, 0],
        [len * 0.5, 0.012, 0.012],
        [len, 0, 0],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(r0, r1, t) * (t < 0.1 ? 0.75 + t * 2.5 : 1);
        return [r * 0.8, r];
      },
      RED_ORANGE,
      { segments: 10, radial: 10, detail },
    );

  // A row of pointed feathers along a segment, fanning from angle[0] to
  // angle[1] (radians outward from straight back). Neighbours overlap well, so
  // the wing reads as one surface rather than a comb.
  const row = (
    len: number,
    count: number,
    o: {
      length: (u: number) => number;
      width: number;
      y: number;
      z: number;
      angle: [number, number];
      paint: (k: number) => FeatherPaint;
    },
  ) =>
    Array.from({ length: count }, (_, k) => {
      const u = count === 1 ? 0.5 : k / (count - 1);
      const a = THREE.MathUtils.lerp(o.angle[0], o.angle[1], u);
      return feather({
        root: [len * (0.04 + 0.9 * u), o.y - k * 0.003, o.z],
        dir: [Math.sin(a), -0.05, -Math.cos(a)],
        normal: UP,
        length: o.length(u),
        width: o.width,
        curl: -0.05,
        bend: UP,
        tip: "point",
        paint: o.paint(k),
        detail,
      });
    });

  // As in the anime: long, broad red feathers cover most of the wing (a
  // maroon streak through the middle of the forearm's), and long pointed white
  // flight feathers stand out beyond them all along the trailing edge. The
  // coverts' roots sit over the bone, hiding the joints.
  const arm = merge([
    bone(ARM, 0.036, 0.032),
    ...row(ARM, 5, { length: () => 0.52, width: 0.17, y: 0.024, z: 0.03, angle: [-0.15, 0.05], paint: () => redFeather }),
    ...row(ARM, 5, { length: (u) => 0.8 + u * 0.05, width: 0.17, y: -0.004, z: -0.01, angle: [-0.12, 0.1], paint: () => whiteFeather }),
  ]);
  const forearm = merge([
    bone(FOREARM, 0.032, 0.026),
    ...row(FOREARM, 6, {
      length: (u) => 0.56 - u * 0.06,
      width: 0.16,
      y: 0.024,
      z: 0.03,
      angle: [0.05, 0.32],
      paint: (k) => (k >= 1 && k <= 4 ? patched : redFeather),
    }),
    ...row(FOREARM, 7, { length: (u) => 0.9 - u * 0.06, width: 0.16, y: -0.004, z: -0.01, angle: [0.1, 0.46], paint: () => whiteFeather }),
  ]);
  // The hand: long red primaries sweep up to a pointed tip, white ones
  // showing beyond them.
  const hand = merge([
    bone(0.32, 0.026, 0.014),
    ...row(0.32, 6, { length: (u) => 0.85 + u * 0.2, width: 0.15, y: 0.02, z: 0.02, angle: [0.55, 1.3], paint: () => redFeather }),
    ...row(0.32, 6, { length: (u) => 1.0 + u * 0.15, width: 0.15, y: -0.004, z: 0.0, angle: [0.5, 1.38], paint: () => whiteFeather }),
  ]);
  return [arm, forearm, hand];
}

function body(detail: number) {
  const parts: THREE.BufferGeometry[] = [];
  // Torso: compact, mostly white; red over the back, reaching down to the
  // upper chest at the front and riding high over the rump.
  parts.push(
    loft(
      [
        [0, 0.0, -0.5],
        [0, -0.03, -0.2],
        [0, 0.0, 0.15],
        [0, 0.1, 0.44],
      ],
      (t) => [round(0.25, t, 0.58, 0.55), round(0.22, t, 0.58, 0.55)],
      (t, up) => {
        const edge = 0.3 - 0.4 * t;
        const belly = mix(WHITE, BELLY_SHADE, 1 - smooth(-0.95, -0.55, up));
        return mix(belly, RED, smooth(edge - 0.025, edge + 0.025, up));
      },
      { segments: 56, radial: 64, detail },
    ),
  );
  // Neck: stretched forward, nearly level; the lime ring near its base.
  parts.push(
    loft(
      [
        [0, 0.11, 0.36],
        [0, 0.16, 0.58],
        [0, 0.2, 0.78],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(0.11, 0.075, t) * cap(t);
        return [r, r * 0.95];
      },
      (t) => {
        const ring = smooth(0.1, 0.13, t) * (1 - smooth(0.25, 0.28, t));
        const rim = smooth(0.1, 0.13, t) * (1 - smooth(0.13, 0.16, t)) + smooth(0.22, 0.25, t) * (1 - smooth(0.25, 0.28, t));
        return mix(mix(RED, LIME, ring), LIME_DEEP, rim * 0.6);
      },
      { segments: 24, radial: 14, detail },
    ),
  );
  // Head: long and low, flowing out of the neck. Red above; the beak's yellow
  // runs back along the jaw beneath the eye.
  parts.push(
    loft(
      [
        [0, 0.2, 0.72],
        [0, 0.225, 0.86],
        [0, 0.215, 1.0],
      ],
      (t) => [round(0.088, t, 0.35, 0.6), round(0.08, t, 0.35, 0.6)],
      (t, up) => {
        const jaw = smooth(0.35, 0.55, t) * (1 - smooth(-0.3, 0.05, up + (t - 0.6) * 0.8));
        return mix(RED, BEAK, jaw);
      },
      { segments: 20, radial: 16, detail },
    ),
  );
  // Beak: long, flat and slightly downturned; a thinner lower mandible.
  parts.push(
    loft(
      [
        [0, 0.228, 0.95],
        [0, 0.222, 1.1],
        [0, 0.2, 1.24],
        [0, 0.15, 1.32],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(0.058, 0.008, Math.pow(t, 1.3));
        return [r * 0.85, r * 1.1];
      },
      (_t, up) => mix(BEAK, BEAK_DEEP, 1 - smooth(-0.5, 0.1, up)),
      { segments: 16, radial: 12, detail },
    ),
    loft(
      [
        [0, 0.175, 0.97],
        [0, 0.165, 1.12],
        [0, 0.155, 1.24],
      ],
      (t) => {
        const r = THREE.MathUtils.lerp(0.032, 0.006, t);
        return [r * 0.7, r];
      },
      BEAK_DEEP,
      { segments: 10, radial: 10, detail },
    ),
  );
  // The eye, as in the official art: a big round white eye bulging from a
  // dark grey socket that curves round behind it; a red iris and pupil looking
  // forward; a heavy red upper lid, edged in ink, slanting down toward the
  // beak for its stern, half-lidded look.
  // (The eyes themselves are drawn by the eye shader: see EYES.)

  // Crest: a pompadour of rounded golden lobes rising from the back of the
  // head and curling forward.
  for (let k = 0; k < 6; k++) {
    const u = k / 5;
    const side = (k % 2 ? 1 : -1) * 0.014;
    // Fanning from swept back (k = 0) to upright (k = 5).
    const a = THREE.MathUtils.lerp(-1.15, 0.05, u);
    parts.push(
      feather({
        root: [side, 0.27, 0.9 - u * 0.06],
        dir: [side * 1.5, Math.cos(a), Math.sin(a)],
        normal: [1, 0, 0],
        length: 0.24 + Math.sin(u * Math.PI) * 0.08,
        width: 0.058,
        thickness: 0.034,
        curl: 0.45,
        bend: [0, 0, 1],
        paint: (t) => mix(GOLD_DEEP, GOLD, smooth(0.2, 0.9, t)),
        detail,
      }),
    );
  }

  // Grey feet tucked up under the rump.
  const foot = blob([0.06, -0.21, -0.3], [0.065, 0.05, 0.12], FEET, detail, [0.2, 0, 0]);
  const toes = blob([0.06, -0.23, -0.42], [0.05, 0.035, 0.06], FEET_DEEP, detail);
  parts.push(foot, toes, mirror(foot), mirror(toes));
  // White talons curled under the clenched feet.
  for (let k = -1; k <= 1; k++) {
    const claw = blob([0.06 + k * 0.022, -0.255, -0.455], [0.009, 0.012, 0.018], CLAW, detail, [0.6, 0, 0]);
    parts.push(claw, mirror(claw));
  }
  return merge(parts);
}

function tail(detail: number) {
  // A fan of long golden plumes spread in the vertical plane (so they read in
  // profile, as in the anime), each with a few lightning-bolt notches; a
  // shorter layer either side fills it out.
  const plumes: THREE.BufferGeometry[] = [];
  const layer = (count: number, spread: number, length: number, x: number, width: number) => {
    for (let k = 0; k < count; k++) {
      const u = k / (count - 1) - 0.5;
      plumes.push(
        feather({
          root: [x + u * 0.03, u * 0.08, 0],
          dir: [u * 0.25 + x * 2, 0.06 + u * spread, -1],
          normal: [1, 0, u * 0.25],
          length: length * (1 - Math.abs(u) * 0.45),
          width,
          thickness: 0.016,
          curl: 0.08,
          bend: UP,
          serrate: 0.38,
          notches: 3.2,
          tip: "point",
          paint: (t) => mix(ORANGE, GOLD, smooth(0.25, 0.6, t)).lerp(PALE, smooth(0.65, 0.95, t)),
          detail,
        }),
      );
    }
  };
  layer(9, 0.95, 1.4, 0, 0.15);
  layer(6, 0.7, 0.95, 0.045, 0.12);
  layer(6, 0.7, 0.95, -0.045, 0.12);
  return merge(plumes);
}

export function createHoOh(detail = 1) {
  const skin = createSkin({
    shadow: "#e9e1e2",
    rim: "#fff4c8",
    ink: "#2a150e",
    outline: 0.011,
    glow: "#ffd84a",
    aura: { color: "#ffd23c", width: 0.1, opacity: 0.5 },
  });
  const model = new THREE.Group();
  model.add(skin.part(body(detail)));
  const eye = eyeball(EYE_AT, EYE_SIZE, detail);
  model.add(skin.eyes(merge([eye, mirror(eye)]), EYES));

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.02, -0.46);
  tailPivot.add(skin.part(tail(detail)));
  model.add(tailPivot);

  const segs = wingSegments(detail);
  const left = buildWing(skin, segs, [ARM, FOREARM], 1);
  const right = buildWing(skin, segs, [ARM, FOREARM], -1);
  for (const w of [left, right]) {
    w.shoulder.position.set(0.12, 0.16, 0.12);
    model.add(w.root);
  }

  // Slow, majestic beats with the wings held high, easing into glides.
  function pose(time: number) {
    const glide = 0.55 + 0.45 * Math.sin(time * 0.35);
    const phase = time * 2.3;
    for (const w of [left, right]) flap(w, phase, 0.6 * glide, 0.55, 0.25);
    tailPivot.rotation.x = Math.sin(phase - 1.8) * 0.05 * glide - 0.03;
    tailPivot.rotation.y = Math.sin(time * 0.9) * 0.05;
    // The body rises on each downstroke.
    model.position.y = -Math.sin(phase - 0.4) * 0.05 * glide;
    return phase;
  }

  return { object: model, skin, pose };
}
