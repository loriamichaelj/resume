// DOM-side motion: scroll reveals, the hero word rotator, card tilt and
// spotlight, magnetic buttons, scroll progress, the experience timeline,
// nav scrollspy, the marquee band and the cursor glow. Independent of the
// WebGL scene, so all of it works without WebGL too.

import "./smooth-scroll";
import { onFrame } from "./ticker";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// ---- Scroll reveal -----------------------------------------------------------
const reveals = document.querySelectorAll<HTMLElement>(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
        el.classList.add("is-visible");
        io.unobserve(el);
        // Drop the delay afterwards so hover transitions aren't held back.
        el.addEventListener("transitionend", () => (el.style.transitionDelay = ""), { once: true });
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  reveals.forEach((el) => io.observe(el));
}

// ---- Hero word rotator -------------------------------------------------------
document.querySelectorAll<HTMLElement>("[data-rotator]").forEach((rotator) => {
  const words = Array.from(rotator.querySelectorAll<HTMLElement>(".rotator-word"));
  if (reduceMotion || words.length < 2) return;
  let i = 0;
  let widths: number[] = [];
  const measure = () => {
    widths = words.map((w) => w.offsetWidth);
    rotator.style.width = `${widths[i]}px`;
  };
  measure();
  words[0].style.position = "absolute";
  document.fonts?.ready.then(measure);
  window.addEventListener("resize", measure);
  setInterval(() => {
    if (document.hidden) return;
    const prev = words[i];
    i = (i + 1) % words.length;
    const next = words[i];
    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");
    next.classList.remove("is-leaving");
    next.classList.add("is-active");
    rotator.style.width = `${widths[i]}px`;
    setTimeout(() => prev.classList.remove("is-leaving"), 700);
  }, 2600);
});

// ---- Card spotlight + 3D tilt --------------------------------------------------
if (finePointer && !reduceMotion) {
  document.querySelectorAll<HTMLElement>(".card-surface").forEach((card) => {
    const tilt = card.hasAttribute("data-tilt");
    const max = Number(card.dataset.tilt || 7);
    card.addEventListener("pointerenter", () => {
      card.style.setProperty("--spot", "1");
      if (tilt) card.classList.add("is-tilting");
    });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      if (tilt) {
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        card.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
      }
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--spot", "0");
      if (tilt) {
        card.classList.remove("is-tilting");
        card.style.transform = "";
      }
    });
  });

  // ---- Magnetic buttons ----------------------------------------------------------
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = Number(el.dataset.magnetic || 0.3);
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

// ---- Scroll-linked effects (one rAF loop) ---------------------------------------
const progressBar = document.getElementById("scroll-progress");
const header = document.getElementById("site-nav");
const timeline = document.querySelector<HTMLElement>("[data-timeline]");
const timelineItems = timeline ? Array.from(timeline.querySelectorAll<HTMLElement>(".timeline-item")) : [];
const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav-desktop] a[href^='#']"));
const navIndicator = document.getElementById("nav-indicator");
const navSections = navLinks
  .map((a) => document.querySelector<HTMLElement>(a.getAttribute("href")!))
  .filter((s): s is HTMLElement => !!s);
const marqueeRows = Array.from(document.querySelectorAll<HTMLElement>("[data-marquee]")).map((row) => ({
  row,
  track: row.querySelector<HTMLElement>(".marquee-track")!,
  dir: Number(row.dataset.marquee) || 1,
  x: 0,
  half: 0,
}));
const glow = document.getElementById("cursor-glow");

let marqueeVisible = true;
if (marqueeRows.length && "IntersectionObserver" in window) {
  new IntersectionObserver((entries) => (marqueeVisible = entries.some((e) => e.isIntersecting))).observe(
    marqueeRows[0].row.parentElement!,
  );
}
function measureMarquee() {
  for (const m of marqueeRows) m.half = m.track.scrollWidth / 2;
}
measureMarquee();
window.addEventListener("resize", measureMarquee);
document.fonts?.ready.then(measureMarquee);

const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, gx: 0, gy: 0, seen: false };
if (glow && finePointer && !reduceMotion) {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.seen) {
        pointer.seen = true;
        pointer.gx = e.clientX;
        pointer.gy = e.clientY;
        glow.style.opacity = "1";
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    glow.style.opacity = "0";
    pointer.seen = false;
  });
}

let lastY = window.scrollY;
let velocity = 0;
let direction = 1;
let activeNav = -1;

function moveIndicator(index: number) {
  if (!navIndicator) return;
  const link = navLinks[index];
  if (!link) {
    navIndicator.style.opacity = "0";
    return;
  }
  navIndicator.style.opacity = "1";
  navIndicator.style.width = `${link.offsetWidth}px`;
  navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

function frame(_: number, dt: number) {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const dy = y - lastY;
  lastY = y;
  velocity += (dy / dt - velocity) * 0.15;
  if (Math.abs(dy) > 0.5) direction = dy > 0 ? 1 : -1;

  // Reads first...
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
  const timelineRect = timeline?.getBoundingClientRect();
  const itemTops = timelineItems.map((el) => el.getBoundingClientRect().top);
  const parallaxRects = parallax.map((el) => el.parentElement!.getBoundingClientRect());
  let current = -1;
  navSections.forEach((s, i) => {
    if (s.getBoundingClientRect().top <= vh * 0.4) current = i;
  });

  // ...then writes.
  if (progressBar) progressBar.style.transform = `scaleX(${(y / maxScroll).toFixed(4)})`;
  header?.classList.toggle("is-scrolled", y > 24);

  if (timeline && timelineRect) {
    const p = clamp((vh * 0.62 - timelineRect.top) / timelineRect.height);
    timeline.style.setProperty("--p", p.toFixed(4));
    timelineItems.forEach((el, i) => el.classList.toggle("is-active", itemTops[i] < vh * 0.62));
  }

  if (!reduceMotion) {
    parallax.forEach((el, i) => {
      const r = parallaxRects[i];
      const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax || 0.15);
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });

    if (marqueeVisible) {
      const speed = 40 + Math.min(Math.abs(velocity) * 0.25, 600);
      for (const m of marqueeRows) {
        if (!m.half) continue;
        m.x -= speed * dt * m.dir * direction;
        if (m.x <= -m.half) m.x += m.half;
        if (m.x > 0) m.x -= m.half;
        m.track.style.transform = `translate3d(${m.x.toFixed(2)}px, 0, 0)`;
      }
    }

    if (glow && pointer.seen) {
      pointer.gx += (pointer.x - pointer.gx) * 0.12;
      pointer.gy += (pointer.y - pointer.gy) * 0.12;
      glow.style.transform = `translate3d(${pointer.gx.toFixed(1)}px, ${pointer.gy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  }

  if (current !== activeNav) {
    activeNav = current;
    moveIndicator(current);
    navLinks.forEach((a, i) => a.classList.toggle("is-active", i === current));
  }

}
onFrame(frame, 0);
window.addEventListener("resize", () => moveIndicator(activeNav));
