import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // Project page served from https://loriamichaelj.github.io/resume/
  // For a custom domain, set `site` to it and remove `base`.
  site: "https://loriamichaelj.github.io",
  base: "/resume",
  integrations: [
    tailwind({
      // We supply our own base reset / globals.
      applyBaseStyles: true,
    }),
  ],
});
