import { z } from 'zod';

// Structured Argumentation Schema
export const StructuredArgumentationSchema = z.object({
  claim: z.string(),
  premises: z.array(z.string()),
  conclusion: z.string(),
  argumentId: z.string().optional(),
  argumentType: z.enum(["thesis", "antithesis", "synthesis", "objection", "rebuttal"]),
  confidence: z.number().min(0).max(1),
  respondsTo: z.string().optional(),
  supports: z.array(z.string()).optional(),
  contradicts: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  nextArgumentNeeded: z.boolean(),
  suggestedNextTypes: z.array(z.enum(["thesis", "antithesis", "synthesis", "objection", "rebuttal"])).optional()
});

// Type exports for TypeScript
export type StructuredArgumentationData = z.infer<typeof StructuredArgumentationSchema>;