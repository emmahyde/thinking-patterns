import { ProblemDecompositionSchema } from '../../src/schemas/ProblemDecompositionSchema.js';

describe('ProblemDecompositionSchema', () => {
  it('should validate a correct object', () => {
    const data = {
      problem: 'Test Problem',
      decomposition: [{
        id: 'sub-1',
        description: 'Subproblem 1 description',
        dependencies: [],
      }]
    };
    const result = ProblemDecompositionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should invalidate an object with missing fields', () => {
    const data = {
      problem: 'Test Problem',
    };
    const result = ProblemDecompositionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
}); 