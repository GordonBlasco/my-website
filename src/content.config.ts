import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      topics: z.array(z.string()).optional(),
      heroImage: image().optional(),
    }),
});

const fieldNotes = defineCollection({
  // Load Markdown and MDX files in the `src/content/field-notes/` directory.
  loader: glob({ base: "./src/content/fieldNotes", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      topics: z.array(z.string()).optional(),
      heroImage: image().optional(),
    }),
});

export const collections = { blog, fieldNotes };
