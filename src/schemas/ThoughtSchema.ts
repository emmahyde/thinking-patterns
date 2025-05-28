import { z } from 'zod';

// Schema for ToolRecommendation
export const ToolRecommendationSchema = z.object({
  toolName: z.string(),
  confidence: z.number().min(0).max(1), // 0.0-1.0
  rationale: z.string(),
  priority: z.number(),
  alternativeTools: z.array(z.string()).optional(),
});

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

// Schema for tool usage history entry
export const ToolUsageHistorySchema = z.object({
  toolName: z.string(),
  usedAt: z.string(),
  effectivenessScore: z.number().optional(),
});

// Schema for EnhancedThoughtData (main schema)
export const ThoughtSchema = z.object({
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

// Schema for ToolContext
export const ToolContextSchema = z.object({
  availableTools: z.array(z.string()),
  userPreferences: z.record(z.any()).optional(),
  sessionHistory: z.array(z.string()).optional(),
  problemDomain: z.string().optional(),
});

// Type inference for TypeScript
export type ToolRecommendation = z.infer<typeof ToolRecommendationSchema>;
export type StepRecommendation = z.infer<typeof StepRecommendationSchema>;
export type CurrentStep = z.infer<typeof CurrentStepSchema>;
export type ToolUsageHistory = z.infer<typeof ToolUsageHistorySchema>;
export type ThoughtData = z.infer<typeof ThoughtSchema>;
export type ToolContext = z.infer<typeof ToolContextSchema>;

// Enhanced ThoughtData alias for backward compatibility
export type EnhancedThoughtData = ThoughtData;
