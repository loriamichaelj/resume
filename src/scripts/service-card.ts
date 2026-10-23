// Service cards in the Services section: each opens as a large floating card
// (src/scripts/expand-card.ts) with its description, its tool tags (which open
// definition cards, src/scripts/glossary.ts) and its GitHub link.

import { expandCard } from "./expand-card";

const overlay = document.getElementById("service-overlay");

if (overlay) {
  const head = overlay.querySelector<HTMLElement>("[data-service-head]")!;
  const icon = overlay.querySelector<HTMLElement>("[data-service-icon-slot]")!;
  const title = overlay.querySelector<HTMLElement>("[data-service-title]")!;
  const body = overlay.querySelector<HTMLElement>("[data-service-body]")!;

  function fill(card: HTMLElement) {
    title.textContent = card.querySelector("h3")!.textContent!.trim();
    icon.replaceChildren(card.querySelector("[data-service-icon] svg")!.cloneNode(true));
    body.replaceChildren(card.querySelector<HTMLTemplateElement>("template[data-service-details]")!.content.cloneNode(true));
    body.scrollTop = 0;
  }

  expandCard(overlay, {
    card: "data-service-card",
    fill,
    rows: () => [head, ...Array.from(body.querySelectorAll<HTMLElement>("[data-rise]"))],
  });
}
