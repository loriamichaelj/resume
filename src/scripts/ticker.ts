// One requestAnimationFrame loop for the whole page, so smooth scrolling, the
// DOM motion and the WebGL scene all update in the same frame, in order
// (lowest `order` first): scroll position, then everything that reads it.

type Callback = (time: number, dt: number) => void;

const subscribers: { cb: Callback; order: number }[] = [];
let last = 0;
let running = false;

function loop(time: number) {
  const dt = last ? Math.min(0.05, (time - last) / 1000) : 1 / 60;
  last = time;
  for (const s of subscribers) s.cb(time, dt);
  requestAnimationFrame(loop);
}

export function onFrame(cb: Callback, order = 0) {
  subscribers.push({ cb, order });
  subscribers.sort((a, b) => a.order - b.order);
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}
