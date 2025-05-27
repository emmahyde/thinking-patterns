import { z } from 'zod';

// Schema for ToolRecommendation
export const ToolRecommendationSchema = z.object({
  tool_name: z.string(),
  confidence: z.number().min(0).max(1), // 0.0-1.0
  rationale: z.string(),
  priority: z.number(),
  alternative_tools: z.array(z.string()).optional(),
});

// Schema for StepRecommendation
export const StepRecommendationSchema = z.object({
  step_description: z.string(),
  recommended_tools: z.array(ToolRecommendationSchema),
  expected_outcome: z.string(),
  next_step_conditions: z.array(z.string()),
});

// Schema for CurrentStep (extends StepRecommendation)
export const CurrentStepSchema = StepRecommendationSchema.extend({
  step_number: z.number().optional(),
  estimated_duration: z.string().optional(),
  complexity_level: z.enum(['low', 'medium', 'high']).optional(),
});

// Schema for tool usage history entry
export const ToolUsageHistorySchema = z.object({
  tool_name: z.string(),
  used_at: z.string(),
  effectiveness_score: z.number().optional(),
});

// Schema for EnhancedThoughtData (main schema)
export const ThoughtSchema = z.object({
  thought: z.string(),
  thought_number: z.number().int().positive(),
  total_thoughts: z.number().int().positive(),
  next_thought_needed: z.boolean(),
  is_revision: z.boolean().optional(),
  revises_thought: z.number().int().positive().optional(),
  branch_from_thought: z.number().int().positive().optional(),
  branch_id: z.string().optional(),
  needs_more_thoughts: z.boolean().optional(),
  current_step: CurrentStepSchema.optional(),
  previous_steps: z.array(StepRecommendationSchema).optional(),
  remaining_steps: z.array(z.string()).optional(),
  tool_usage_history: z.array(ToolUsageHistorySchema).optional(),
});

// Schema for ToolContext
export const ToolContextSchema = z.object({
  available_tools: z.array(z.string()),
  user_preferences: z.record(z.any()).optional(),
  session_history: z.array(z.string()).optional(),
  problem_domain: z.string().optional(),
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
