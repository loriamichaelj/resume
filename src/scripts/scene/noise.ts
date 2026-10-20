import { mulberry32 } from "./random";

// Tileable 3D noise baked once at start-up (in a worker, see noise.worker.ts)
// into an RG volume that the cloud shader samples instead of computing noise
// per ray step. No three.js here, so the worker stays small.
//   R: billowy Perlin-Worley, the cloud's large cauliflower shapes
//   G: finer inverted Worley, frays the edges into wisps

type Lattice = { period: number; values: Float32Array };
type Cells = { cells: number; points: Float32Array };

function lattice(period: number, rand: () => number): Lattice {
  const values = new Float32Array(period ** 3);
  for (let i = 0; i < values.length; i++) values[i] = rand();
  return { period, values };
}

function cells(count: number, rand: () => number): Cells {
  const points = new Float32Array(count ** 3 * 3);
  for (let i = 0; i < points.length; i++) points[i] = rand();
  return { cells: count, points };
}

const fade = (t: number) => t * t * (3 - 2 * t);
const wrap = (i: number, n: number) => ((i % n) + n) % n;

// Trilinear value noise, tiling over the unit cube.
function value(l: Lattice, x: number, y: number, z: number) {
  const p = l.period;
  const fx = x * p, fy = y * p, fz = z * p;
  const ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
  const tx = fade(fx - ix), ty = fade(fy - iy), tz = fade(fz - iz);
  const v = (a: number, b: number, c: number) =>
    l.values[wrap(a, p) + wrap(b, p) * p + wrap(c, p) * p * p];
  const x00 = v(ix, iy, iz) + (v(ix + 1, iy, iz) - v(ix, iy, iz)) * tx;
  const x10 = v(ix, iy + 1, iz) + (v(ix + 1, iy + 1, iz) - v(ix, iy + 1, iz)) * tx;
  const x01 = v(ix, iy, iz + 1) + (v(ix + 1, iy, iz + 1) - v(ix, iy, iz + 1)) * tx;
  const x11 = v(ix, iy + 1, iz + 1) + (v(ix + 1, iy + 1, iz + 1) - v(ix, iy + 1, iz + 1)) * tx;
  const y0 = x00 + (x10 - x00) * ty;
  const y1 = x01 + (x11 - x01) * ty;
  return y0 + (y1 - y0) * tz;
}

// Distance to the nearest feature point (one per cell), tiling, in cell units.
function worley(c: Cells, x: number, y: number, z: number) {
  const n = c.cells;
  const fx = x * n, fy = y * n, fz = z * n;
  const ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
  let best = 9;
  for (let dz = -1; dz <= 1; dz++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const cx = ix + dx, cy = iy + dy, cz = iz + dz;
        const k = (wrap(cx, n) + wrap(cy, n) * n + wrap(cz, n) * n * n) * 3;
        const px = cx + c.points[k] - fx;
        const py = cy + c.points[k + 1] - fy;
        const pz = cz + c.points[k + 2] - fz;
        const d = px * px + py * py + pz * pz;
        if (d < best) best = d;
      }
  return Math.min(1, Math.sqrt(best));
}

const remap = (v: number, a: number, b: number, c: number, d: number) =>
  c + ((v - a) / (b - a)) * (d - c);

export function bakeNoise(size: number): Uint8Array {
  const rand = mulberry32(1337);
  const v = [lattice(4, rand), lattice(8, rand)];
  const w = [cells(3, rand), cells(6, rand), cells(12, rand)];

  const data = new Uint8Array(size * size * size * 2);
  let o = 0;
  for (let z = 0; z < size; z++) {
    const nz = z / size;
    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        // Low octaves only for the billows: finer ones read as grain.
        const perlin = value(v[0], nx, ny, nz) * 0.65 + value(v[1], nx, ny, nz) * 0.35;
        const w1 = 1 - worley(w[0], nx, ny, nz);
        const w2 = 1 - worley(w[1], nx, ny, nz);
        const w3 = 1 - worley(w[2], nx, ny, nz);
        const billow = w1 * 0.72 + w2 * 0.28;
        const pw = Math.min(1, Math.max(0, remap(perlin, billow - 1, 1, 0, 1)));
        const detail = w2 * 0.6 + w3 * 0.4;
        data[o++] = Math.round(pw * 255);
        data[o++] = Math.round(detail * 255);
      }
    }
  }

  return data;
}
