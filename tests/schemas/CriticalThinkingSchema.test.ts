import { CriticalThinkingSchema } from '../../src/schemas/CriticalThinkingSchema.js';

describe('CriticalThinkingSchema', () => {
  it('should validate a correct object', () => {
    const data = {
      subject: 'Test Subject',
      potentialIssues: [{
        description: 'Issue 1',
        severity: 'medium',
        category: 'logic',
        likelihood: 0.7
      }],
      edgeCases: [{
        scenario: 'Edge Case 1',
        conditions: ['condition 1'],
        testability: 'easy',
        businessImpact: 'low'
      }],
      invalidAssumptions: [{
        statement: 'Assumption 1',
        validity: 'questionable'
      }],
      alternativeApproaches: [{
        name: 'Approach 1',
        description: 'Alternative approach description',
        advantages: ['advantage 1'],
        disadvantages: ['disadvantage 1'],
        complexity: 'medium',
        feasibility: 0.8
      }],
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