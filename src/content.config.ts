import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const kurse = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kurse' }),
  schema: z.object({
    title: z.string(),
    botschaft: z.string(),
    kurz: z.string(),
    kategorie: z.string(),
    status: z.enum(['buchbar', 'geplant']),
    reihenfolge: z.number(),
    dauer: z.string(),
    format: z.string(),
    foerderung: z.string(),
    trio: z.array(z.object({ wert: z.string(), label: z.string() })).length(3),
    module: z.array(z.object({ titel: z.string(), text: z.string() })),
    ergebnisse: z.array(z.string()),
    zielgruppe: z.string(),
    termine: z.array(z.object({ label: z.string(), hinweis: z.string().optional() })).default([]),
  }),
});

export const collections = { blog, kurse };
