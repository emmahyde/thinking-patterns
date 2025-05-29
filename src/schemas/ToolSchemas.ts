import { z } from 'zod';

// Schema for ToolRecommendation
export const ToolRecommendationSchema = z.object({
  toolName: z.string(),
  confidence: z.number().min(0).max(1), // 0.0-1.0
  rationale: z.string(),
  priority: z.number(),
  alternativeTools: z.array(z.string()).optional(),
});

// Schema for tool usage history entry
export const ToolUsageHistorySchema = z.object({
  toolName: z.string(),
  usedAt: z.string(),
  effectivenessScore: z.number().optional(),
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
export type ToolUsageHistory = z.infer<typeof ToolUsageHistorySchema>;
export type ToolContext = z.infer<typeof ToolContextSchema>;