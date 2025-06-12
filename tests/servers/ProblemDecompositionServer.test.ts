import { describe, it, expect } from '@jest/globals';
import { ProblemDecompositionServer } from '../../src/servers/ProblemDecompositionServer.js';
import { ProblemDecomposition } from '../../src/schemas/index.js';

describe('ProblemDecompositionServer', () => {
  let server: ProblemDecompositionServer;

  beforeEach(() => {
    server = new ProblemDecompositionServer();
  });

  describe('run method', () => {
    it('should successfully process a valid input', () => {
      const validInput: ProblemDecomposition = {
        problem: 'Test Problem',
        decomposition: [{
          id: 'sub-1',
          description: 'Subproblem 1 description',
          dependencies: [],
        }]
      };

      const response = server.run(validInput);
      expect(response.isError).toBeFalsy();
      expect(response.content).toBeDefined();
    });
  });
}); 