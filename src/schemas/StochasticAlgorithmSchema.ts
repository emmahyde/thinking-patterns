import { z } from 'zod';

// Stochastic Algorithm Schema
export const StochasticAlgorithmSchema = z.object({
  algorithm: z.string().min(1),
  problem: z.string().min(1),
  parameters: z.record(z.unknown()).optional(),
  result: z.string().optional()
});

// Type exports for TypeScript
export type StochasticAlgorithmData = z.infer<typeof StochasticAlgorithmSchema>;