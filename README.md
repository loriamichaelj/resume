# Michael J. Loria | Portfolio

**Live site → https://loriamichaelj.github.io/resume/**

A statically-rendered personal portfolio built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com) and [Three.js](https://threejs.org).

A fixed WebGL scene sits behind the page: a volumetric, ray-marched cloud orbited by three little UFOs (AWS, Azure and GCP) with flame trails, lit by a full moon in dark mode or the sun in light mode, aurora colour fields that shift per section, and a parallax starfield. The night sky adds real constellations and network graphs with travelling packets; the day sky has small drifting clouds instead. As you scroll, the cloud flies between anchor points in each section; it billows toward your cursor, and a click (or tap) turns it into a thunderhead that throws lightning. On top of that, a small vanilla script handles scroll reveals, card tilt and spotlight, magnetic buttons, the experience timeline, nav scrollspy and the tech marquee.

Scrolling is smoothed with [Lenis](https://github.com/darkroomengineering/lenis), and everything (scroll, DOM motion, the 3D scene) runs from one shared `requestAnimationFrame` loop so it all moves in the same frame.

Three.js is lazy-loaded after first paint and only on WebGL-capable devices; without it the page falls back to CSS gradients and an SVG cloud. `prefers-reduced-motion` gets a single still frame and no animation.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build

```bash
npm run build    # outputs to ./dist
npm run preview  # preview the production build
```

## Editing content

All site content (bio, socials, hero tagline, marquee, experience, projects, skills, nav) lives in a single typed file:

```
src/data/site.ts
```

Update the values there. Every section reads from it, so there's no markup to touch for routine changes. Icons come from [Lucide](https://lucide.dev) via `lucide-static`, inlined at build time (see `src/components/Icon.astro`). Images live in `public/img/`.

## Structure

```
src/
├─ data/site.ts            # single source of truth for content
├─ layouts/Layout.astro    # <head>, fonts, progress bar, cursor glow, scene + motion scripts
├─ components/             # Nav, Hero, Marquee, About, Experience, Projects, Skills, Contact, Footer,
│                          # Icon, SectionHeading, Scene3D (the WebGL canvas)
├─ scripts/
│  ├─ ticker.ts            # the single shared frame loop
│  ├─ smooth-scroll.ts     # Lenis, driven by the ticker
│  ├─ motion.ts            # DOM animation: reveals, tilt, magnetic, timeline, scrollspy, marquee
│  └─ scene/               # WebGL backdrop
│     ├─ index.ts          #   lazy boot (WebGL check + dynamic import)
│     ├─ world.ts          #   renderer, camera, scroll / pointer / theme, adaptive resolution
│     ├─ anchors.ts        #   where the cloud parks: [data-cloud-anchor] elements
│     ├─ cloud.ts          #   ray-marched volumetric cloud and the UFOs' orbits
│     ├─ ufo.ts            #   flying saucer: hull, dome, rim lights, thruster plume and trail
│     ├─ lightning.ts      #   click storm: leaders, forked strokes, restrikes, sparks
│     ├─ sky.ts            #   moon (dark) / sun with lens flare (light); lights the cloud
│     ├─ constellations.ts #   night: Orion, the Big Dipper, Cassiopeia, Cygnus, Lyra, Scorpius
│     ├─ skyclouds.ts      #   day: small drifting clouds
│     ├─ noise.ts          #   3D noise baked for the cloud (in noise.worker.ts)
│     └─ aurora.ts, stars.ts, network.ts, util.ts, random.ts
└─ pages/index.astro       # composes the page
```

The cloud's path is set in markup: any element with `data-cloud-anchor="<section index>"` (and optional `data-cloud-alpha`) is a stop, read in document order. Hidden anchors are skipped, so a stop can be desktop-only.

## Deploy

Every push to `main` is built and published to **GitHub Pages** at
https://loriamichaelj.github.io/resume/ via the workflow in
`.github/workflows/deploy.yml`.

The build is fully static, so `dist/` can also be hosted anywhere, such as Netlify, Vercel, or Cloudflare Pages. For a custom domain, update `site` (and remove `base`) in `astro.config.mjs`.
