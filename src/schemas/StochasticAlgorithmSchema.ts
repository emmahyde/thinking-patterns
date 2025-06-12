import { z } from 'zod';

// Stochastic Algorithm Schema
export const StochasticAlgorithmSchema = z.object({
  algorithm: z.string().min(1).describe("The name of the stochastic algorithm to be used (e.g., 'Monte Carlo Tree Search', 'Simulated Annealing')."),
  problem: z.string().min(1).describe("A formal description of the problem to be solved, including the state space, actions, and objective function if applicable."),
  parameters: z.record(z.unknown()).optional().describe("Algorithm-specific parameters. For MCTS, this could be {'simulations': 1000, 'exploration_constant': 1.41}. For Simulated Annealing, {'initial_temp': 1000, 'cooling_rate': 0.995}."),
  result: z.string().optional().describe("The output of the algorithm, which could be an optimal policy, a selected action, a predicted value, or a solution path.")
});

// Type exports for TypeScript
export type StochasticAlgorithmData = z.infer<typeof StochasticAlgorithmSchema>;