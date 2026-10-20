import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // Served from the custom domain https://michaeljloria.com (GitHub Pages,
  // DNS in Cloud DNS). public/CNAME keeps the domain on each deploy.
  site: "https://michaeljloria.com",
  integrations: [
    tailwind({
      // We supply our own base reset / globals.
      applyBaseStyles: true,
    }),
  ],
});
