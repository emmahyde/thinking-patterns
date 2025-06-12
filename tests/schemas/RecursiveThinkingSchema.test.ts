import { describe, it, expect } from '@jest/globals';
import { RecursiveThinkingSchema } from '../../src/schemas/RecursiveThinkingSchema.js';

describe('RecursiveThinkingSchema', () => {
  it('should validate a correct object', () => {
    const data = {
      problem: 'Test Problem',
      baseCases: ['Base Case 1'],
      recursiveCases: ['Recursive Step'],
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