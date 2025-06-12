import { z } from 'zod';

export const CriticalThinkingSchema = z.object({
  subject: z.string(), // The code, design, or requirement to analyze
  potentialIssues: z.array(z.string()),
  edgeCases: z.array(z.string()),
  invalidAssumptions: z.array(z.string()),
  alternativeApproaches: z.array(z.string()),
});

export type CriticalThinking = z.infer<typeof CriticalThinkingSchema>; 