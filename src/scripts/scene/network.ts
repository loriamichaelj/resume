import * as THREE from "three";
import { mulberry32, PALETTE } from "./util";

// A 3D service graph: glowing nodes joined to their nearest neighbours, with
// packets of light travelling along every edge.

const lineVertex = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  varying float vT;
  varying float vSeed;
  void main() {
    vT = aT;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uA;
  uniform vec3 uB;
  varying float vT;
  varying float vSeed;
  void main() {
    float head = fract(uTime * (0.18 + vSeed * 0.16) + vSeed);
    float pulse = exp(-pow((vT - head) * 9.0, 2.0));
    vec3 col = mix(uA, uB, vT) + pulse * 0.6;
    gl_FragColor = vec4(col, (0.13 + pulse * 0.85) * uOpacity);
  }
`;

const pointVertex = /* glsl */ `
  attribute vec3 aEnd;
  attribute float aSeed;
  attribute float aSize;
  attribute float aMove;
  uniform float uTime;
  uniform float uScale;
  varying float vSeed;
  void main() {
    // aMove = 1: a packet riding its edge in step with the line pulse.
    float head = fract(uTime * (0.18 + aSeed * 0.16) + aSeed);
    vec3 p = mix(position, mix(position, aEnd, head), aMove);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float beat = 0.8 + 0.2 * sin(uTime * 2.0 + aSeed * 30.0);
    gl_PointSize = aSize * beat * uScale / -mv.z;
    vSeed = aSeed;
  }
`;
const pointFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uA;
  uniform vec3 uB;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.8) * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(mix(uA, uB, vSeed) + 0.25, a);
  }
`;

export function createNetwork(opts: {
  nodes: number;
  seed: number;
  radius: [number, number, number];
  colors: [string, string];
  light: boolean;
}) {
  const rand = mulberry32(opts.seed);
  const [rx, ry, rz] = opts.radius;

  const nodes: THREE.Vector3[] = [];
  while (nodes.length < opts.nodes) {
    const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    if (v.lengthSq() > 1) continue;
    nodes.push(v.set(v.x * rx, v.y * ry, v.z * rz));
  }

  // Connect each node to its two nearest neighbours.
  const edges = new Set<string>();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: a.distanceToSquared(b) }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  const edgeList = [...edges].map((e) => e.split("-").map(Number) as [number, number]);

  // Lines.
  const linePos = new Float32Array(edgeList.length * 6);
  const lineT = new Float32Array(edgeList.length * 2);
  const lineSeed = new Float32Array(edgeList.length * 2);
  edgeList.forEach(([a, b], k) => {
    nodes[a].toArray(linePos, k * 6);
    nodes[b].toArray(linePos, k * 6 + 3);
    lineT[k * 2] = 0;
    lineT[k * 2 + 1] = 1;
    lineSeed[k * 2] = lineSeed[k * 2 + 1] = rand();
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute("aT", new THREE.BufferAttribute(lineT, 1));
  lineGeo.setAttribute("aSeed", new THREE.BufferAttribute(lineSeed, 1));

  const shared = {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uScale: { value: 1 },
    uA: { value: new THREE.Color(opts.colors[0]) },
    uB: { value: new THREE.Color(opts.colors[1]) },
  };
  const lineMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);

  // Nodes (static) + packets (one per edge, moving).
  const count = nodes.length + edgeList.length;
  const pPos = new Float32Array(count * 3);
  const pEnd = new Float32Array(count * 3);
  const pSeed = new Float32Array(count);
  const pSize = new Float32Array(count);
  const pMove = new Float32Array(count);
  nodes.forEach((n, i) => {
    n.toArray(pPos, i * 3);
    n.toArray(pEnd, i * 3);
    pSeed[i] = rand();
    pSize[i] = 0.16 + rand() * 0.14;
    pMove[i] = 0;
  });
  edgeList.forEach(([a, b], k) => {
    const i = nodes.length + k;
    nodes[a].toArray(pPos, i * 3);
    nodes[b].toArray(pEnd, i * 3);
    pSeed[i] = lineSeed[k * 2];
    pSize[i] = 0.12;
    pMove[i] = 1;
  });
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("aEnd", new THREE.BufferAttribute(pEnd, 3));
  pGeo.setAttribute("aSeed", new THREE.BufferAttribute(pSeed, 1));
  pGeo.setAttribute("aSize", new THREE.BufferAttribute(pSize, 1));
  pGeo.setAttribute("aMove", new THREE.BufferAttribute(pMove, 1));
  const pointMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pGeo, pointMat);
  points.frustumCulled = false;

  const group = new THREE.Group();
  group.add(lines, points);

  function setTheme(light: boolean) {
    for (const m of [lineMat, pointMat]) {
      m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      m.needsUpdate = true;
    }
    base = light ? 0.75 : 1;
    shared.uA.value.set(light ? "#ea580c" : opts.colors[0]);
    shared.uB.value.set(light ? "#c2410c" : opts.colors[1]);
  }
  let base = 1;
  setTheme(opts.light);

  function resize(heightPx: number, fov: number) {
    shared.uScale.value = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
  }

  // `fade` 0..1 lets the scene fade the graph out (it's a night-sky element).
  function update(time: number, fade = 1) {
    group.visible = fade > 0.01;
    shared.uOpacity.value = base * fade;
    shared.uTime.value = time;
    group.rotation.y = time * 0.05;
    group.rotation.x = Math.sin(time * 0.1) * 0.15;
  }

  return { object: group, update, setTheme, resize };
}

export const NETWORK_COLORS = {
  coolWarm: [PALETTE.aqua, PALETTE.rose] as [string, string],
  warmCool: [PALETTE.peach, PALETTE.violet] as [string, string],
};
