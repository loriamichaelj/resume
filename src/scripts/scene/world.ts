import * as THREE from "three";
import { CloudPath, type CloudTarget } from "./anchors";
import { createAurora } from "./aurora";
import { createCloud } from "./cloud";
import { createNetwork, NETWORK_COLORS } from "./network";
import { createStars } from "./stars";
import { createSky } from "./sky";
import { createConstellations } from "./constellations";
import { createSkyClouds } from "./skyclouds";
import { clamp, damp } from "./util";
import { applyQuality, savedLevel, type Quality } from "./quality";
import { onFrame } from "../ticker";

// How far (world units) the background column travels over the full page
// scroll. Smaller than the page itself, so the backdrop parallaxes behind it.
const SPAN = 36;
const CAMERA_Z = 10;

export function createWorld(canvas: HTMLCanvasElement, quality: Quality) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = quality.tier === "low";
  const isLight = () => document.documentElement.classList.contains("light");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    // MSAA is costly on weak GPUs and the scene is soft anyway, so the low
    // tier goes without it.
    antialias: quality.antialias,
    // Only the top tier asks for a discrete GPU: elsewhere the integrated one
    // copes and saves the battery.
    powerPreference: quality.tier === "high" ? "high-performance" : "default",
  });
  // Colour management is off (see util.ts): no output conversion either.
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  // Render resolution, as a rung on the adaptive ladder (see quality.ts). Start
  // where this device settled last time, else at its tier's default.
  const dpr = window.devicePixelRatio || 1;
  let level = clamp(savedLevel(quality) ?? quality.start, 0, quality.max);
  const levels = quality.levels;
  const ratioAt = (l: number) => Math.min(dpr, levels[l].ratio);
  renderer.setPixelRatio(ratioAt(level));
  applyQuality(quality, level);

  if (reduceMotion) {
    canvas.classList.add("is-static");
    document.documentElement.classList.add("webgl-static");
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  // ---- Layers ----------------------------------------------------------------
  const light = isLight();
  const aurora = createAurora({ light });
  scene.add(aurora.object);

  // Everything in `column` scrolls (slower than the page) as you move down.
  const column = new THREE.Group();
  scene.add(column);

  const stars = createStars({ lowPower, span: SPAN, light });
  column.add(stars.object);

  // Moon (dark) or sun (light), top right above the hero.
  const sky = createSky({ light });
  column.add(sky.object);
  scene.add(camera); // the sun's lens flare rides on the camera
  sky.attach(camera);


  const networkA = createNetwork({
    nodes: lowPower ? 22 : 34,
    seed: 3,
    radius: [3.2, 2.3, 1.8],
    colors: NETWORK_COLORS.coolWarm,
    light,
  });
  const networkB = createNetwork({
    nodes: lowPower ? 18 : 28,
    seed: 11,
    radius: [2.8, 2.2, 1.6],
    colors: NETWORK_COLORS.warmCool,
    light,
  });
  const networkC = createNetwork({
    nodes: lowPower ? 16 : 24,
    seed: 23,
    radius: [2.6, 2.0, 1.5],
    colors: NETWORK_COLORS.coolWarm,
    light,
  });
  column.add(networkA.object, networkB.object, networkC.object);

  // Night: real constellations. Day: small drifting clouds instead.
  const constellations = createConstellations({ span: SPAN });
  const skyClouds = createSkyClouds({ count: lowPower ? 8 : 14, span: SPAN });
  column.add(constellations.object, skyClouds.object);
  let night = light ? 0 : 1;

  // Labels are fixed to the viewport, so a static (reduced motion) canvas that
  // scrolls away with the page doesn't get them.
  const labels = reduceMotion ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-orb]"));
  // Under reduced motion the still frame is redrawn once the cloud can show.
  const cloud = createCloud({
    quality: quality.cloud,
    follow: quality.touch ? 16 : 9,
    light,
    labels,
    onReady: () => reduceMotion && renderStatic(),
  });
  scene.add(cloud.object);

  const path = new CloudPath();

  // ---- Layout ------------------------------------------------------------------
  // The canvas is 100lvh, so `height` stays put when a phone's toolbar slides
  // in and out; window.innerHeight doesn't, and anything scroll-related that
  // used it would jump with the toolbar.
  let width = 1;
  let height = 1;

  // Park each network beside the section it belongs to, in the side margin.
  function placeNetworks() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
    const at = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return 0.5;
      const mid = el.offsetTop + el.offsetHeight / 2 - height / 2;
      return clamp(mid / maxScroll);
    };
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const halfW = (z: number) => tanHalf * (CAMERA_Z - z) * camera.aspect;
    networkA.object.position.set(halfW(-6) * 0.62, -at("experience") * SPAN, -6);
    networkB.object.position.set(-halfW(-7) * 0.6, -at("skills") * SPAN, -7);
    networkC.object.position.set(-halfW(-8) * 0.62, -at("about") * SPAN - 1, -8);
  }

  const drawing = new THREE.Vector2();
  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(drawing);
    cloud.setResolution(drawing.x, drawing.y, levels[level].cloud);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const px = height * renderer.getPixelRatio();
    stars.resize(px, camera.fov);
    networkA.resize(px, camera.fov);
    networkB.resize(px, camera.fov);
    networkC.resize(px, camera.fov);
    constellations.resize(px, camera.fov);
    constellations.layout(camera);
    skyClouds.layout(camera);
    cloud.resize(px, camera.fov);
    aurora.resize(width, height);
    sky.layout(camera);
    placeNetworks();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener("load", placeNetworks);

  // ---- Input -------------------------------------------------------------------
  // The canvas is fixed at the viewport origin (except under reduced motion).
  const fixedRect = new DOMRect(0, 0, 0, 0);
  const pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false };
  // When anything last moved (pointer, scroll, a click), for the idle throttle.
  let lastInput = performance.now();
  const INTERACTIVE = "a, button, input, select, textarea, label, [role='dialog'], [role='button'], [data-overlay]";
  const overInteractive = (e: Event) => !!(e.target as Element | null)?.closest?.(INTERACTIVE);
  window.addEventListener(
    "pointermove",
    (e) => {
      lastInput = performance.now();
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.active = e.pointerType === "mouse";
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => (pointer.active = false));
  window.addEventListener("keydown", () => (lastInput = performance.now()), { passive: true });
  // A click on the cloud sets off its storm (or tickles it by day), unless it
  // lands on something interactive in front of it (a link, a button, a tag,
  // the definition card).
  window.addEventListener(
    "pointerdown",
    (e) => {
      lastInput = performance.now();
      if (overInteractive(e)) return;
      cloud.poke(e.clientX, e.clientY);
    },
    { passive: true },
  );

  // ---- Theme -------------------------------------------------------------------
  function applyTheme() {
    const l = isLight();
    for (const layer of [aurora, stars, networkA, networkB, networkC, cloud, sky]) layer.setTheme(l);
    if (reduceMotion) renderStatic();
  }
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // ---- Frame -------------------------------------------------------------------
  let time = 0;
  let lastScroll = window.scrollY;
  let scrollVel = 0;
  let progress = 0;
  let roll = 0;
  let anchor: CloudTarget | null = null;

  const lightDir = new THREE.Vector3();
  const smoothLight = new THREE.Vector3(0.45, 0.85, 0.4).normalize();

  function step(dt: number, animate: boolean) {
    time += dt;
    const sy = window.scrollY;
    scrollVel = damp(scrollVel, (sy - lastScroll) / Math.max(dt, 1e-3), 6, dt);
    lastScroll = sy;

    // Scroll is already smoothed by Lenis (or native touch), so use it as is:
    // extra damping here would make the backdrop lag behind the page.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
    progress = animate ? clamp(sy / maxScroll) : 0;
    column.position.y = progress * SPAN;

    // Pointer parallax, a gentle dolly mid-page and a roll with scroll speed.
    camera.position.x = damp(camera.position.x, pointer.nx * 0.5, 2.5, dt);
    camera.position.y = damp(camera.position.y, -pointer.ny * 0.35, 2.5, dt);
    camera.position.z = CAMERA_Z - Math.sin(progress * Math.PI) * 1.2;
    camera.lookAt(0, 0, -2);
    roll = damp(roll, clamp(scrollVel / 9000, -0.05, 0.05), 4, dt);
    camera.rotateZ(roll);
    camera.updateMatrixWorld();

    // Light the cloud from the sun or moon. Keep the light in front of the
    // cloud (the bodies sit far behind it) and from above, so its face stays
    // lit, and ease toward it as things move.
    sky.update(time, dt, camera);
    sky.lightPosition(lightDir).sub(cloud.object.position);
    lightDir.z = Math.max(lightDir.z, lightDir.length() * 0.6);
    lightDir.y = Math.max(lightDir.y, lightDir.length() * 0.25);
    lightDir.normalize();
    smoothLight.lerp(lightDir, 1 - Math.exp(-3 * dt)).normalize();
    cloud.setLightDir(smoothLight);

    // Animated frames use the anchors sampled at the top of the frame, before
    // any DOM writes (see the frame loop below).
    const target = animate ? anchor : path.sample(canvas.getBoundingClientRect(), height);
    const flash = cloud.update({
      dt,
      time,
      target,
      scrollVel,
      pointer,
      camera,
      width,
      height,
    });
    stars.update(time, scrollVel);
    night = damp(night, isLight() ? 0 : 1, 2.5, dt);
    networkA.update(time, night);
    networkB.update(time * 0.9 + 10, night);
    networkC.update(time * 1.1 + 20, night);
    constellations.update(time, night);
    skyClouds.update(time, dt, 1 - night);
    aurora.update(time, target?.section ?? 0, dt, flash);

    aurora.render(renderer, camera);
    cloud.render(renderer, camera);
    renderer.render(scene, camera);
  }

  // Reduced motion: a single still frame of the hero, re-drawn only on resize
  // or theme change. The canvas scrolls away with the page (.is-static).
  function renderStatic() {
    // Several settling steps so the damped values land on their targets.
    for (let i = 0; i < 90; i++) step(1 / 30, false);
  }

  // Adaptive resolution: if frames run long for a second, step down a rung
  // (the cloud's resolution first, then the canvas's); step back up after a
  // sustained smooth stretch, up to the tier's ceiling. Each step down doubles
  // the wait before trying the next rung up, so a device settles instead of
  // bouncing between two. Touch devices only climb back while the page is at
  // rest: each change reallocates buffers, which would hitch a scroll.
  //
  // Long frames aren't always the GPU's fault. iOS Low Power Mode caps
  // requestAnimationFrame at 30 fps however light the scene is, and reading
  // that as a slow GPU would strip the resolution for nothing (and remember
  // it). So a step down is a trial: if frames are no faster a moment later,
  // the cap is the cause, the step is undone and the session stops stepping down.
  let slow = 0;
  let smooth = 0;
  let upAfter = 8;
  let warmup = 2; // seconds: start-up (fonts, parsing, uploads) hitches anyway
  let avgDt = 1 / 60; // smoothed frame time
  let capped = false; // frames are long whatever the resolution
  let trial: { from: number; before: number; time: number; sum: number; frames: number } | null = null;
  const TRIAL = { settle: 0.5, length: 1.5 }; // seconds
  const sameRung = (a: number, b: number) => ratioAt(a) === ratioAt(b) && levels[a].cloud === levels[b].cloud;
  function setLevel(next: number) {
    // Skip rungs that change nothing on this screen (ratios above its own).
    const dir = Math.sign(next - level);
    while (next > 0 && next < quality.max && sameRung(next, level)) next += dir;
    if (sameRung(next, level)) return;
    const ratioChanged = ratioAt(next) !== ratioAt(level);
    level = next;
    if (ratioChanged) renderer.setPixelRatio(ratioAt(level));
    resize();
    applyQuality(quality, level);
  }
  function adapt(dt: number) {
    if (warmup > 0) {
      warmup -= dt;
      return;
    }
    avgDt += (dt - avgDt) * 0.05;

    if (trial) {
      trial.time += dt;
      if (trial.time > TRIAL.settle) {
        trial.sum += dt;
        trial.frames++;
      }
      if (trial.time < TRIAL.length) return;
      const after = trial.sum / Math.max(1, trial.frames);
      // Still long and barely faster: the resolution wasn't the limit.
      if (after > 1 / 45 && after > trial.before * 0.9) {
        capped = true;
        setLevel(trial.from);
      }
      trial = null;
      slow = 0;
      smooth = 0;
      return;
    }

    if (dt > 1 / 45) {
      if (!capped) slow += dt;
      smooth = 0;
    } else {
      smooth += dt;
      slow = Math.max(0, slow - dt * 0.5);
      if (capped && smooth > 3) capped = false; // the cap lifted (Low Power Mode off)
    }
    if (slow > 1 && level > 0) {
      trial = { from: level, before: avgDt, time: 0, sum: 0, frames: 0 };
      setLevel(level - 1);
      upAfter = Math.min(upAfter * 2, 120);
      slow = 0;
      smooth = 0;
    } else if (smooth > upAfter && level < quality.max && (!quality.touch || Math.abs(scrollVel) < 1)) {
      setLevel(level + 1);
      smooth = 0;
    }
  }

  // Frame pacing. The low tier caps at 60 fps (a 120 Hz screen would double
  // its work), and the lower tiers drop to a slow drift rate once nothing on
  // the page has moved for a few seconds, which keeps fans and heat down.
  const IDLE_AFTER = 4000; // ms
  let pending = 0;
  const isIdle = (now: number) =>
    quality.idleFps > 0 && now - lastInput > IDLE_AFTER && Math.abs(scrollVel) < 1 && cloud.calm();

  let running = false;
  function start() {
    running = true;
  }
  function stop() {
    running = false;
  }
  // Two halves of one frame. The first runs right after smooth scrolling and
  // before the DOM motion writes anything: it decides whether this frame is
  // due and reads the cloud's anchors, so the layout reads never follow style
  // writes (which would force a second layout every scrolled frame, a main
  // thread stall that shows as stutter on phones). The second renders, after
  // the DOM motion has run.
  let due = 0; // seconds to advance this frame; 0: skip it
  let throttled = false;
  onFrame((now, dt) => {
    due = 0;
    if (!running || document.hidden) return;
    if (window.scrollY !== lastScroll) lastInput = now;
    throttled = isIdle(now);
    const fps = throttled ? quality.idleFps : quality.maxFps;
    pending += dt;
    // Half a frame of slack, so a cap near the display rate doesn't drop frames.
    if (fps > 0 && pending < 1 / fps - dt * 0.5) return;
    due = pending;
    pending = 0;
    anchor = path.sample(fixedRect, height);
  }, -5);
  onFrame(() => {
    if (!due) return;
    step(due, true);
    // Throttled frames say nothing about how the GPU is coping.
    if (!throttled) adapt(due);
  }, 10);

  if (reduceMotion) {
    renderStatic();
    new ResizeObserver(() => renderStatic()).observe(canvas);
  } else {
    // Compile every shader up front (off the main thread where supported), so
    // layers further down the page don't hitch the first time they appear.
    renderer
      .compileAsync(scene, camera)
      .catch(() => {})
      .then(start);
  }

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    stop();
    document.documentElement.classList.remove("webgl");
  });

  // Fade the canvas in (and the CSS fallbacks out) once the first frame is drawn.
  requestAnimationFrame(() => document.documentElement.classList.add("webgl"));
}
