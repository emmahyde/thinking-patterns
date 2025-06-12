/**
 * Tests for RecursiveThinkingServer
 * Tests recursive problem-solving and algorithmic thinking
 */

import { RecursiveThinkingServer } from '../../src/servers/RecursiveThinkingServer.js';
import { RecursiveThinkingData } from '../../src/schemas/index.js';

describe('RecursiveThinkingServer', () => {
  let server: RecursiveThinkingServer;

  beforeEach(() => {
    server = new RecursiveThinkingServer();
  });

  describe('process', () => {
    it('should process valid recursive thinking data correctly', () => {
      const validInput: RecursiveThinkingData = {
        problem: 'Calculate factorial of a number',
        baseCases: [
          {
            condition: 'n <= 1',
            solution: 'return 1',
            complexity: 'O(1)',
            examples: ['factorial(0) = 1', 'factorial(1) = 1']
          }
        ],
        recursiveCases: [
          {
            condition: 'n > 1',
            decomposition: 'Break down into factorial(n-1)',
            recombination: 'Multiply n by factorial(n-1)',
            reductionFactor: 'Problem size reduced by 1 each call',
            examples: ['factorial(5) = 5 * factorial(4)']
          }
        ],
        terminationConditions: ['n <= 1'],
        complexityAnalysis: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          maxStackDepth: 'n',
          worstCaseInput: 'Large positive integer',
          bestCaseInput: 'n <= 1'
        },
        optimizations: [
          {
            technique: 'memoization',
            description: 'Cache previously computed results to avoid redundant calculations',
            complexityImprovement: 'Reduces time complexity for repeated calls',
            tradeoffs: ['Increases space complexity for caching', 'Memory overhead']
          },
          {
            technique: 'tail-recursion',
            description: 'Convert to tail-recursive form to optimize stack usage',
            complexityImprovement: 'Reduces space complexity in languages with tail-call optimization',
            tradeoffs: ['May be less intuitive to understand']
          }
        ],
        iterativeAlternatives: [
          {
            approach: 'loop-based',
            description: 'Use a simple for loop to calculate factorial',
            advantages: ['No stack overflow risk', 'Better space complexity', 'Easier to understand'],
            disadvantages: ['Less elegant for naturally recursive problems'],
            complexity: {
              timeComplexity: 'O(n)',
              spaceComplexity: 'O(1)'
            }
          }
        ]
      };

      const result = server.process(validInput);

      expect(result.problem).toBe('Calculate factorial of a number');
      expect(result.baseCases).toHaveLength(1);
      expect(result.recursiveCases).toHaveLength(1);
      expect(result.terminationConditions).toHaveLength(1);
      expect(result.iterativeAlternatives).toHaveLength(1);
      expect(result.status).toBe('success');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle minimal recursive thinking data', () => {
      const minimalInput: RecursiveThinkingData = {
        problem: 'Simple recursive problem',
        baseCases: [
          {
            condition: 'base condition',
            solution: 'base solution'
          }
        ],
        recursiveCases: [
          {
            condition: 'recursive condition',
            decomposition: 'break down problem',
            recombination: 'combine results'
          }
        ],
        terminationConditions: ['base condition']
      };

      const result = server.process(minimalInput);

      expect(result.problem).toBe('Simple recursive problem');
      expect(result.baseCases).toHaveLength(1);
      expect(result.recursiveCases).toHaveLength(1);
      expect(result.terminationConditions).toHaveLength(1);
      expect(result.status).toBe('success');
    });

    it('should handle multiple base and recursive cases', () => {
      const input: RecursiveThinkingData = {
        problem: 'Fibonacci sequence calculation',
        baseCases: [
          {
            condition: 'n == 0',
            solution: 'return 0',
            examples: ['fib(0) = 0']
          },
          {
            condition: 'n == 1',
            solution: 'return 1',
            examples: ['fib(1) = 1']
          }
        ],
        recursiveCases: [
          {
            condition: 'n > 1',
            decomposition: 'Break into fib(n-1) and fib(n-2)',
            recombination: 'Add fib(n-1) + fib(n-2)',
            examples: ['fib(5) = fib(4) + fib(3)']
          }
        ],
        terminationConditions: ['n == 0', 'n == 1'],
        complexityAnalysis: {
          timeComplexity: 'O(2^n)',
          spaceComplexity: 'O(n)',
          maxStackDepth: 'n',
          worstCaseInput: 'Large positive integer'
        }
      };

      const result = server.process(input);

      expect(result.baseCases).toHaveLength(2);
      expect(result.recursiveCases).toHaveLength(1);
      expect(result.terminationConditions).toHaveLength(2);
    });

    it('should handle validation errors gracefully', () => {
      const invalidInput = {
        // Missing required problem field
        baseCases: [],
        recursiveCases: [],
        terminationConditions: []
      };

      const result = server.run(invalidInput);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });

    it('should return properly formatted output', () => {
      const input: RecursiveThinkingData = {
        problem: 'Test problem',
        baseCases: [
          {
            condition: 'test condition',
            solution: 'test solution'
          }
        ],
        recursiveCases: [
          {
            condition: 'recursive condition',
            decomposition: 'test decomposition',
            recombination: 'test recombination'
          }
        ],
        terminationConditions: ['test condition']
      };

      const result = server.process(input);

      expect(result).toHaveProperty('problem');
      expect(result).toHaveProperty('baseCases');
      expect(result).toHaveProperty('recursiveCases');
      expect(result).toHaveProperty('terminationConditions');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.baseCases)).toBe(true);
      expect(Array.isArray(result.recursiveCases)).toBe(true);
      expect(Array.isArray(result.terminationConditions)).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      expect(() => server.process(null as any)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => server.process(undefined as any)).toThrow();
    });

    it('should handle empty object input', () => {
      const result = server.run({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });

    it('should handle invalid field types', () => {
      const invalidInput = {
        problem: 123, // Should be string
        baseCases: 'not-array', // Should be array
        recursiveCases: [],
        terminationConditions: []
      };

      expect(() => server.process(invalidInput as any)).toThrow();
    });

    it('should handle empty base cases and recursive cases', () => {
      const input: RecursiveThinkingData = {
        problem: 'Problem with no cases',
        baseCases: [],
        recursiveCases: [],
        terminationConditions: []
      };

      const result = server.process(input);
      expect(result.baseCases).toHaveLength(0);
      expect(result.recursiveCases).toHaveLength(0);
      expect(result.terminationConditions).toHaveLength(0);
      expect(result.status).toBe('success');
    });

    it('should handle complex optimization scenarios', () => {
      const input: RecursiveThinkingData = {
        problem: 'Complex recursive algorithm with many optimizations',
        baseCases: [
          {
            condition: 'input.length <= 1',
            solution: 'return input'
          }
        ],
        recursiveCases: [
          {
            condition: 'input.length > 1',
            decomposition: 'Split input into left and right halves',
            recombination: 'Merge processed left and right results'
          }
        ],
        terminationConditions: ['input.length <= 1'],
        optimizations: Array.from({ length: 5 }, (_, i) => ({
          technique: `optimization-${i + 1}`,
          description: `Description for optimization ${i + 1}`,
          complexityImprovement: `Improvement for optimization ${i + 1}`,
          tradeoffs: [`Tradeoff 1 for optimization ${i + 1}`, `Tradeoff 2 for optimization ${i + 1}`]
        })),
        iterativeAlternatives: Array.from({ length: 3 }, (_, i) => ({
          approach: `iterative-approach-${i + 1}`,
          description: `Description for iterative approach ${i + 1}`,
          advantages: [`Advantage 1 for approach ${i + 1}`, `Advantage 2 for approach ${i + 1}`],
          disadvantages: [`Disadvantage 1 for approach ${i + 1}`],
          complexity: {
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)'
          }
        }))
      };

      const result = server.process(input);
      expect(result.optimizations).toHaveLength(5);
      expect(result.iterativeAlternatives).toHaveLength(3);
      expect(result.status).toBe('success');
    });

    it('should handle detailed complexity analysis', () => {
      const input: RecursiveThinkingData = {
        problem: 'Algorithm with detailed complexity analysis',
        baseCases: [
          {
            condition: 'n <= threshold',
            solution: 'direct_solution(n)'
          }
        ],
        recursiveCases: [
          {
            condition: 'n > threshold',
            decomposition: 'Split problem into two halves',
            recombination: 'Combine results from both halves'
          }
        ],
        terminationConditions: ['n <= threshold'],
        complexityAnalysis: {
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(log n)',
          maxStackDepth: 'log n',
          worstCaseInput: 'Large input requiring maximum recursion depth',
          bestCaseInput: 'Input at or below threshold'
        }
      };

      const result = server.process(input);
      expect(result.complexityAnalysis?.timeComplexity).toBe('O(n log n)');
      expect(result.complexityAnalysis?.spaceComplexity).toBe('O(log n)');
      expect(result.complexityAnalysis?.maxStackDepth).toBe('log n');
    });

    it('should handle very long problem descriptions', () => {
      const longDescription = 'A'.repeat(5000);
      const input: RecursiveThinkingData = {
        problem: longDescription,
        baseCases: [
          {
            condition: 'base condition',
            solution: 'base solution'
          }
        ],
        recursiveCases: [
          {
            condition: 'recursive condition',
            decomposition: longDescription,
            recombination: 'combine results'
          }
        ],
        terminationConditions: ['base condition']
      };

      const result = server.process(input);
      expect(result.problem).toBe(longDescription);
      expect(result.recursiveCases[0].decomposition).toBe(longDescription);
      expect(result.status).toBe('success');
    });

    it('should handle additional optional fields', () => {
      const input: RecursiveThinkingData = {
        problem: 'Problem with all optional fields',
        problemId: 'recursive-001',
        domain: 'algorithms',
        baseCases: [
          {
            id: 'base-1',
            condition: 'n <= 1',
            solution: 'return 1',
            complexity: 'O(1)',
            examples: ['n=0', 'n=1']
          }
        ],
        recursiveCases: [
          {
            id: 'recursive-1',
            condition: 'n > 1',
            decomposition: 'factorial(n-1)',
            recombination: 'n * result',
            reductionFactor: '1',
            examples: ['n=5 -> 5 * factorial(4)']
          }
        ],
        terminationConditions: ['n <= 1'],
        stackOverflowRisk: 'medium',
        inputSizeLimit: '10000',
        tailRecursionOptimizable: true,
        invariants: ['n >= 0', 'result > 0'],
        recursionPattern: 'linear',
        similarProblems: ['power calculation', 'sum of numbers'],
        learningObjectives: ['understand recursion', 'analyze complexity'],
        commonMistakes: ['forgetting base case', 'infinite recursion']
      };

      const result = server.process(input);
      expect(result.problemId).toBe('recursive-001');
      expect(result.domain).toBe('algorithms');
      expect(result.stackOverflowRisk).toBe('medium');
      expect(result.tailRecursionOptimizable).toBe(true);
      expect(result.invariants).toHaveLength(2);
      expect(result.recursionPattern).toBe('linear');
      expect(result.status).toBe('success');
    });
  });
}); 