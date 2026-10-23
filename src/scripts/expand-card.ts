// Cards that open into a large floating panel (the Stack and Services cards).
// Clicking one (or pressing Enter / Space) opens its content as a floating
// card: the card's rectangle grows into the centred panel with an animated
// clip-path, the rows rise in one by one, and on a mouse the panel tilts
// toward the pointer. Escape, the close button or a click outside shrinks it
// back into the card. The panel is the same on phones, where it takes up most
// of the screen.
//
// The overlay holds [data-expand-backdrop], [data-expand-panel] and a
// [data-expand-close] button; `fill` copies a card's content into the panel
// and `rows` lists the panel parts to animate in order.

import { lenis } from "./smooth-scroll";

type Options = {
  // Attribute that marks the cards, e.g. "data-skill-card".
  card: string;
  fill: (card: HTMLElement) => void;
  rows: () => HTMLElement[];
};

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
// Closing: most of the move happens early and it settles softly onto the card.
const EASE_CLOSE = "cubic-bezier(0.32, 0.72, 0, 1)";
const CLOSE_MS = 560;

// A tag's definition card (src/scripts/glossary.ts) can be open on top of the
// panel; while it is, Escape and outside clicks close that card first.
const termOpen = () => document.getElementById("term-card")?.hidden === false;

export function expandCard(overlay: HTMLElement, { card: attr, fill, rows }: Options) {
  const panel = overlay.querySelector<HTMLElement>("[data-expand-panel]")!;
  const backdrop = overlay.querySelector<HTMLElement>("[data-expand-backdrop]")!;
  const selector = `[${attr}]`;

  let current: HTMLElement | null = null;
  let busy = false;
  let tilting = false;

  // Moved to <body> so no ancestor's transform or overflow can affect it.
  document.body.appendChild(overlay);

  // The card's untilted box (its wrapper), used as the start / end of the morph.
  const cardRect = (card: HTMLElement) => (card.parentElement ?? card).getBoundingClientRect();
  const radius = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;

  function insetFor(r: DOMRect, p: DOMRect, round: number) {
    const px = (v: number) => `${Math.max(0, v).toFixed(1)}px`;
    return `inset(${px(r.top - p.top)} ${px(p.right - r.right)} ${px(p.bottom - r.bottom)} ${px(r.left - p.left)} round ${round}px)`;
  }

  function lock() {
    if (lenis) lenis.stop();
    else document.documentElement.style.overflow = "hidden";
  }
  function unlock() {
    if (lenis) lenis.start();
    else document.documentElement.style.overflow = "";
  }

  async function open(card: HTMLElement) {
    if (busy || current) return;
    busy = true;
    current = card;
    card.setAttribute("aria-expanded", "true");
    fill(card);
    lock();

    // Lay the panel out at its final size, then morph from the card.
    overlay.hidden = false;
    const from = cardRect(card);
    const to = panel.getBoundingClientRect();

    if (reduceMotion) {
      await panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }).finished;
    } else {
      panel.style.willChange = "clip-path, opacity";
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: "ease-out" });
      panel.animate(
        [
          { clipPath: insetFor(from, to, radius(card)), opacity: 0.5 },
          { clipPath: insetFor(to, to, radius(panel)), opacity: 1 },
        ],
        { duration: 640, easing: EASE_OUT },
      );
      rows().forEach((el, i) =>
        el.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 560, delay: 200 + Math.min(i, 30) * 20, easing: EASE_OUT, fill: "backwards" },
        ),
      );
      // The card hands over to the panel once the panel covers it.
      setTimeout(() => card.classList.add("is-lifted"), 120);
      await new Promise((r) => setTimeout(r, 640));
    }

    card.classList.add("is-lifted");
    panel.style.willChange = "";
    panel.focus({ preventScroll: true });
    tilting = finePointer && !reduceMotion;
    busy = false;
  }

  async function close() {
    const card = current;
    if (!card || busy) return;
    busy = true;
    tilting = false;

    // The panel's own box, ignoring its pointer tilt (which eases back to flat
    // through the panel's transform transition while it shrinks).
    panel.style.transform = "";
    panel.style.removeProperty("--mx");
    panel.style.removeProperty("--my");
    const from = new DOMRect(panel.offsetLeft, panel.offsetTop, panel.offsetWidth, panel.offsetHeight);

    if (reduceMotion) {
      card.classList.remove("is-lifted");
      await panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120 }).finished;
    } else {
      panel.style.willChange = "clip-path, opacity";
      for (const el of rows()) {
        el.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: "translateY(-8px)" },
          ],
          { duration: 150, easing: "ease-in", fill: "forwards" },
        );
      }
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS, easing: "ease", fill: "forwards" });
      panel.animate(
        [
          { clipPath: insetFor(from, from, radius(panel)) },
          { clipPath: insetFor(cardRect(card), from, radius(card)) },
        ],
        { duration: CLOSE_MS, easing: EASE_CLOSE, fill: "forwards" },
      );
      // Once the panel has settled onto the card it dissolves into it, so the
      // dense glass doesn't snap to the card's lighter fill.
      panel.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], {
        duration: CLOSE_MS,
        easing: "ease-out",
        fill: "forwards",
      });
      setTimeout(() => card.classList.remove("is-lifted"), CLOSE_MS * 0.3);
      await new Promise((r) => setTimeout(r, CLOSE_MS));
    }

    overlay.hidden = true;
    for (const el of [panel, backdrop, ...Array.from(panel.querySelectorAll("*"))]) {
      el.getAnimations().forEach((a) => a.cancel());
    }
    panel.style.willChange = "";
    card.classList.remove("is-lifted");
    card.setAttribute("aria-expanded", "false");
    unlock();
    card.focus({ preventScroll: true });
    current = null;
    busy = false;
  }

  // Capture phase, so these run before the definition card's own handlers
  // close it and can still see that it was open.
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element;
      const card = target.closest<HTMLElement>(selector);
      if (card) {
        open(card);
        return;
      }
      if (!current || termOpen()) return;
      if (target.closest("[data-expand-close]") || target === overlay || target === backdrop) close();
    },
    true,
  );

  document.addEventListener(
    "keydown",
    (e) => {
      const target = e.target as Element;
      if (!current) {
        const card = target.closest?.<HTMLElement>(selector);
        if (card && target === card && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open(card);
        }
        return;
      }
      if (e.key === "Escape") {
        if (!termOpen()) close();
      }
      // Keep focus inside the dialog, cycling through its buttons and links.
      else if (e.key === "Tab" && (panel.contains(target) || !termOpen())) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>("a[href], button"));
        const i = items.indexOf(target as HTMLElement);
        const edge = e.shiftKey ? i <= 0 : i === -1 || i === items.length - 1;
        if (edge) {
          e.preventDefault();
          items.at(e.shiftKey ? -1 : 0)?.focus();
        }
      }
    },
    true,
  );

  // Tilt and spotlight follow the pointer (mouse only).
  panel.addEventListener("pointermove", (e) => {
    if (!tilting) return;
    const r = panel.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width);
    const py = clamp((e.clientY - r.top) / r.height);
    panel.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    panel.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    panel.style.transform = `perspective(1400px) rotateX(${((0.5 - py) * 4).toFixed(2)}deg) rotateY(${((px - 0.5) * 5).toFixed(2)}deg)`;
  });
  panel.addEventListener("pointerleave", () => {
    panel.style.transform = "";
  });
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}
