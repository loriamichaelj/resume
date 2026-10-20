import * as THREE from "three";

// A little flying saucer for each cloud provider. A spinning metal hull with
// panel seams, grooves and a ring of glowing portholes; a glowing equator band
// with chasing lights; a glass dome with an antenna; a tractor
// emitter underneath; and twin thrusters that leave a flickering flame trail
// along the orbit. Sizes are in the cloud's local units (the cloud is ~2 wide).
//
// Each saucer has health. Lightning hits (see cloud.ts) flash and jolt it,
// and damage builds up visibly: scorch marks, flickering lights, sputtering
// thrusters and a trail that turns to fire. At zero it explodes, spirals down
// and disappears, then warps back in a little later.

const HULL_R = 0.15;
export const MAX_HEALTH = 3;
const RESPAWN_AFTER = 12; // seconds a destroyed saucer stays gone
const DEBRIS = 28;
const TRAIL_POINTS = 72;
const RIM_LIGHTS = 12;

const litVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

// Polished upper hull, darker belly; radial seams, concentric grooves and a
// ring of portholes glowing in the provider colour.
const hullFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uDamage; // 0 healthy .. 1 nearly destroyed
  uniform float uHit; // white flash when struck
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  const float TAU = 6.2831853;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 L = normalize(vec3(0.4, 0.9, 0.5));
    float diff = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
    float top = step(0.0, vLocal.y);
    vec3 hi = mix(vec3(0.5, 0.52, 0.64), vec3(0.88, 0.9, 0.97), top);
    vec3 lo = mix(vec3(0.1, 0.1, 0.17), vec3(0.26, 0.27, 0.37), top);
    vec3 col = mix(lo, hi, diff);

    float ang = atan(vLocal.z, vLocal.x);
    float r = length(vLocal.xz);
    // Radial panel seams.
    float seam = smoothstep(0.455, 0.5, abs(fract(ang * 16.0 / TAU) - 0.5));
    col *= 1.0 - seam * 0.35;
    // Concentric grooves on top.
    float groove = smoothstep(0.004, 0.0, abs(r - 0.062)) + smoothstep(0.004, 0.0, abs(r - 0.098));
    col *= 1.0 - groove * 0.4 * top;
    // Portholes around the upper slope.
    float cell = fract(ang * 10.0 / TAU) - 0.5;
    float arc = cell * TAU * r / 10.0;
    float hole = smoothstep(0.012, 0.007, length(vec2(arc, r - 0.122))) * top;
    float blink = 0.75 + 0.25 * sin(uTime * 3.0 + floor(ang * 10.0 / TAU) * 1.7);
    // Damaged portholes short out at random.
    float fault = step(0.6, fract(sin(floor(uTime * 11.0) * 12.9 + floor(ang * 10.0 / TAU) * 78.2) * 43758.5));
    blink *= 1.0 - fault * uDamage;
    col = mix(col, uAccent * 1.5 + 0.25, hole * blink);

    col += pow(max(dot(reflect(-L, n), v), 0.0), 30.0) * 0.6 * (0.5 + 0.5 * top);
    col += pow(1.0 - abs(dot(n, v)), 2.5) * uAccent * 0.4;
    // Scorch marks spread as damage builds.
    float burn = smoothstep(0.2, 0.9, sin(vLocal.x * 41.0) * sin(vLocal.z * 37.0) * 0.5 + 0.5 + uDamage * 0.4);
    col *= 1.0 - burn * uDamage * 0.55;
    col = mix(col, vec3(1.0, 0.97, 0.92), uHit * 0.85);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

// Unlit glowing parts (equator band, emitter ring, antenna tip).
const glowFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.5);
    vec3 col = mix(uAccent * 1.3, vec3(1.0), 0.25 + f * 0.3) * uPulse;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const metalFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uTint;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 L = normalize(vec3(0.4, 0.9, 0.5));
    float diff = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(vec3(0.14, 0.15, 0.22), uTint, diff);
    col += pow(max(dot(reflect(-L, n), v), 0.0), 24.0) * 0.5;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const domeFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 L = normalize(vec3(0.4, 0.9, 0.5));
    float f = pow(1.0 - abs(dot(n, v)), 2.0);
    vec3 col = mix(uAccent * 0.3 + vec3(0.3, 0.38, 0.5), vec3(0.92, 0.98, 1.0), f);
    col += pow(max(dot(reflect(-L, n), v), 0.0), 50.0) * 1.2;
    gl_FragColor = vec4(col, (0.38 + 0.55 * f) * uOpacity);
  }
`;

// Exhaust plume: an open cone behind a nozzle, hot at the base and fading
// toward the tip. uv.y runs 0 (nozzle) .. 1 (tip) on ConeGeometry.
const plumeVertex = /* glsl */ `
  varying float vL;
  void main() {
    vL = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const plumeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFlicker;
  varying float vL;
  void main() {
    vec3 col = mix(vec3(1.0, 0.97, 0.9), uColor, smoothstep(0.0, 0.6, vL));
    float a = pow(1.0 - vL, 1.4) * (0.65 + 0.35 * uFlicker);
    gl_FragColor = vec4(col, a * uOpacity);
  }
`;

// Point sprites: rim lights (uTrail 0) chase around the band; trail particles
// (uTrail 1) are laid out along the orbit behind the ship, hot at the nozzle,
// cooling to the provider colour and breaking up toward the tail.
const sparkVertex = /* glsl */ `
  attribute float aK;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  uniform float uWorld;
  uniform float uAngle;
  uniform float uRadius;
  uniform float uZ;
  uniform float uSpan;
  uniform float uTrail;
  varying float vK;
  varying float vBright;
  void main() {
    vec3 p = position;
    float size;
    if (uTrail > 0.5) {
      float a = uAngle - (0.11 + aK * uSpan);
      p = vec3(cos(a) * uRadius, 0.0, sin(a) * uRadius * uZ);
      float j = aK * aK * 0.05;
      p += vec3(
        sin(uTime * 13.0 + aSeed * 40.0),
        cos(uTime * 11.0 + aSeed * 23.0),
        sin(uTime * 9.0 + aSeed * 31.0)
      ) * j;
      float flicker = 0.7 + 0.3 * sin(uTime * 31.0 + aSeed * 57.0);
      size = (0.11 * (1.0 - aK) + 0.024) * flicker;
      vBright = flicker;
    } else {
      float chase = fract(uTime * 0.9 - aK);
      vBright = 0.35 + 0.65 * smoothstep(0.7, 1.0, chase);
      size = 0.042 * (0.7 + 0.5 * vBright);
    }
    vK = aK;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uWorld * uScale / -mv.z;
  }
`;
const sparkFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTrail;
  uniform float uLight;
  varying float vK;
  varying float vBright;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.6);
    vec3 col;
    float alpha;
    if (uTrail > 0.5) {
      col = mix(vec3(1.0, 0.96, 0.86), uColor, smoothstep(0.0, 0.4, vK));
      alpha = a * pow(1.0 - vK, 1.3) * vBright * 0.9;
    } else {
      col = mix(uColor, vec3(1.0), vBright * 0.6);
      alpha = a * vBright;
    }
    if (alpha * uOpacity < 0.004) discard;
    gl_FragColor = vec4(col * mix(1.0, 0.85, uLight), alpha * uOpacity);
  }
`;

export type UfoFrame = {
  time: number;
  dt: number;
  angle: number; // position along the orbit (radians)
  radius: number;
  zScale: number; // orbit ellipse depth factor
  opacity: number;
  worldScale: number; // the cloud's scale, for point sprite sizes
};

export function createUfo(color: string, glow: THREE.Texture, phase: number) {
  const accent = new THREE.Color(color);
  const lit = (fragmentShader: string, extra: Record<string, THREE.IUniform> = {}) =>
    new THREE.ShaderMaterial({
      uniforms: { uAccent: { value: accent }, uOpacity: { value: 1 }, ...extra },
      vertexShader: litVertex,
      fragmentShader,
      transparent: true,
    });

  // ---- Ship ---------------------------------------------------------------
  const ship = new THREE.Group(); // positioned on the orbit, faces along it
  const craft = new THREE.Group(); // bob and wobble
  const spinner = new THREE.Group(); // the hull spins; dome and thrusters don't
  ship.add(craft);
  craft.add(spinner);

  const hullMat = lit(hullFragment, { uTime: { value: 0 }, uDamage: { value: 0 }, uHit: { value: 0 } });
  const profile = [
    [0.0, -0.036],
    [0.04, -0.04],
    [0.085, -0.033],
    [0.125, -0.016],
    [HULL_R, 0.0],
    [0.13, 0.012],
    [0.1, 0.022],
    [0.06, 0.03],
    [0.0, 0.032],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const hull = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), hullMat);
  spinner.add(hull);

  // Glowing equator band and the chasing lights on it.
  const bandMat = lit(glowFragment, { uPulse: { value: 1 } });
  const band = new THREE.Mesh(new THREE.TorusGeometry(HULL_R - 0.002, 0.009, 8, 64).rotateX(Math.PI / 2), bandMat);
  spinner.add(band);

  const rimPos = new Float32Array(RIM_LIGHTS * 3);
  const rimK = new Float32Array(RIM_LIGHTS);
  for (let i = 0; i < RIM_LIGHTS; i++) {
    const a = (i / RIM_LIGHTS) * Math.PI * 2;
    rimPos.set([Math.cos(a) * (HULL_R + 0.006), 0, Math.sin(a) * (HULL_R + 0.006)], i * 3);
    rimK[i] = i / RIM_LIGHTS;
  }
  const sparkUniforms = () => ({
    uTime: { value: 0 },
    uScale: { value: 1 },
    uWorld: { value: 1 },
    uAngle: { value: 0 },
    uRadius: { value: 1 },
    uZ: { value: 1 },
    uSpan: { value: 0.62 },
    uTrail: { value: 0 },
    uColor: { value: accent },
    uOpacity: { value: 1 },
    uLight: { value: 0 },
  });
  const sparkMaterial = (trail: boolean) =>
    new THREE.ShaderMaterial({
      uniforms: { ...sparkUniforms(), uTrail: { value: trail ? 1 : 0 } },
      vertexShader: sparkVertex,
      fragmentShader: sparkFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const rimMat = sparkMaterial(false);
  const rimGeo = new THREE.BufferGeometry();
  rimGeo.setAttribute("position", new THREE.BufferAttribute(rimPos, 3));
  rimGeo.setAttribute("aK", new THREE.BufferAttribute(rimK, 1));
  rimGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(RIM_LIGHTS), 1));
  const rim = new THREE.Points(rimGeo, rimMat);
  rim.frustumCulled = false;
  spinner.add(rim);

  // Tractor emitter ring underneath, pulsing.
  const emitterMat = lit(glowFragment, { uPulse: { value: 1 } });
  const emitter = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.007, 8, 40).rotateX(Math.PI / 2), emitterMat);
  emitter.position.y = -0.038;
  craft.add(emitter);

  // Dome: metal collar, the glass, and an antenna with a blinking tip.
  const metalMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 1 }, uTint: { value: new THREE.Color("#c9cde0") } },
    vertexShader: litVertex,
    fragmentShader: metalFragment,
    transparent: true,
  });
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.007, 8, 40).rotateX(Math.PI / 2), metalMat);
  collar.position.y = 0.03;
  craft.add(collar);

  const domeMat = lit(domeFragment);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.056, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.y = 0.03;
  craft.add(dome);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0035, 0.036, 6), metalMat);
  antenna.position.y = 0.1;
  craft.add(antenna);
  const tipMat = new THREE.SpriteMaterial({
    map: glow,
    color,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const tip = new THREE.Sprite(tipMat);
  tip.position.y = 0.12;
  craft.add(tip);

  // Twin thrusters at the back (-x): metal nozzles, exhaust plumes and a glow.
  const PLUME_LEN = 0.18;
  const plumeMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: accent }, uOpacity: { value: 1 }, uFlicker: { value: 1 } },
    vertexShader: plumeVertex,
    fragmentShader: plumeFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  // Cone along +y (tip up), turned so the tip points back along -x with its
  // base at the group origin.
  const plumeGeo = new THREE.ConeGeometry(0.017, PLUME_LEN, 16, 1, true)
    .rotateZ(Math.PI / 2)
    .translate(-PLUME_LEN / 2, 0, 0);
  const nozzleGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.034, 14).rotateZ(Math.PI / 2);
  const plumes: THREE.Group[] = [];
  const plumeMeshes: THREE.Mesh[] = [];
  const nozzles: THREE.Mesh[] = [];
  for (const z of [-0.028, 0.028]) {
    const nozzle = new THREE.Mesh(nozzleGeo, metalMat);
    nozzle.position.set(-HULL_R + 0.008, -0.004, z);
    craft.add(nozzle);
    nozzles.push(nozzle);
    const plume = new THREE.Group();
    plume.position.set(-HULL_R - 0.008, -0.004, z);
    const mesh = new THREE.Mesh(plumeGeo, plumeMat);
    plume.add(mesh);
    craft.add(plume);
    plumes.push(plume);
    plumeMeshes.push(mesh);
  }

  const flameMat = new THREE.SpriteMaterial({
    map: glow,
    color: "#fff2dc",
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const flame = new THREE.Sprite(flameMat);
  flame.position.set(-HULL_R - 0.02, -0.004, 0);
  craft.add(flame);

  // Soft light spilling from underneath, in the provider colour.
  const underMat = new THREE.SpriteMaterial({
    map: glow,
    color,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const under = new THREE.Sprite(underMat);
  under.position.y = -0.05;
  under.scale.setScalar(0.36);
  craft.add(under);

  // ---- Flame trail (lives in the orbit plane, not on the ship) -------------
  const trailK = new Float32Array(TRAIL_POINTS);
  const trailSeed = new Float32Array(TRAIL_POINTS);
  for (let i = 0; i < TRAIL_POINTS; i++) {
    trailK[i] = i / (TRAIL_POINTS - 1);
    trailSeed[i] = Math.random();
  }
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL_POINTS * 3), 3));
  trailGeo.setAttribute("aK", new THREE.BufferAttribute(trailK, 1));
  trailGeo.setAttribute("aSeed", new THREE.BufferAttribute(trailSeed, 1));
  const trailMat = sparkMaterial(true);
  // The trail has its own colour, so damage can turn it to fire.
  const trailColor = accent.clone();
  const FIRE = new THREE.Color("#ff4a1c");
  trailMat.uniforms.uColor = { value: trailColor };
  const trail = new THREE.Points(trailGeo, trailMat);
  trail.frustumCulled = false;

  // Everything draws after the cloud (which writes no depth) and fades via
  // opacity while behind it. Glass and glows last, so solid parts show through.
  for (const o of [hull, band, collar, antenna, emitter, ...nozzles]) o.renderOrder = 5;
  for (const o of [dome, rim, tip, flame, under, trail, ...plumeMeshes]) o.renderOrder = 6;

  // ---- Explosion: a flash and a spray of debris where the saucer died -------
  const boomMat = new THREE.SpriteMaterial({
    map: glow,
    color: "#ffd8a0",
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const boom = new THREE.Sprite(boomMat);
  boom.visible = false;
  boom.renderOrder = 7;
  ship.add(boom);
  const debrisGeo = new THREE.BufferGeometry();
  debrisGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(DEBRIS * 3), 3));
  const debrisMat = new THREE.PointsMaterial({
    map: glow,
    color: "#ffcf8a",
    size: 0.04,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const debris = new THREE.Points(debrisGeo, debrisMat);
  debris.visible = false;
  debris.frustumCulled = false;
  debris.renderOrder = 7;
  ship.add(debris);
  const debrisVel = Array.from({ length: DEBRIS }, () => new THREE.Vector3());

  const shaders = [hullMat, bandMat, emitterMat, metalMat, domeMat, plumeMat];
  const sparks = [rimMat, trailMat];
  const sprites = [tipMat, flameMat, underMat, boomMat, debrisMat];
  let scale = 1;

  // ---- Health ----------------------------------------------------------------
  let health = MAX_HEALTH;
  let hitFlash = 0; // white flash when struck
  let jolt = 0; // knock-back wobble when struck
  let dying = -1; // seconds since it was destroyed (-1 while alive)
  let deadFor = 0;
  let warp = 1; // 0..1 respawn warp-in
  let deathAngle = 0;
  let lastAngle = 0;
  let deathSpin = 0;
  let visibility = 1; // how much of the saucer is showing (for labels)

  // A lightning hit. Returns true if it destroyed the saucer.
  function hit() {
    if (health <= 0) return false;
    health -= 1;
    hitFlash = 1;
    jolt = 1;
    if (health > 0) return false;
    dying = 0;
    deathAngle = lastAngle;
    deathSpin = 0;
    const pos = debrisGeo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < DEBRIS; i++) {
      pos.setXYZ(i, 0, 0, 0);
      debrisVel[i]
        .set(Math.random() - 0.5, Math.random() * 0.8 - 0.2, Math.random() - 0.5)
        .normalize()
        .multiplyScalar(0.4 + Math.random() * 0.9);
    }
    pos.needsUpdate = true;
    debris.visible = boom.visible = true;
    return true;
  }

  function setTheme(light: boolean) {
    const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    for (const m of [...sparks, plumeMat]) {
      m.blending = blending;
      if (m.uniforms.uLight) m.uniforms.uLight.value = light ? 1 : 0;
      m.needsUpdate = true;
    }
    for (const m of sprites) m.blending = blending;
    flameMat.color.set(light ? color : "#fff2dc");
  }

  function resize(heightPx: number, fov: number) {
    scale = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
  }

  function update(f: UfoFrame) {
    const { time, radius, zScale, dt } = f;
    lastAngle = f.angle;
    // A destroyed saucer stops where it was hit.
    const angle = dying >= 0 ? deathAngle : f.angle;
    ship.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius * zScale);
    // Face along the orbit's tangent, so the thrusters (-x) point back.
    const tx = -Math.sin(angle) * radius;
    const tz = Math.cos(angle) * radius * zScale;
    ship.rotation.y = Math.atan2(-tz, tx);
    craft.position.y = Math.sin(time * 2.6 + phase) * 0.012;
    craft.rotation.z = -0.12 + Math.sin(time * 1.9 + phase) * 0.05; // nose dipped into the turn
    craft.rotation.x = Math.sin(time * 1.4 + phase * 2) * 0.06;
    spinner.rotation.y = time * 1.6 + phase;

    const flick = 0.8 + 0.2 * Math.sin(time * 37 + phase) * Math.sin(time * 23);
    flame.scale.setScalar(0.17 * flick);
    plumes.forEach((p, i) => {
      const fl = i === 0 ? flick : 0.8 + 0.2 * Math.sin(time * 41 + phase + 2) * Math.sin(time * 19);
      p.scale.set(0.8 + 0.4 * fl, 0.9 + 0.15 * fl, 0.9 + 0.15 * fl);
    });
    plumeMat.uniforms.uFlicker.value = flick;
    hullMat.uniforms.uTime.value = time + phase;
    bandMat.uniforms.uPulse.value = 0.85 + 0.15 * Math.sin(time * 2.2 + phase);
    emitterMat.uniforms.uPulse.value = 0.6 + 0.4 * Math.sin(time * 4 + phase);

    // ---- Damage, hits, destruction and respawn ------------------------------
    const damage = 1 - Math.max(health, 0) / MAX_HEALTH;
    hitFlash = Math.max(0, hitFlash - dt * 6);
    jolt = Math.max(0, jolt - dt * 2.5);
    hullMat.uniforms.uDamage.value = damage;
    hullMat.uniforms.uHit.value = hitFlash;
    // Knocked about when struck; limping and listing as damage builds.
    craft.rotation.x += Math.sin(time * 26) * 0.35 * jolt + Math.sin(time * 7 + phase) * 0.08 * damage;
    craft.rotation.z -= 0.14 * damage;
    craft.position.y -= 0.025 * damage;
    // Lights short out and thrusters sputter.
    if (damage > 0 && Math.random() < damage * 0.22) {
      bandMat.uniforms.uPulse.value *= 0.15;
      emitterMat.uniforms.uPulse.value *= 0.1;
    }
    if (damage > 0 && Math.random() < damage * 0.16) for (const p of plumes) p.scale.setScalar(0.15);
    trailColor.copy(accent).lerp(FIRE, Math.min(1, damage * 1.3));

    let trailFade = 1;
    if (dying >= 0) {
      dying += dt;
      const k = Math.min(1, dying / 1.1);
      // Spiral down and fade out.
      deathSpin += dt * (6 + k * 18);
      craft.rotation.y = deathSpin;
      craft.rotation.z -= k * 1.2;
      craft.position.y -= k * k * 0.7;
      visibility = 1 - THREE.MathUtils.smoothstep(k, 0.45, 1);
      trailFade = 1 - k;
      // The blast: a quick flash, then debris arcing outward and falling.
      const b = Math.min(1, dying / 0.45);
      boom.scale.setScalar(0.15 + b * 1.1);
      boomMat.opacity = (1 - b) * f.opacity;
      const pos = debrisGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < DEBRIS; i++) {
        debrisVel[i].y -= 1.4 * dt;
        pos.setXYZ(i, pos.getX(i) + debrisVel[i].x * dt, pos.getY(i) + debrisVel[i].y * dt, pos.getZ(i) + debrisVel[i].z * dt);
      }
      pos.needsUpdate = true;
      debrisMat.opacity = Math.max(0, 1 - dying / 1.3) * f.opacity;
      debrisMat.size = 0.04 * f.worldScale;
      if (dying > 1.4) {
        dying = -2; // gone; waiting to respawn
        deadFor = 0;
        boom.visible = debris.visible = false;
      }
    } else if (dying === -2) {
      deadFor += dt;
      visibility = 0;
      trailFade = 0;
      if (deadFor > RESPAWN_AFTER) {
        // Warp back in, good as new.
        dying = -1;
        health = MAX_HEALTH;
        warp = 0;
        hitFlash = 1;
      }
    } else {
      warp = Math.min(1, warp + dt * 1.6);
      visibility = THREE.MathUtils.smoothstep(warp, 0, 1);
      trailFade = visibility;
    }
    ship.visible = visibility > 0.01 || boom.visible;
    craft.scale.setScalar(dying === -1 ? 0.2 + 0.8 * visibility : 1);
    trail.visible = trailFade > 0.01;
    const opacity = f.opacity * visibility;
    // Antenna tip: a quick double blink each second or so.
    const beat = (time * 0.9 + phase) % 1;
    const blink = beat < 0.08 || (beat > 0.16 && beat < 0.24) ? 1 : 0.15;
    tip.scale.setScalar(0.07 + 0.05 * blink);

    for (const m of shaders) m.uniforms.uOpacity.value = opacity;
    tipMat.opacity = opacity * blink;
    flameMat.opacity = opacity;
    underMat.opacity = opacity * (0.5 + 0.2 * Math.sin(time * 4 + phase));

    for (const m of sparks) {
      const u = m.uniforms;
      u.uTime.value = time + phase;
      u.uScale.value = scale;
      u.uWorld.value = f.worldScale;
      u.uAngle.value = angle;
      u.uRadius.value = radius;
      u.uZ.value = zScale;
      u.uOpacity.value = opacity;
    }
    trailMat.uniforms.uOpacity.value = f.opacity * trailFade;
  }

  return {
    ship,
    trail,
    update,
    setTheme,
    resize,
    hit,
    alive: () => health > 0,
    health: () => Math.max(health, 0),
    visibility: () => visibility,
  };
}
