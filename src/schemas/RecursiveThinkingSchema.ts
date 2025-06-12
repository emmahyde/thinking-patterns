import { z } from 'zod';

/**
 * Recursive Thinking Schema
 * 
 * Defines the structure for recursive problem-solving and algorithmic thinking.
 * Includes base cases, recursive cases, complexity analysis, optimization
 * strategies, and iterative alternatives for comprehensive recursive analysis.
 */

// Enhanced Recursive Thinking Schema with complex structural information
export const BaseCaseSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the base case."),
  condition: z.string().describe("The condition that defines when this base case applies."),
  solution: z.string().describe("The direct solution for this base case."),
  complexity: z.string().optional().describe("Time/space complexity of solving this base case."),
  examples: z.array(z.string()).optional().describe("Concrete examples of inputs that trigger this base case.")
});

export const RecursiveCaseSchema = z.object({
  id: z.string().optional().describe("A unique identifier for the recursive case."),
  condition: z.string().describe("The condition that defines when this recursive case applies."),
  decomposition: z.string().describe("How the problem is broken down into smaller subproblems."),
  recombination: z.string().describe("How the solutions to subproblems are combined."),
  reductionFactor: z.string().optional().describe("How much the problem size is reduced in each recursive call."),
  examples: z.array(z.string()).optional().describe("Concrete examples of inputs that trigger this recursive case.")
});

export const ComplexityAnalysisSchema = z.object({
  timeComplexity: z.string().describe("The time complexity of the recursive solution (e.g., 'O(n)', 'O(2^n)')."),
  spaceComplexity: z.string().describe("The space complexity including call stack (e.g., 'O(n)', 'O(log n)')."),
  maxStackDepth: z.string().optional().describe("The maximum depth of the recursion stack."),
  worstCaseInput: z.string().optional().describe("Description of input that leads to worst-case performance."),
  bestCaseInput: z.string().optional().describe("Description of input that leads to best-case performance.")
});

export const OptimizationSchema = z.object({
  technique: z.string().describe("The optimization technique (e.g., 'memoization', 'tail recursion')."),
  description: z.string().describe("Description of how the optimization works."),
  complexityImprovement: z.string().optional().describe("How the optimization improves complexity."),
  tradeoffs: z.array(z.string()).optional().describe("Trade-offs introduced by this optimization."),
  implementation: z.string().optional().describe("Implementation details or pseudocode for the optimization.")
});

export const IterativeAlternativeSchema = z.object({
  approach: z.string().describe("The iterative approach (e.g., 'bottom-up dynamic programming', 'stack-based iteration')."),
  description: z.string().describe("Detailed description of the iterative solution."),
  advantages: z.array(z.string()).describe("Advantages of the iterative approach over recursion."),
  disadvantages: z.array(z.string()).describe("Disadvantages of the iterative approach."),
  complexity: ComplexityAnalysisSchema.optional().describe("Complexity analysis of the iterative solution."),
  implementation: z.string().optional().describe("Pseudocode or implementation details.")
});

export const RecursiveThinkingSchema = z.object({
  problem: z.string().describe("A clear and comprehensive description of the problem to be solved recursively."),
  problemId: z.string().optional().describe("A unique identifier for this recursive problem analysis."),
  domain: z.string().optional().describe("The domain or field this problem belongs to (e.g., 'algorithms', 'data structures')."),
  
  // Core recursive structure
  baseCases: z.array(BaseCaseSchema).describe("The base cases that terminate the recursion."),
  recursiveCases: z.array(RecursiveCaseSchema).describe("The recursive cases that break down the problem."),
  terminationConditions: z.array(z.string()).describe("All conditions under which the recursion will terminate."),
  
  // Analysis and optimization
  complexityAnalysis: ComplexityAnalysisSchema.optional().describe("Detailed complexity analysis of the recursive solution."),
  optimizations: z.array(OptimizationSchema).optional().describe("Possible optimizations for the recursive solution."),
  iterativeAlternatives: z.array(IterativeAlternativeSchema).optional().describe("Alternative iterative solutions."),
  
  // Implementation considerations
  stackOverflowRisk: z.enum(["low", "medium", "high"]).optional().describe("Risk of stack overflow for typical inputs."),
  inputSizeLimit: z.string().optional().describe("Practical limit on input size before stack overflow."),
  tailRecursionOptimizable: z.boolean().optional().describe("Whether the recursion can be optimized with tail recursion."),
  
  // Validation and testing
  invariants: z.array(z.string()).optional().describe("Properties that remain true throughout the recursive calls."),
  testCases: z.array(z.object({
    input: z.string().describe("Description of the test input."),
    expectedOutput: z.string().describe("Expected output for this input."),
    reasoning: z.string().optional().describe("Why this test case is important.")
  })).optional().describe("Key test cases for validating the recursive solution."),
  
  // Meta-analysis
  recursionPattern: z.enum(["linear", "binary", "tree", "mutual", "indirect", "nested"]).optional().describe("The pattern of recursion used."),
  similarProblems: z.array(z.string()).optional().describe("Other problems that use similar recursive patterns."),
  learningObjectives: z.array(z.string()).optional().describe("What can be learned from this recursive analysis."),
  commonMistakes: z.array(z.string()).optional().describe("Common mistakes when implementing this recursive solution.")
});

// Type exports for TypeScript
export type RecursiveThinkingData = z.infer<typeof RecursiveThinkingSchema>;
export type BaseCaseData = z.infer<typeof BaseCaseSchema>;
export type RecursiveCaseData = z.infer<typeof RecursiveCaseSchema>;
export type ComplexityAnalysisData = z.infer<typeof ComplexityAnalysisSchema>;
export type OptimizationData = z.infer<typeof OptimizationSchema>;
export type IterativeAlternativeData = z.infer<typeof IterativeAlternativeSchema>; 