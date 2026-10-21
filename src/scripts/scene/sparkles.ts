import * as THREE from "three";

// A pool of twinkling four-pointed sparkles (the anime's "kira"), for the
// rainbow (rainbow.ts). Each one pops in,
// twinkles, drifts on its own velocity with a little drag and a slow fall,
// and shrinks away. Positions are in the space of whatever the pool is added
// to; sizes are in that space's units too, given its world scale.

export const hsv = /* glsl */ `
  vec3 hsv(float h, float s, float v) {
    vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return v * mix(vec3(1.0), k, s);
  }
`;

const sparkVertex = /* glsl */ `
  attribute float aAge; // 0..1 over its life, < 0 when unused
  attribute float aSeed;
  attribute float aSize;
  attribute float aHue;
  uniform float uScale;
  uniform float uWorldScale;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vHue;
  varying float vTilt;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float alive = step(0.0, aAge);
    // Pops in, twinkles, shrinks away.
    float pop = smoothstep(0.0, 0.12, aAge) * (1.0 - smoothstep(0.5, 1.0, aAge));
    float twinkle = 0.7 + 0.3 * sin(aAge * 28.0 + aSeed * 40.0);
    gl_PointSize = aSize * uScale * uWorldScale * pop * twinkle * alive / -mv.z;
    vAlpha = alive * uOpacity;
    vHue = aHue;
    vTilt = (aSeed - 0.5) * 0.5;
  }
`;

// A four-pointed sparkle (an astroid, like the anime's "kira"), with a white
// core and a faint coloured halo.
const sparkFragment = /* glsl */ `
  varying float vAlpha;
  varying float vHue;
  varying float vTilt;
  ${hsv}
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float c = cos(vTilt), s = sin(vTilt);
    p = mat2(c, -s, s, c) * p;
    vec2 q = abs(p) * 2.0;
    float star = smoothstep(1.0, 0.75, sqrt(q.x) + sqrt(q.y));
    float core = exp(-dot(p, p) * 90.0);
    float halo = exp(-length(p) * 9.0) * 0.35;
    float a = clamp(star + halo, 0.0, 1.0) * vAlpha;
    if (a < 0.003) discard;
    vec3 col = mix(hsv(vHue, 0.7, 0.98), vec3(1.0), core);
    gl_FragColor = vec4(col * a, a);
  }
`;

export function createSparkles(count: number) {
  const pos = new Float32Array(count * 3);
  const age = new Float32Array(count).fill(-1);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const hue = new Float32Array(count);
  const life = new Float32Array(count);
  const vel = Array.from({ length: count }, () => new THREE.Vector3());
  const geo = new THREE.BufferGeometry();
  const dynamic = (array: Float32Array, n: number) =>
    new THREE.BufferAttribute(array, n).setUsage(THREE.DynamicDrawUsage);
  const attrs = {
    position: dynamic(pos, 3),
    aAge: dynamic(age, 1),
    aSeed: dynamic(seed, 1),
    aSize: dynamic(size, 1),
    aHue: dynamic(hue, 1),
  };
  for (const [name, attr] of Object.entries(attrs)) geo.setAttribute(name, attr);
  let spawned = false; // new sparkles this frame: re-upload their seed/size/hue
  const uniforms = {
    uScale: { value: 1 },
    uWorldScale: { value: 1 },
    uOpacity: { value: 1 },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: sparkVertex,
      fragmentShader: sparkFragment,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  points.frustumCulled = false;
  points.visible = false;
  let next = 0;

  function spawn(at: THREE.Vector3, v: THREE.Vector3, s: number, h: number, l: number) {
    const i = next;
    next = (next + 1) % count;
    at.toArray(pos, i * 3);
    vel[i].copy(v);
    age[i] = 0;
    life[i] = l;
    size[i] = s;
    hue[i] = h;
    seed[i] = Math.random();
    spawned = true;
  }

  // `fall` is the downward pull (units/s^2).
  function update(dt: number, worldScale: number, opacity: number, fall = 0.12) {
    uniforms.uOpacity.value = opacity;
    uniforms.uWorldScale.value = worldScale;
    let any = false;
    for (let i = 0; i < count; i++) {
      if (age[i] < 0) continue;
      age[i] += dt / life[i];
      if (age[i] >= 1) {
        age[i] = -1;
        continue;
      }
      any = true;
      const v = vel[i];
      v.multiplyScalar(Math.exp(-1.5 * dt)); // air drag
      v.y -= fall * dt;
      pos[i * 3] += v.x * dt;
      pos[i * 3 + 1] += v.y * dt;
      pos[i * 3 + 2] += v.z * dt;
    }
    points.visible = any && opacity > 0.01;
    if (any) attrs.position.needsUpdate = attrs.aAge.needsUpdate = true;
    if (spawned) {
      attrs.aSeed.needsUpdate = attrs.aSize.needsUpdate = attrs.aHue.needsUpdate = true;
      spawned = false;
    }
  }

  // Point sprite sizes depend on the canvas height (in device pixels).
  function resize(heightPx: number, fov: number) {
    uniforms.uScale.value = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
  }

  return { object: points, spawn, update, resize, active: () => points.visible };
}
