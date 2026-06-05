# Michael J. Loria — Portfolio

**Live site → https://loriamichaelj.github.io/resume/**

A fast, statically-rendered personal portfolio built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). The hero features an interactive [Three.js](https://threejs.org) object; the rest is plain HTML/CSS with a small vanilla script for the mobile nav and scroll reveals.

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

All site content (bio, socials, experience, projects, skills, nav) lives in a single typed file:

```
src/data/site.ts
```

Update the values there — every section reads from it, so there's no markup to touch for routine changes. Images live in `public/img/`.

## Structure

```
src/
├─ data/site.ts          # single source of truth for content
├─ layouts/Layout.astro  # <head>, fonts, scroll-reveal script
├─ components/            # Nav, Hero, About, Experience, Projects, Skills, Contact, Footer, Icon, SectionHeading
└─ pages/index.astro      # composes the page
```

## Deploy

Every push to `main` is built and published to **GitHub Pages** at
https://loriamichaelj.github.io/resume/ via the workflow in
`.github/workflows/deploy.yml`.

The build is fully static, so `dist/` can also be hosted anywhere — Netlify, Vercel, Cloudflare Pages. For a custom domain, update `site` (and remove `base`) in `astro.config.mjs`.
