import { z } from 'zod';
import { ToolRecommendationSchema, ToolUsageHistorySchema } from './ToolSchemas.js';

/**
 * Sequential Thought Schema
 *
 * Defines the structure for step-by-step sequential thinking and problem-solving.
 * Includes tool recommendations, step tracking, complexity assessment,
 * and adaptive reasoning processes for systematic analysis.
 */

// Schema for StepRecommendation
export const StepRecommendationSchema = z.object({
  stepDescription: z.string().describe("A clear and concise description of the step to be taken."),
  recommendedTools: z.array(ToolRecommendationSchema).describe("A list of recommended tools to be used for this step, with confidence scores."),
  expectedOutcome: z.string().describe("The expected outcome after completing this step."),
  nextStepConditions: z.array(z.string()).describe("Conditions that would trigger the next step or a branch in the thought process."),
});

// Schema for CurrentStep (extends StepRecommendation)
export const CurrentStepSchema = StepRecommendationSchema.extend({
  stepNumber: z.number().optional().describe("The sequential number of the current step."),
  estimatedDuration: z.string().optional().describe("An estimation of how long this step might take."),
  complexityLevel: z.enum(["low", "medium", "high"]).optional().describe("The assessed complexity level of this step."),
});

// Schema for ThoughtData (main schema)
export const SequentialThoughtSchema = z.object({
  thought: z.string().min(1).describe("The core thinking process or analysis at this stage, forming a coherent narrative."),
  thoughtNumber: z.number().int().positive().describe("The sequential number of the current thought in the series."),
  totalThoughts: z.number().int().positive().describe("The total number of thoughts planned for this problem-solving session."),
  nextThoughtNeeded: z.boolean().describe("A flag indicating whether another thought is required to continue the process."),
  isRevision: z.boolean().optional().describe("Indicates if this thought is a revision of a previous one."),
  revisesThought: z.number().int().positive().optional().describe("The number of the thought that this one revises, if applicable."),
  branchFromThought: z.number().int().positive().optional().describe("The thought number from which a new branch of thinking emerges."),
  branchId: z.string().optional().describe("A unique identifier for a specific branch of thought, allowing for parallel exploration."),
  needsMoreThoughts: z.boolean().optional().describe("Indicates if the current plan needs more thoughts to be added."),
  currentStep: CurrentStepSchema.optional().describe("The detailed description of the immediate next step to be executed."),
  previousSteps: z.array(StepRecommendationSchema).optional().describe("A record of the steps that have already been completed."),
  remainingSteps: z.array(z.string()).optional().describe("A high-level list of the steps that are yet to be taken."),
  toolUsageHistory: z.array(ToolUsageHistorySchema).optional().describe("A log of the tools that have been used so far, along with their effectiveness."),
  sessionId: z.string().optional().describe("Optional session identifier for maintaining state across multiple thoughts."),
});

export const SequentialThoughtResponseSchema = z.object({
  thoughtNumber: z.number().int().positive().describe("The sequential number of the current thought in the series."),
  totalThoughts: z.number().int().positive().describe("The total number of thoughts planned for this problem-solving session."),
  nextThoughtNeeded: z.boolean().describe("A flag indicating whether another thought is required to continue the process."),
  previousSteps: z.array(StepRecommendationSchema).optional().describe("A record of the steps that have already been completed."),
  toolUsageHistory: z.array(ToolUsageHistorySchema).optional().describe("A log of the tools that have been used so far, along with their effectiveness."),
  sessionId: z.string().optional().describe("Optional session identifier for maintaining state across multiple thoughts."),
});

// Type inference for TypeScript
export type StepRecommendationData = z.infer<typeof StepRecommendationSchema>;
export type CurrentStepData = z.infer<typeof CurrentStepSchema>;
export type SequentialThoughtData = z.infer<typeof SequentialThoughtSchema>;
export type SequentialThoughtResponseData = z.infer<typeof SequentialThoughtResponseSchema>;
