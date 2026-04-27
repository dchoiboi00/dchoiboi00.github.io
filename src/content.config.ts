// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    dek: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['CASE STUDY', 'ESSAY', 'NOTE']),
    readTime: z.string().optional(),
  }),
});

export const collections = { writing };
