import { z } from "zod";

export const ContentItemSectionKindSchema = z.enum([
  "markdown",
  "problem-statement",
  "example",
  "solution",
  "complexity",
  "callout",
  "visualization",
]);

export type ContentItemSectionKind = z.infer<typeof ContentItemSectionKindSchema>;

export const VisualizationSchema = z.object({
  type: z.string().optional(),
  engine: z.enum(["mermaid", "ascii", "execution", "flow"]).optional(),
  code: z.string().optional(),
  lines: z.array(z.string()).optional(),
  steps: z.array(z.any()).optional(),
  executionSteps: z.array(z.any()).optional(),
});

export type Visualization = z.infer<typeof VisualizationSchema>;

export const ContentItemSectionSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  kind: ContentItemSectionKindSchema,
  bodyMd: z.string().optional(),
  visuals: z.array(VisualizationSchema).optional(),
  metadata: z.record(z.any()).optional(),
  codeBlocks: z.array(z.object({
    language: z.string(),
    title: z.string().optional(),
    code: z.string(),
  })).optional(),
});

export type ContentItemSection = z.infer<typeof ContentItemSectionSchema>;

export const ContentItemDocSchema = z.object({
  slug: z.string(),
  type: z.enum(["problem", "note", "article"]),
  title: z.string(),
  summary: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  visibility: z.enum(["public", "private"]).default("public"),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  topic: z.string().optional(),
  pattern: z.string().optional(),
  tags: z.array(z.string()).default([]),
  content: z.object({
    format: z.literal("sections"),
    sections: z.array(ContentItemSectionSchema),
  }),
  revisionJson: z.array(z.string()).default([]),
  mistakesJson: z.array(z.string()).default([]),
  visualsJson: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ContentItemDoc = z.infer<typeof ContentItemDocSchema>;

export type ContentItemMeta = {
  slug: string;
  type: string;
  title: string;
  summary?: string;
  status: string;
  visibility: string;
  topic?: string;
  difficulty?: string;
  updatedAt?: string;
};
