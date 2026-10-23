// Skill cards in the Stack section: each opens as a large floating card
// (src/scripts/expand-card.ts) listing its tools and details as pills, each
// of which opens its definition card (src/scripts/glossary.ts).

import { expandCard } from "./expand-card";

const overlay = document.getElementById("skill-overlay");

if (overlay) {
  const head = overlay.querySelector<HTMLElement>("[data-skill-head]")!;
  const title = overlay.querySelector<HTMLElement>("[data-skill-title]")!;
  const list = overlay.querySelector<HTMLElement>("[data-skill-list]")!;

  function fill(card: HTMLElement) {
    title.textContent = card.querySelector("h3")!.textContent!.trim();
    list.replaceChildren(card.querySelector<HTMLTemplateElement>("template[data-skill-details]")!.content.cloneNode(true));
    list.scrollTop = 0;
  }

  expandCard(overlay, {
    card: "data-skill-card",
    fill,
    rows: () => [head, ...(Array.from(list.children) as HTMLElement[])],
  });
}
