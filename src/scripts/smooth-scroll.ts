import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { onFrame } from "./ticker";

// Inertial smooth scrolling for wheel and trackpad. Driven from the shared
// ticker, so the page, the DOM motion and the 3D scene all see the same scroll
// position every frame. Off under reduced motion, and never created on touch
// screens: Lenis leaves touch scrolling native, but it still registers
// non-passive touchstart/touchmove listeners on the window, which make iOS wait
// for the main thread before every step of a scroll and so make it choppy.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const NAV_OFFSET = 88; // clears the fixed nav

export const lenis =
  reduceMotion || !finePointer
    ? null
    : new Lenis({
        autoRaf: false,
        lerp: 0.085,
        wheelMultiplier: 1,
        stopInertiaOnNavigate: true,
      });

if (lenis) onFrame((time) => lenis.raf(time), -10);

// In-page links (#about etc.) glide to their section, clearing the nav. If the
// section has a [data-scroll-center] element (the contact card), that element
// is centred on screen instead, as long as it fits.
function scrollTarget(section: HTMLElement) {
  const focus = section.querySelector<HTMLElement>("[data-scroll-center]") ?? section;
  const rect = focus.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const room = window.innerHeight - NAV_OFFSET;
  if (focus !== section && rect.height <= room) {
    return top - NAV_OFFSET - (room - rect.height) / 2;
  }
  return top - NAV_OFFSET;
}

document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element).closest?.<HTMLAnchorElement>("a[href^='#']");
  if (!link) return;
  const id = link.getAttribute("href")!.slice(1);
  const section = id ? document.getElementById(id) : null;
  if (!section) return;
  e.preventDefault();
  const y = Math.max(0, scrollTarget(section));
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  // Keep the address bar clean: no #about etc. (also clears a hash the visitor arrived with).
  history.replaceState(null, "", location.pathname + location.search);
});
