import { describe, it, expect } from '@jest/globals';
import { CriticalThinkingSchema } from '../../src/schemas/CriticalThinkingSchema.js';

describe('CriticalThinkingSchema', () => {
  it('should validate a correct object', () => {
    const data = {
      subject: 'Test Subject',
      potentialIssues: ['Issue 1'],
      edgeCases: ['Edge Case 1'],
      invalidAssumptions: ['Assumption 1'],
      alternativeApproaches: ['Approach 1'],
    };
    const result = CriticalThinkingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should invalidate an object with missing fields', () => {
    const data = {
      subject: 'Test Subject',
    };
    const result = CriticalThinkingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
}); 