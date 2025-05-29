import { z } from 'zod';

// Debugging Approach Schema
export const DebuggingApproachSchema = z.object({
  approachName: z.string().min(1),
  issue: z.string().min(1),
  steps: z.array(z.string()).optional(),
  findings: z.string().optional(),
  resolution: z.string().optional()
});

// Type exports for TypeScript
export type DebuggingApproachData = z.infer<typeof DebuggingApproachSchema>;