import { z } from "zod";

const VisualizationSchema = z.record(z.unknown());

const SolutionSchema = z.object({
  intuitionMd: z.string().default(""),
  intuitionVisualization: VisualizationSchema.nullable().optional(),
  approachMd: z.string().default(""),
  approachVisualization: VisualizationSchema.nullable().optional(),
  dryRun: z.string().optional(),
  dryRunVisualization: VisualizationSchema.nullable().optional(),
  visualization: VisualizationSchema.nullable().optional(),
  codeJava: z.string().default(""),
  time: z.string().default(""),
  space: z.string().default(""),
  complexityExplanationMd: z.string().default(""),
  complexityVisualization: VisualizationSchema.nullable().optional(),
});

const ProblemContentSchema = z.object({
  statementMd: z.string().default(""),
  statementVisualization: VisualizationSchema.nullable().optional(),
  inputMd: z.string().default(""),
  inputVisualization: VisualizationSchema.nullable().optional(),
  outputMd: z.string().default(""),
  outputVisualization: VisualizationSchema.nullable().optional(),
  exampleMd: z.string().default(""),
  exampleVisualization: VisualizationSchema.nullable().optional(),
  exampleExplanationMd: z.string().default(""),
  exampleExplanationVisualization: VisualizationSchema.nullable().optional(),
  brute: SolutionSchema,
  optimal: SolutionSchema,
  quickRevision: z.object({
    brute: z.array(z.string()).default([]),
    optimal: z.array(z.string()).default([]),
  }),
});

export const ProblemDocSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase a-z, 0-9, and hyphens only"),
  title: z.string().min(1, "title is required"),
  topic: z.string().min(1, "topic is required"),
  pattern: z.string().min(1, "pattern is required"),
  link: z.string().url("link must be a valid URL"),
  content: ProblemContentSchema,
});
