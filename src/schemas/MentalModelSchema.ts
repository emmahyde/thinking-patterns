import { z } from 'zod';

// Mental Model Schema
export const MentalModelSchema = z.object({
  modelName: z.string().min(1),
  problem: z.string().min(1),
  steps: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
  conclusion: z.string().optional()
});

// Type exports for TypeScript
export type MentalModelData = z.infer<typeof MentalModelSchema>;