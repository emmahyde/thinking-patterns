import { z } from 'zod';
import { ToolRecommendationSchema, ToolUsageHistorySchema } from './ToolSchemas.js';

// Schema for StepRecommendation
export const StepRecommendationSchema = z.object({
  stepDescription: z.string(),
  recommendedTools: z.array(ToolRecommendationSchema),
  expectedOutcome: z.string(),
  nextStepConditions: z.array(z.string()),
});

// Schema for CurrentStep (extends StepRecommendation)
export const CurrentStepSchema = StepRecommendationSchema.extend({
  stepNumber: z.number().optional(),
  estimatedDuration: z.string().optional(),
  complexityLevel: z.enum(['low', 'medium', 'high']).optional(),
});

// Schema for ThoughtData (main schema)
export const SequentialThoughtSchema = z.object({
  thought: z.string().min(1),
  thoughtNumber: z.number().int().positive(),
  totalThoughts: z.number().int().positive(),
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.number().int().positive().optional(),
  branchFromThought: z.number().int().positive().optional(),
  branchId: z.string().optional(),
  needsMoreThoughts: z.boolean().optional(),
  currentStep: CurrentStepSchema.optional(),
  previousSteps: z.array(StepRecommendationSchema).optional(),
  remainingSteps: z.array(z.string()).optional(),
  toolUsageHistory: z.array(ToolUsageHistorySchema).optional(),
});

// Type inference for TypeScript
export type StepRecommendation = z.infer<typeof StepRecommendationSchema>;
export type CurrentStep = z.infer<typeof CurrentStepSchema>;
export type ThoughtData = z.infer<typeof SequentialThoughtSchema>;
