import { z } from 'zod';

// Structured Argumentation Schema
export const StructuredArgumentationSchema = z.object({
  claim: z.string().describe("The central claim or assertion being made."),
  premises: z.array(z.string()).describe("A list of reasons or evidence supporting the claim."),
  conclusion: z.string().describe("The logical conclusion drawn from the premises."),
  argumentId: z.string().optional().describe("A unique identifier for this argument."),
  argumentType: z.enum(["thesis", "antithesis", "synthesis", "objection", "rebuttal"]).describe("The type of argument being made."),
  confidence: z.number().min(0).max(1).describe("A confidence score (0-1) in the validity of the argument."),
  respondsTo: z.string().optional().describe("The ID of the argument to which this one is responding."),
  supports: z.array(z.string()).optional().describe("A list of argument IDs that this argument supports."),
  contradicts: z.array(z.string()).optional().describe("A list of argument IDs that this argument contradicts."),
  strengths: z.array(z.string()).optional().describe("A list of the argument's strengths."),
  weaknesses: z.array(z.string()).optional().describe("A list of the argument's weaknesses."),
  nextArgumentNeeded: z.boolean().describe("A flag indicating whether another argument is needed to continue the debate."),
  suggestedNextTypes: z.array(z.enum(["thesis", "antithesis", "synthesis", "objection", "rebuttal"])).optional().describe("A list of suggested types for the next argument."),
});

// Type exports for TypeScript
export type StructuredArgumentationData = z.infer<typeof StructuredArgumentationSchema>;