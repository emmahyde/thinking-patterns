import { z } from 'zod';

export const RecursiveThinkingSchema = z.object({
  problem: z.string(),
  baseCases: z.array(z.string()),
  recursiveCases: z.array(z.string()),
  terminationConditions: z.array(z.string()),
  iterativeAlternative: z.string().optional(),
});

export type RecursiveThinking = z.infer<typeof RecursiveThinkingSchema>; 