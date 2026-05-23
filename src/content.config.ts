import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(), // YYYY-MM-DD — kept as string per architecture spec
    disciplines: z.array(z.string()),
    draft: z.boolean().default(false),
    order: z.number(),
    heroImage: z.string().startsWith("/").optional(), // absolute path, e.g. "/heroes/foo.jpg"
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    date: z.string(), // YYYY-MM-DD
    draft: z.boolean().default(false),
    order: z.number(),
  }),
});

export const collections = { projects, writing };
