import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      topics: z.array(z.string()).optional(),
      heroImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const library = defineCollection({
  // Book notes use the same post metadata as the blog, plus a local cover image.
  loader: glob({ base: "./src/content/library", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Date this note was published on this website.
      pubDate: z.coerce.date(),
      // First publication of the work. Kept as bibliographic text because many
      // older works are known only to a year (and some only approximately).
      publicationDate: z.string(),
      // Fiction or not. Kept separate from `topics`, which is a free tag list and
      // cannot be trusted to carry this: most entries are tagged only `book`.
      // Required on purpose — a new entry should have to say which it is rather
      // than default into one side of the Plots view.
      category: z.enum(["fiction", "nonfiction"]),
      // Filled in from Open Library by scripts/fetch-page-counts.mjs, and
      // optional because the catalogue has no confident match for every book.
      pages: z.number().int().positive().optional(),
      authors: z.array(z.string()).min(1),
      updatedDate: z.coerce.date().optional(),
      topics: z.array(z.string()).optional(),
      heroImage: image().optional(),
      cover: image(),
      finishedDates: z.array(z.coerce.date()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, library };
