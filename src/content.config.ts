import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Content collection: all markdown files under src/content/docs/
// At build time, we'll symlink/copy the `dragonly/md` content repo into this dir.
// For local dev / v0.1 step 1, we ship a fixture folder.
const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z
    .object({
      title: z.string().optional(),
      created: z.coerce.date().optional(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      pinned: z.boolean().default(false),
      order: z.number().optional(),
      draft: z.boolean().default(false),
    })
    .passthrough(),
});

export const collections = { docs };
