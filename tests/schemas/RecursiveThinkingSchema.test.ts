import { describe, it, expect } from 'vitest';
import { RecursiveThinkingSchema } from '../../src/schemas/RecursiveThinkingSchema.js';

describe('RecursiveThinkingSchema', () => {
  it('should validate a correct object', () => {
    const data = {
      problem: 'Test Problem',
      baseCases: [{
        condition: 'n <= 1',
        solution: 'return n'
      }],
      recursiveCases: [{
        condition: 'n > 1',
        decomposition: 'break into smaller subproblems',
        recombination: 'combine results'
      }],
      terminationConditions: ['Termination Condition 1']
    };
    const result = RecursiveThinkingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should invalidate an object with missing fields', () => {
    const data = {
      problem: 'Test Problem',
    };
    const result = RecursiveThinkingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
}); 