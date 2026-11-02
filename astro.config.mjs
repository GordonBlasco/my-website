// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  redirects: {
    "/fieldNotes": "/blog",
    "/fieldNotes/eating-chicken-of-the-woods/eating-chicken-of-the-woods":
      "/blog/eating-chicken-of-the-woods/eating-chicken-of-the-woods",
    "/fieldNotes/stinkhorns-modoc/stinkhorns-modoc":
      "/blog/stinkhorns-modoc/stinkhorns-modoc",
  },
  build: {
    inlineStylesheets: "never",
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
});
