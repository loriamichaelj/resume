import * as THREE from "three";
import { mulberry32 } from "./random";

// Small fair-weather clouds for the daytime sky, drifting slowly across the
// scrolling column at a few depths. Each is a sprite painted once onto a
// canvas: a flat-based heap of soft puffs, sunlit from the upper right with a
// warm shadow underneath.

function paintCloud(seed: number) {
  const rand = mulberry32(seed);
  const w = 320;
  const h = 180;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const base = h * 0.7;
  const puffs: [number, number, number][] = [];
  const count = 7 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = w * (0.18 + t * 0.64) + (rand() - 0.5) * 16;
    // Taller in the middle, flat along the base.
    const r = h * (0.16 + 0.2 * Math.sin(t * Math.PI) + rand() * 0.06);
    puffs.push([x, base - r * (0.45 + rand() * 0.3), r]);
  }
  // Body: soft white puffs, each lit from the upper right.
  for (const [x, y, r] of puffs) {
    const grad = g.createRadialGradient(x + r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.6, "rgba(255,250,244,0.95)");
    grad.addColorStop(1, "rgba(255,244,232,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  // Warm shadow across the underside, only where the cloud already is.
  g.globalCompositeOperation = "source-atop";
  const shade = g.createLinearGradient(0, base - h * 0.35, 0, base + h * 0.05);
  shade.addColorStop(0, "rgba(255,190,150,0)");
  shade.addColorStop(1, "rgba(240,160,120,0.55)");
  g.fillStyle = shade;
  g.fillRect(0, 0, w, h);
  // Soft-clip the flat base.
  g.globalCompositeOperation = "destination-out";
  const cut = g.createLinearGradient(0, base - 6, 0, base + 14);
  cut.addColorStop(0, "rgba(0,0,0,0)");
  cut.addColorStop(1, "rgba(0,0,0,1)");
  g.fillStyle = cut;
  g.fillRect(0, base - 6, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  // Upload the canvas premultiplied, as it is stored. Un-premultiplying
  // blows the gradient dithering in the near-transparent edges (iOS Safari)
  // up into bright blue and green specks.
  tex.premultiplyAlpha = true;
  return { tex, aspect: w / h };
}

export function createSkyClouds(opts: { count: number; span: number }) {
  const rand = mulberry32(77);
  const group = new THREE.Group();
  const kinds = [paintCloud(3), paintCloud(9), paintCloud(21), paintCloud(40)];
  const clouds = Array.from({ length: opts.count }, (_, i) => {
    const kind = kinds[i % kinds.length];
    // Premultiplied "over"; update() scales the colour by the opacity too.
    const mat = new THREE.SpriteMaterial({
      map: kind.tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.renderOrder = -40;
    const size = 1.6 + rand() * 2.2;
    sprite.scale.set(size * kind.aspect, size, 1);
    group.add(sprite);
    return {
      sprite,
      mat,
      depth: -6 - rand() * 12,
      u: rand(), // horizontal position, 0..1 across the view (wraps)
      // Starting below the sun's height, so none sits over it on load.
      y: 2.2 - (i / opts.count) * (opts.span + 4) - rand() * 2.5,
      speed: 0.006 + rand() * 0.01,
      bob: rand() * Math.PI * 2,
      alpha: 0.55 + rand() * 0.4,
    };
  });
  let halfW = (z: number) => z;

  function layout(camera: THREE.PerspectiveCamera) {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    halfW = (z: number) => tanHalf * (camera.position.z - z) * camera.aspect;
  }

  function update(time: number, dt: number, opacity: number) {
    group.visible = opacity > 0.01;
    if (!group.visible) return;
    for (const c of clouds) {
      c.u = (c.u + c.speed * dt) % 1;
      // Wider than the view, so clouds drift fully off before wrapping.
      const hw = halfW(c.depth) * 1.35;
      c.sprite.position.set(-hw + c.u * hw * 2, c.y + Math.sin(time * 0.3 + c.bob) * 0.08, c.depth);
      c.mat.opacity = opacity * c.alpha;
      c.mat.color.setScalar(c.mat.opacity);
    }
  }

  return { object: group, layout, update };
}
