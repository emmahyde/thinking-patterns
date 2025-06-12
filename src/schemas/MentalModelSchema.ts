import { z } from 'zod';

/**
 * Mental Model Schema
 * 
 * Defines the structure for applying mental models to problem analysis.
 * Mental models are frameworks for understanding and analyzing complex problems
 * by applying established thinking patterns and methodologies.
 */
export const MentalModelSchema = z.object({
  modelName: z.string().min(1).describe("The name of the mental model being used (e.g., 'Second-Order Thinking', 'First Principles'). This helps categorize the analysis."),
  problem: z.string().min(1).describe("A clear, specific, and bounded description of the problem being analyzed. A good problem statement is crucial for effective model application. For example, 'How can we reduce user friction in our onboarding flow?' is better than 'Make the app better'."),
  steps: z.array(z.string()).optional().describe("A sequential, logical breakdown of how the mental model is applied. Each step should be a clear action or point of analysis, demonstrating the model's framework."),
  reasoning: z.string().optional().describe("The core logic behind the analysis. Explain *why* this model is appropriate for this problem and *how* the steps connect to the model's principles. This is crucial for evaluating the application's quality."),
  conclusion: z.string().optional().describe("The final, actionable insight or decision. It should be a direct synthesis of the preceding steps and reasoning.")
});

// Type exports for TypeScript
export type MentalModelData = z.infer<typeof MentalModelSchema>;