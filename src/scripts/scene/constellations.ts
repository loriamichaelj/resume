import * as THREE from "three";

// Real constellations for the night sky, scattered down the scrolling column:
// stars sized by brightness and twinkling, joined by faint lines that a slow
// shimmer runs along. Shapes are simplified star charts (x right, y up).

type Star = [number, number, number]; // x, y, brightness 0..1
type Figure = { stars: Star[]; lines: [number, number][] };

const FIGURES: Record<string, Figure> = {
  orion: {
    stars: [
      [-0.45, 0.62, 1], // Betelgeuse
      [0.32, 0.55, 0.8], // Bellatrix
      [-0.12, 0.0, 0.7], // Alnitak
      [0.0, 0.04, 0.75], // Alnilam
      [0.12, 0.08, 0.65], // Mintaka
      [-0.35, -0.6, 0.65], // Saiph
      [0.42, -0.55, 1], // Rigel
      [-0.05, 0.86, 0.45], // Meissa
    ],
    lines: [[0, 7], [7, 1], [0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  bigDipper: {
    stars: [
      [0.55, 0.25, 0.85], // Dubhe
      [0.5, -0.05, 0.75], // Merak
      [0.15, -0.12, 0.6], // Phecda
      [0.1, 0.12, 0.5], // Megrez
      [-0.2, 0.15, 0.8], // Alioth
      [-0.48, 0.2, 0.75], // Mizar
      [-0.78, 0.04, 0.75], // Alkaid
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  cassiopeia: {
    stars: [
      [-0.62, 0.12, 0.7],
      [-0.3, -0.16, 0.8],
      [0.0, 0.05, 0.75],
      [0.3, -0.2, 0.7],
      [0.62, 0.14, 0.6],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  cygnus: {
    stars: [
      [0.0, 0.62, 1], // Deneb
      [0.0, 0.1, 0.7], // Sadr
      [0.02, -0.62, 0.65], // Albireo
      [-0.46, 0.04, 0.65], // Gienah
      [0.42, 0.24, 0.55], // Delta Cygni
    ],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]],
  },
  lyra: {
    stars: [
      [0.0, 0.45, 1], // Vega
      [-0.12, 0.12, 0.45],
      [0.12, 0.1, 0.45],
      [-0.06, -0.3, 0.55],
      [0.18, -0.32, 0.55],
    ],
    lines: [[0, 1], [0, 2], [1, 2], [2, 4], [4, 3], [3, 1]],
  },
  scorpius: {
    stars: [
      [-0.6, 0.55, 0.6],
      [-0.46, 0.38, 0.55],
      [-0.3, 0.2, 1], // Antares
      [-0.16, 0.0, 0.55],
      [-0.06, -0.26, 0.55],
      [0.1, -0.46, 0.6],
      [0.34, -0.52, 0.6],
      [0.54, -0.4, 0.7],
      [0.6, -0.2, 0.75], // Shaula
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
  },
};

// Hue (0..1) -> a fully saturated rainbow colour.
const hueGlsl = /* glsl */ `
  vec3 rainbow(float h) {
    return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  }
`;

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aHue;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  varying float vTwinkle;
  varying float vSeed;
  varying float vHue;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vTwinkle = 0.7 + 0.3 * sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 40.0);
    vSeed = aSeed;
    vHue = aHue;
    gl_PointSize = aSize * uScale / -mv.z;
  }
`;
const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  varying float vSeed;
  varying float vHue;
  ${hueGlsl}
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    // Bright core, soft glow and a faint four-point glint.
    float core = exp(-d * d * 180.0);
    float glow = exp(-d * d * 22.0) * 0.45;
    float glint = (exp(-abs(c.x) * 60.0) + exp(-abs(c.y) * 60.0)) * exp(-d * 6.0) * 0.25;
    float a = (core + glow + glint) * vTwinkle * uOpacity;
    if (a < 0.004) discard;
    vec3 col = mix(vec3(1.0), rainbow(vHue), 0.7 + 0.2 * vSeed);
    gl_FragColor = vec4(col, a);
  }
`;
const lineVertex = /* glsl */ `
  attribute float aT;
  attribute float aHue;
  varying float vT;
  varying float vHue;
  void main() {
    vT = aT;
    vHue = aHue;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying float vT;
  varying float vHue;
  ${hueGlsl}
  void main() {
    float shimmer = 0.6 + 0.4 * sin(vT * 6.2831 - uTime * 1.2);
    gl_FragColor = vec4(rainbow(vHue), 0.3 * shimmer * uOpacity);
  }
`;

export function createConstellations(opts: { span: number }) {
  const group = new THREE.Group();
  const names = Object.keys(FIGURES);
  const starMats: THREE.ShaderMaterial[] = [];
  const lineMats: THREE.ShaderMaterial[] = [];
  const figures: { obj: THREE.Group; side: number; depth: number; frac: number; size: number }[] = [];

  names.forEach((name, i) => {
    const fig = FIGURES[name];
    const obj = new THREE.Group();

    const pos = new Float32Array(fig.stars.length * 3);
    const size = new Float32Array(fig.stars.length);
    const seed = new Float32Array(fig.stars.length);
    // Each star takes the next hue round the wheel; each figure starts at its own.
    const hue = new Float32Array(fig.stars.length);
    const hueOf = (k: number) => (k / fig.stars.length + i * 0.17) % 1;
    fig.stars.forEach(([x, y, b], k) => {
      hue[k] = hueOf(k);
      pos.set([x, y, 0], k * 3);
      size[k] = 0.1 + b * 0.16;
      seed[k] = (k * 0.37 + i * 0.13) % 1;
    });
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    sGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    sGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    sGeo.setAttribute("aHue", new THREE.BufferAttribute(hue, 1));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uOpacity: { value: 1 } },
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    starMats.push(starMat);
    const points = new THREE.Points(sGeo, starMat);
    points.frustumCulled = false;

    const lPos = new Float32Array(fig.lines.length * 6);
    const lT = new Float32Array(fig.lines.length * 2);
    const lHue = new Float32Array(fig.lines.length * 2); // each end takes its star's hue
    fig.lines.forEach(([a, b], k) => {
      lPos.set([fig.stars[a][0], fig.stars[a][1], 0, fig.stars[b][0], fig.stars[b][1], 0], k * 6);
      lT[k * 2] = k / fig.lines.length;
      lT[k * 2 + 1] = (k + 1) / fig.lines.length;
      lHue[k * 2] = hueOf(a);
      lHue[k * 2 + 1] = hueOf(b);
    });
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    lGeo.setAttribute("aT", new THREE.BufferAttribute(lT, 1));
    lGeo.setAttribute("aHue", new THREE.BufferAttribute(lHue, 1));
    const lineMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 } },
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    lineMats.push(lineMat);
    obj.add(new THREE.LineSegments(lGeo, lineMat), points);
    obj.rotation.z = ((i * 37) % 60) / 100 - 0.3;
    group.add(obj);
    figures.push({ obj, side: i % 2 === 0 ? -1 : 1, depth: -11 - (i % 3) * 1.5, frac: (i + 0.6) / names.length, size: 2.4 + (i % 3) * 0.5 });
  });

  // Spread down the column, alternating sides, out in the margins.
  const mats = [...starMats, ...lineMats];

  function layout(camera: THREE.PerspectiveCamera) {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const narrow = camera.aspect < 0.9;
    for (const f of figures) {
      const halfW = tanHalf * (camera.position.z - f.depth) * camera.aspect;
      f.obj.position.set(f.side * halfW * (narrow ? 0.6 : 0.8), 2 - f.frac * (opts.span + 4), f.depth);
      f.obj.scale.setScalar(f.size * (narrow ? 0.6 : 1));
    }
  }

  function resize(heightPx: number, fov: number) {
    const scale = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
    for (const m of starMats) m.uniforms.uScale.value = scale;
  }

  function update(time: number, opacity: number) {
    group.visible = opacity > 0.01;
    for (const m of mats) {
      m.uniforms.uTime.value = time;
      m.uniforms.uOpacity.value = opacity;
    }
  }

  return { object: group, layout, resize, update };
}
