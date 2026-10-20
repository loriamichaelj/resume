import { bakeNoise } from "./noise";

// Bakes the cloud's noise volume off the main thread (it takes ~100 ms on a
// fast laptop, longer elsewhere) and hands the buffer back without copying.
self.onmessage = (e: MessageEvent<number>) => {
  const data = bakeNoise(e.data);
  (self as unknown as Worker).postMessage(data, [data.buffer]);
};
