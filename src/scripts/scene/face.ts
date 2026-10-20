import * as THREE from "three";

// The cloud's face: a cartoon face drawn with signed distance fields on a
// plane that sits on the front of the cloud, so every feature can morph
// smoothly between expressions. cloud.ts drives it: happy and relaxed by
// default (smiling, blinking, glancing around, the odd happy squint), grumpy
// while it storms (a gentle frown of the brows, slightly narrowed eyes, a
// pout and a small anger mark), shouting as it fires, and smug after a win.

export type Expression = {
  anger: number; // 0 happy .. 1 furious
  blink: number; // 0 open .. 1 shut
  squint: number; // 0 open .. 1 happy closed-eye arcs (^ ^)
  look: THREE.Vector2; // pupil offset, roughly -1..1
  smile: number; // mouth curve: 1 big smile .. -1 deep frown
  shout: number; // 0 closed .. 1 wide open
  wide: number; // 0 normal .. 1 eyes wide (curious)
  opacity: number;
  time: number;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uAnger;
  uniform float uBlink;
  uniform float uSquint;
  uniform vec2 uLook;
  uniform float uSmile;
  uniform float uShout;
  uniform float uWide;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uInk;
  uniform vec3 uBlush;
  varying vec2 vUv;

  float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
  }
  // Approximate distance to an ellipse (good enough for small, soft shapes).
  float sdEllipse(vec2 p, vec2 r) {
    float k = length(p / r);
    return (k - 1.0) * min(r.x, r.y);
  }
  // A curved stroke: y = c + k x^2 for |x| < w, drawn as short capsules.
  float sdCurve(vec2 p, float c, float k, float w, float r) {
    float d = 1e3;
    vec2 prev = vec2(-w, c + k * w * w);
    for (int i = 1; i <= 10; i++) {
      float x = -w + 2.0 * w * float(i) / 10.0;
      vec2 cur = vec2(x, c + k * x * x);
      d = min(d, sdCapsule(p, prev, cur, r));
      prev = cur;
    }
    return d;
  }

  // Straight-alpha "over": paints col at coverage a on top of dst.
  vec4 over(vec4 dst, vec3 col, float a) {
    float outA = a + dst.a * (1.0 - a);
    vec3 rgb = (col * a + dst.rgb * dst.a * (1.0 - a)) / max(outA, 1e-4);
    return vec4(rgb, outA);
  }
  float fill(float d) {
    float aa = fwidth(d) * 1.2;
    return 1.0 - smoothstep(-aa, aa, d);
  }

  void main() {
    // Plane space: x -1..1 across, y scaled to keep shapes round.
    vec2 p = (vUv - 0.5) * vec2(2.0, 2.0 * 0.62);
    vec4 o = vec4(0.0);
    vec3 ink = mix(uInk, uInk * 0.85, uAnger);

    // Rosy cheeks, fading out as it gets angry.
    for (int s = -1; s <= 1; s += 2) {
      vec2 q = p - vec2(float(s) * 0.5, -0.08);
      float b = exp(-dot(q / vec2(0.13, 0.07), q / vec2(0.13, 0.07)));
      o = over(o, uBlush, b * 0.45 * (1.0 - 0.5 * uAnger));
    }

    // Eyes.
    for (int s = -1; s <= 1; s += 2) {
      float side = float(s);
      vec2 c = vec2(side * 0.3, 0.1);
      vec2 e = p - c;
      float open = clamp(1.0 - uBlink, 0.0, 1.0);
      vec2 r = vec2(0.085, (0.115 + 0.02 * uWide) * open + 0.006);
      float eye = fill(sdEllipse(e, r));
      // Angry lids: a slanted cut, lower toward the middle.
      float lid = c.y + 0.11 - uAnger * (0.03 + 0.015 * (-side * e.x / 0.085));
      eye *= 1.0 - smoothstep(lid - 0.008, lid + 0.008, p.y) * uAnger;
      // Happy squint: the eye becomes an upturned arc ( ^ ).
      float arc = fill(sdCurve(e - vec2(0.0, -0.02), 0.035, -3.2, 0.075, 0.018));
      eye = mix(eye, arc, uSquint);
      o = over(o, ink, eye);
      // Catchlights, following the gaze.
      vec2 hl = e - uLook * vec2(0.025, 0.02) - vec2(-0.025, 0.04 * open);
      float shine = fill(length(hl) - 0.024 * open) + fill(length(hl - vec2(0.045, -0.06 * open)) - 0.011 * open);
      // Only inside the (possibly narrowed) eye.
      o = over(o, vec3(1.0), clamp(shine, 0.0, 1.0) * eye * (1.0 - uSquint) * open);

      // Brows: slanted down toward the middle when angry.
      float inner = c.y + 0.21 - uAnger * 0.022;
      float outer = c.y + 0.21 + uAnger * 0.008;
      float brow = fill(sdCapsule(p, vec2(c.x - side * 0.02, inner), vec2(c.x + side * 0.1, outer), 0.017));
      o = over(o, ink, brow * smoothstep(0.05, 0.4, uAnger) * 0.9);
    }

    // Mouth: a smile that flattens into a small pout when grumpy; open when
    // shouting.
    float k = uSmile * 3.2;
    float w = 0.12 + 0.03 * max(uSmile, 0.0) - 0.04 * uAnger;
    vec2 m = p - vec2(0.0, -0.2);
    float line = fill(sdCurve(m, -k * w * w * 0.5, k, w, 0.018));
    float shoutMouth = fill(sdEllipse(m - vec2(0.0, -0.02), vec2(0.07 + 0.02 * uShout, 0.02 + 0.06 * uShout)));
    o = over(o, ink, line * (1.0 - uShout));
    o = over(o, ink, shoutMouth * uShout);
    float tongue = shoutMouth * fill(sdEllipse(m - vec2(0.0, -0.06 - 0.015 * uShout), vec2(0.04, 0.025 + 0.015 * uShout)));
    o = over(o, vec3(1.0, 0.45, 0.5), tongue * uShout);

    // Anger mark (the manga "popping vein"), pulsing, up by the right brow:
    // four short arcs, one per corner, each bulging toward the middle.
    vec2 v = p - vec2(0.56, 0.37);
    float pulse = 0.75 + 0.08 * sin(uTime * 10.0); // smaller and calmer than a full rage
    v /= pulse;
    float mark = 1e3;
    for (int i = 0; i < 4; i++) {
      float a = 0.785 + float(i) * 1.5708;
      vec2 d = vec2(cos(a), sin(a));
      vec2 q = v - d * 0.075;
      float ring = abs(length(q) - 0.05) - 0.011;
      // Keep the inner quarter of each ring, facing the centre.
      float facing = dot(normalize(q + 1e-5), -d);
      mark = min(mark, max(ring, (0.72 - facing) * 0.08));
    }
    o = over(o, vec3(1.0, 0.3, 0.36), fill(mark) * smoothstep(0.5, 0.9, uAnger) * 0.8);

    gl_FragColor = vec4(o.rgb, o.a * uOpacity);
  }
`;

export function createFace() {
  const uniforms = {
    uAnger: { value: 0 },
    uBlink: { value: 0 },
    uSquint: { value: 0 },
    uLook: { value: new THREE.Vector2() },
    uSmile: { value: 0.8 },
    uShout: { value: 0 },
    uWide: { value: 0 },
    uOpacity: { value: 0 },
    uTime: { value: 0 },
    uInk: { value: new THREE.Color("#2a1d5e") },
    uBlush: { value: new THREE.Color("#ff8fb3") },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  // 1.24 x 0.77 plane: the aspect the shader's y scale expects (0.62).
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 1.24 * 0.62), material);
  mesh.renderOrder = 3; // over the cloud, under the UFOs
  mesh.frustumCulled = false;

  function setTheme(light: boolean) {
    uniforms.uInk.value.set(light ? "#4a2316" : "#2a1d5e");
    uniforms.uBlush.value.set(light ? "#ff7a6b" : "#ff8fb3");
  }

  function update(e: Expression) {
    uniforms.uAnger.value = e.anger;
    uniforms.uBlink.value = e.blink;
    uniforms.uSquint.value = e.squint;
    uniforms.uLook.value.copy(e.look);
    uniforms.uSmile.value = e.smile;
    uniforms.uShout.value = e.shout;
    uniforms.uWide.value = e.wide;
    uniforms.uOpacity.value = e.opacity;
    uniforms.uTime.value = e.time;
  }

  return { object: mesh, update, setTheme };
}
