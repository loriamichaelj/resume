import * as THREE from "three";
import { createHoOh } from "./hooh";
import { createLugia } from "./lugia";

// The legendary birds circling the cloud by day, on tilted orbits like the
// UFOs' (cloud.ts): Ho-Oh and Lugia, always on
// opposite sides of the cloud (the same angular speed, half a turn apart).
// They leave at night, when the UFOs come out. Each faces along its orbit,
// banks into the turn and pitches with its wingbeats.
// While on the far side of the cloud a bird draws before it, so the cloud's
// mist really covers it; on the near side it draws after the cloud and face.
// Coordinates are in the cloud's root space (the cloud is ~2 wide).

const ORBIT_Z = 0.62; // ellipses, shallower front to back (as the UFOs')
const SPEED = 0.19; // radians per second, shared so the pair stays opposite
const PHASE = 2.2; // Ho-Oh's start on its orbit; Lugia starts half a turn on
const BEHIND = 1; // render order behind the cloud (2)
const IN_FRONT = 5; // in front of the cloud and its face (3)

export type LegendsFrame = {
  time: number;
  dt: number;
  day: number; // 0 night .. 1 day
  visible: number; // 0..1: the cloud's own visibility (ghosted behind cards)
  light: THREE.Vector3; // toward the sun or moon, world space
  rootZ: number; // the cloud's world z, to tell near side from far
};

export function createLegends(opts: { detail: number; glow: THREE.Texture }) {
  const group = new THREE.Group();

  const birds = [
    {
      ...createHoOh(opts.detail),
      radius: 1.5,
      phase: PHASE,
      tilt: 0.24,
      roll: -0.1,
      scale: 0.2,
      glowColor: "#ffd24a",
      glowSize: 0.85,
      glowOpacity: 0.3,
      sheen: 0.12,
    },
    {
      ...createLugia(opts.detail),
      radius: 1.6,
      phase: PHASE + Math.PI,
      tilt: -0.2,
      roll: 0.12,
      scale: 0.185,
      glowColor: "#a9c4ff",
      glowSize: 0.95,
      glowOpacity: 0.18,
      sheen: 0.04,
    },
  ].map((b) => {
    const plane = new THREE.Group(); // the orbit's tilt
    plane.rotation.set(b.tilt, 0, b.roll);
    const carrier = new THREE.Group(); // on the orbit, facing along it, banked
    carrier.rotation.order = "YXZ";
    plane.add(carrier);
    b.object.scale.setScalar(b.scale);
    carrier.add(b.object);
    b.skin.toon.uniforms.uGlowAmount.value = b.sheen;

    // A soft aura behind the bird.
    const aura = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: opts.glow,
        color: b.glowColor,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
      }),
    );
    aura.scale.setScalar(b.glowSize);
    carrier.add(aura);
    group.add(plane);
    return { ...b, plane, carrier, aura, vis: 0 };
  });

  const world = new THREE.Vector3();

  function update(f: LegendsFrame) {
    for (const b of birds) {
      b.vis = THREE.MathUtils.damp(b.vis, f.day > 0.5 ? 1 : 0, 2.5, f.dt);
      const opacity = b.vis * f.visible;
      b.plane.visible = opacity > 0.01;
      if (!b.plane.visible) continue;

      // On the orbit, facing along its tangent.
      const a = f.time * SPEED + b.phase;
      const x = Math.cos(a) * b.radius;
      const z = Math.sin(a) * b.radius * ORBIT_Z;
      const tx = -Math.sin(a) * b.radius;
      const tz = Math.cos(a) * b.radius * ORBIT_Z;
      const yaw = Math.atan2(tx, tz);
      // Bank toward the orbit's centre (the bird's left is +x).
      const toCentre = Math.sign(-x * Math.cos(yaw) + z * Math.sin(yaw)) || 1;
      const phase = b.pose(f.time);
      b.carrier.position.set(x, 0, z);
      b.carrier.rotation.set(-Math.sin(phase - 0.6) * 0.05, yaw, -toCentre * 0.32);

      b.skin.toon.uniforms.uLight.value.copy(f.light);
      b.skin.setOpacity(opacity);
      (b.aura.material as THREE.SpriteMaterial).opacity = b.glowOpacity * opacity * (0.85 + 0.15 * Math.sin(f.time * 2));

      // Near or far side of the cloud decides the draw order.
      b.carrier.getWorldPosition(world);
      const behind = world.z < f.rootZ;
      b.skin.setOrder(behind ? BEHIND : IN_FRONT);
      b.aura.renderOrder = (behind ? BEHIND : IN_FRONT) - 0.5;
    }
  }

  return { object: group, update };
}
