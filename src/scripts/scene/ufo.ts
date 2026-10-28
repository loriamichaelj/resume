import * as THREE from "three";

// A little flying saucer for each cloud provider, drawn cartoon-style and kept
// plain: a chunky lavender hull with banded (toon) shading, a thick dark outline
// and a hard highlight; a flat glowing equator band; a glass dome; a tractor
// emitter underneath; and a puffy flame trail along the orbit. No windows,
// lights or ornaments. Sizes are in the cloud's local units (the cloud is ~2 wide).
//
// Each saucer has health. Lightning hits (see cloud.ts) flash and jolt it,
// and damage shows in how it flies (listing and limping), its lights shorting
// out and its trail turning to fire; the hull itself stays clean. At zero it explodes, spirals down
// and disappears, then warps back in a little later.

const HULL_R = 0.15;
export const MAX_HEALTH = 3;
const RESPAWN_AFTER = 12; // seconds a destroyed saucer stays gone
const DEBRIS = 28;
const TRAIL_POINTS = 72;

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

// Cartoon hull: three flat light bands, a lavender top over a darker belly and a
// hard white highlight. Nothing is drawn on it, damaged or not.
const hullFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uTime;
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
    float band = step(0.4, diff) * 0.5 + step(0.7, diff) * 0.5;
    float top = step(0.0, vLocal.y);
    vec3 lo = mix(vec3(0.3, 0.32, 0.52), vec3(0.62, 0.66, 0.9), top);
    vec3 hi = mix(vec3(0.52, 0.56, 0.78), vec3(0.95, 0.96, 1.0), top);
    vec3 col = mix(lo, hi, band);
    col = mix(col, uAccent, 0.1);

    // A hard white sticker highlight.
    float spec = step(0.55, pow(max(dot(reflect(-L, n), v), 0.0), 12.0));
    col = mix(col, vec3(1.0), spec * 0.75 * top);
    col = mix(col, vec3(1.0, 0.97, 0.92), uHit * 0.85);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

// Unlit flat parts (equator band, emitter ring).
const glowFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vec3 col = mix(uAccent * 1.15, vec3(1.0), 0.2) * uPulse;
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
    vec3 L = normalize(vec3(0.4, 0.9, 0.5));
    float diff = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(vec3(0.3, 0.32, 0.5), uTint, step(0.5, diff));
    gl_FragColor = vec4(col, uOpacity);
  }
`;

// Outline: the hull's back faces pushed outwards along the normal, in flat ink.
const outlineVertex = /* glsl */ `
  uniform float uWidth;
  void main() {
    vec3 p = position + normalize(normal) * uWidth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const outlineFragment = /* glsl */ `
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(0.06, 0.07, 0.17, uOpacity);
  }
`;

// Glass: a pale tint, an ink edge and two hard highlights.
const domeFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float f = 1.0 - abs(dot(n, v));
    float edge = smoothstep(0.74, 0.8, f);
    float h = step(0.93, dot(n, normalize(vec3(-0.35, 0.6, 0.7))));
    float h2 = step(0.985, dot(n, normalize(vec3(0.5, 0.35, 0.8))));
    vec3 glass = mix(vec3(0.82, 0.94, 1.0), uAccent, 0.15);
    vec3 col = mix(glass, vec3(0.06, 0.07, 0.17), edge);
    col = mix(col, vec3(1.0), max(h, h2));
    float alpha = mix(0.3, 0.95, max(edge, max(h, h2)));
    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;

// Point sprites: trail particles are laid out along the orbit behind the ship, hot at the ship,
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
      float j = aK * aK * 0.03;
      p += vec3(
        sin(uTime * 13.0 + aSeed * 40.0),
        cos(uTime * 11.0 + aSeed * 23.0),
        sin(uTime * 9.0 + aSeed * 31.0)
      ) * j;
      float flicker = 0.7 + 0.3 * sin(uTime * 31.0 + aSeed * 57.0);
      size = (0.07 * (1.0 - aK) + 0.02) * flicker;
      vBright = flicker;
    } else {
      float chase = fract(uTime * 0.9 - aK);
      vBright = 0.35 + 0.65 * smoothstep(0.7, 1.0, chase);
      size = 0.058 * (0.7 + 0.4 * vBright);
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
    float a = smoothstep(0.5, 0.36, d);
    vec3 col;
    float alpha;
    if (uTrail > 0.5) {
      col = mix(vec3(1.0, 0.96, 0.86), uColor, smoothstep(0.0, 0.4, vK));
      alpha = a * pow(1.0 - vK, 1.6) * vBright * 0.45;
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
  const spinner = new THREE.Group(); // the hull spins; the dome doesn't
  ship.add(craft);
  craft.add(spinner);

  const hullMat = lit(hullFragment, { uTime: { value: 0 }, uHit: { value: 0 } });
  const profile = [
    [0.0, -0.05],
    [0.05, -0.054],
    [0.1, -0.044],
    [0.14, -0.02],
    [HULL_R, 0.004],
    [0.14, 0.02],
    [0.105, 0.034],
    [0.06, 0.044],
    [0.0, 0.047],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const hull = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), hullMat);
  spinner.add(hull);
  const outlineMat = new THREE.ShaderMaterial({
    uniforms: { uWidth: { value: 0.006 }, uOpacity: { value: 1 } },
    vertexShader: outlineVertex,
    fragmentShader: outlineFragment,
    side: THREE.BackSide,
    transparent: true,
  });
  const outline = new THREE.Mesh(hull.geometry, outlineMat);
  spinner.add(outline);

  // Glowing equator band and the chasing lights on it.
  const bandMat = lit(glowFragment, { uPulse: { value: 1 } });
  const band = new THREE.Mesh(new THREE.TorusGeometry(HULL_R - 0.002, 0.013, 10, 64).rotateX(Math.PI / 2), bandMat);
  spinner.add(band);

  const sparkUniforms = () => ({
    uTime: { value: 0 },
    uScale: { value: 1 },
    uWorld: { value: 1 },
    uAngle: { value: 0 },
    uRadius: { value: 1 },
    uZ: { value: 1 },
    uSpan: { value: 0.4 },
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
  // Tractor emitter ring underneath, pulsing.
  const emitterMat = lit(glowFragment, { uPulse: { value: 1 } });
  const emitter = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 10, 40).rotateX(Math.PI / 2), emitterMat);
  emitter.position.y = -0.054;
  craft.add(emitter);

  // Dome: a metal collar and the glass.
  const metalMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 1 }, uTint: { value: new THREE.Color("#dfe3f5") } },
    vertexShader: litVertex,
    fragmentShader: metalFragment,
    transparent: true,
  });
  const DOME_Y = 0.044;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.01, 10, 40).rotateX(Math.PI / 2), metalMat);
  collar.position.y = DOME_Y;
  craft.add(collar);

  const domeMat = lit(domeFragment);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.064, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.y = DOME_Y;
  craft.add(dome);

  // Soft light spilling from underneath, in the provider colour.
  const underMat = new THREE.SpriteMaterial({
    map: glow,
    color,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const under = new THREE.Sprite(underMat);
  under.position.y = -0.07;
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
  outline.renderOrder = 4;
  for (const o of [hull, band, collar, emitter]) o.renderOrder = 5;
  for (const o of [dome, under, trail]) o.renderOrder = 6;

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

  const shaders = [hullMat, outlineMat, bandMat, emitterMat, metalMat, domeMat];
  const sparks = [trailMat];
  const sprites = [underMat, boomMat, debrisMat];
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
    for (const m of sparks) {
      m.blending = blending;
      if (m.uniforms.uLight) m.uniforms.uLight.value = light ? 1 : 0;
      m.needsUpdate = true;
    }
    for (const m of sprites) m.blending = blending;
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
    // Face along the orbit's tangent, so the trail streams out behind (-x).
    const tx = -Math.sin(angle) * radius;
    const tz = Math.cos(angle) * radius * zScale;
    ship.rotation.y = Math.atan2(-tz, tx);
    craft.position.y = Math.sin(time * 2.6 + phase) * 0.012;
    craft.rotation.z = -0.12 + Math.sin(time * 1.9 + phase) * 0.05; // nose dipped into the turn
    craft.rotation.x = Math.sin(time * 1.4 + phase * 2) * 0.06;
    spinner.rotation.y = time * 1.6 + phase;

    hullMat.uniforms.uTime.value = time + phase;
    bandMat.uniforms.uPulse.value = 0.85 + 0.15 * Math.sin(time * 2.2 + phase);
    emitterMat.uniforms.uPulse.value = 0.6 + 0.4 * Math.sin(time * 4 + phase);

    // ---- Damage, hits, destruction and respawn ------------------------------
    const damage = 1 - Math.max(health, 0) / MAX_HEALTH;
    hitFlash = Math.max(0, hitFlash - dt * 6);
    jolt = Math.max(0, jolt - dt * 2.5);
    hullMat.uniforms.uHit.value = hitFlash;
    // Knocked about when struck; limping and listing as damage builds.
    craft.rotation.x += Math.sin(time * 26) * 0.35 * jolt + Math.sin(time * 7 + phase) * 0.08 * damage;
    craft.rotation.z -= 0.14 * damage;
    craft.position.y -= 0.025 * damage;
    // Lights short out.
    if (damage > 0 && Math.random() < damage * 0.22) {
      bandMat.uniforms.uPulse.value *= 0.15;
      emitterMat.uniforms.uPulse.value *= 0.1;
    }
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
    for (const m of shaders) m.uniforms.uOpacity.value = opacity;
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
