import { z } from 'zod';

/**
 * Tool Schemas
 * 
 * Defines the structure for tool recommendations, usage tracking, and context
 * management. Supports systematic tool selection, confidence assessment,
 * and usage history for enhanced decision-making processes.
 */

// Schema for ToolRecommendation
export const ToolRecommendationSchema = z.object({
  toolName: z.string().describe("The name of the recommended tool."),
  confidence: z.number().min(0).max(1).describe("A confidence score (0-1) in the recommendation."),
  rationale: z.string().describe("The rationale for recommending this tool."),
  priority: z.number().describe("The priority of this tool recommendation."),
  alternativeTools: z.array(z.string()).optional().describe("A list of alternative tools that could be used."),
});

// Schema for tool usage history entry
export const ToolUsageHistorySchema = z.object({
  toolName: z.string().describe("The name of the tool that was used."),
  usedAt: z.string().describe("The timestamp at which the tool was used."),
  effectivenessScore: z.number().optional().describe("A score indicating the effectiveness of the tool."),
});

// Schema for ToolContext
export const ToolContextSchema = z.object({
  availableTools: z.array(z.string()).describe("A list of available tools."),
  userPreferences: z.record(z.any()).optional().describe("A record of user preferences."),
  sessionHistory: z.array(z.string()).optional().describe("A history of the current session."),
  problemDomain: z.string().optional().describe("The domain of the problem being solved."),
});

// Type inference for TypeScript
export type ToolRecommendationData = z.infer<typeof ToolRecommendationSchema>;
export type ToolUsageHistoryData = z.infer<typeof ToolUsageHistorySchema>;
export type ToolContextData = z.infer<typeof ToolContextSchema>;