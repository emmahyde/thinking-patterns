import { z } from 'zod';

// Scientific Method Schema
export const VariableSchema = z.object({
  name: z.string(),
  type: z.enum(["independent", "dependent", "controlled", "confounding"]),
  operationalization: z.string().optional()
});

export const HypothesisSchema = z.object({
  statement: z.string(),
  variables: z.array(VariableSchema),
  assumptions: z.array(z.string()),
  hypothesisId: z.string(),
  confidence: z.number().min(0).max(1),
  domain: z.string(),
  iteration: z.number(),
  alternativeTo: z.array(z.string()).optional(),
  refinementOf: z.string().optional(),
  status: z.enum(["proposed", "testing", "supported", "refuted", "refined"])
});

export const PredictionSchema = z.object({
  if: z.string(),
  then: z.string(),
  else: z.string().optional()
});

export const ExperimentSchema = z.object({
  design: z.string(),
  methodology: z.string(),
  predictions: z.array(PredictionSchema),
  experimentId: z.string(),
  hypothesisId: z.string(),
  controlMeasures: z.array(z.string()),
  results: z.string().optional(),
  outcomeMatched: z.boolean().optional(),
  unexpectedObservations: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional()
});

export const ScientificMethodSchema = z.object({
  stage: z.enum(["observation", "question", "hypothesis", "experiment", "analysis", "conclusion", "iteration"]),
  observation: z.string().optional(),
  question: z.string().optional(),
  hypothesis: HypothesisSchema.optional(),
  experiment: ExperimentSchema.optional(),
  analysis: z.string().optional(),
  conclusion: z.string().optional(),
  inquiryId: z.string(),
  iteration: z.number(),
  nextStageNeeded: z.boolean()
});

// Type exports for TypeScript
export type ScientificMethodData = z.infer<typeof ScientificMethodSchema>;
export type VariableData = z.infer<typeof VariableSchema>;
export type HypothesisData = z.infer<typeof HypothesisSchema>;
export type PredictionData = z.infer<typeof PredictionSchema>;
export type ExperimentData = z.infer<typeof ExperimentSchema>;