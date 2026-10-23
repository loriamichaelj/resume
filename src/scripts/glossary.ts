// Definition cards for the technology tags in Projects and Experience and the
// pills in the tools marquee. Clicking a tag ([data-term]) opens one shared
// card (#term-card) beside it with a short definition and docs links;
// clicking the tag again, clicking outside or pressing Escape closes it.
// Definitions come from src/data/glossary.ts, embedded in the page as JSON.

type Term = {
  category: string;
  definition: string;
  docs?: { label: string; url: string }[];
};

const card = document.getElementById("term-card");
const raw = document.getElementById("glossary-data")?.textContent;

if (card && raw) {
  const terms = JSON.parse(raw) as Record<string, Term>;
  const title = card.querySelector<HTMLElement>("[data-title]")!;
  const category = card.querySelector<HTMLElement>("[data-category]")!;
  const definition = card.querySelector<HTMLElement>("[data-definition]")!;
  const docs = card.querySelector<HTMLElement>("[data-docs]")!;
  const GAP = 10;
  const MARGIN = 12;
  let current: HTMLButtonElement | null = null;

  // Positioned in page coordinates, so it scrolls with the tag.
  document.body.appendChild(card);

  function place(chip: HTMLElement) {
    const r = chip.getBoundingClientRect();
    const w = card!.offsetWidth;
    const h = card!.offsetHeight;
    const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, MARGIN), window.innerWidth - w - MARGIN);
    // Below the tag, unless there's only room above.
    const above = r.bottom + GAP + h > window.innerHeight - MARGIN && r.top - GAP - h > MARGIN;
    const top = above ? r.top - GAP - h : r.bottom + GAP;
    card!.style.left = `${left + window.scrollX}px`;
    card!.style.top = `${top + window.scrollY}px`;
    card!.dataset.side = above ? "top" : "bottom";
    card!.style.setProperty("--arrow-x", `${r.left + r.width / 2 - left}px`);
  }

  function open(chip: HTMLButtonElement) {
    const key = chip.dataset.term!;
    const term = terms[key];
    if (!term) return;
    if (current) current.setAttribute("aria-expanded", "false");
    current = chip;
    title.textContent = key;
    category.textContent = term.category;
    definition.textContent = term.definition;
    docs.replaceChildren(
      ...(term.docs ?? []).map((d) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = d.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "term-card-link";
        a.textContent = `${d.label} ↗`;
        li.append(a);
        return li;
      }),
    );
    docs.hidden = !term.docs?.length;
    card!.hidden = false;
    card!.classList.remove("is-open");
    place(chip);
    chip.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => card!.classList.add("is-open"));
    card!.focus({ preventScroll: true });
  }

  function close(returnFocus = false) {
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    if (returnFocus) current.focus({ preventScroll: true });
    current = null;
    card!.classList.remove("is-open");
    card!.hidden = true;
  }

  document.addEventListener("click", (e) => {
    const target = e.target as Element;
    const chip = target.closest<HTMLButtonElement>("button[data-term]");
    if (chip) {
      if (chip === current) close();
      else open(chip);
      return;
    }
    if (target.closest("[data-close]")) {
      close(true);
      return;
    }
    if (current && !card.contains(target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current) close(true);
  });

  window.addEventListener("resize", () => current && place(current));
  // Tags inside a scrolling list (the expanded Stack and Services cards) move
  // without the page scrolling, so follow them.
  document.addEventListener("scroll", () => current && place(current), { capture: true, passive: true });
}
