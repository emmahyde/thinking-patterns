import { CriticalThinkingServer } from '../../src/servers/CriticalThinkingServer.js';
import { CriticalThinking } from '../../src/schemas/index.js';

describe('CriticalThinkingServer', () => {
  let server: CriticalThinkingServer;

  beforeEach(() => {
    server = new CriticalThinkingServer();
  });

  describe('run method', () => {
    it('should successfully process a valid input', () => {
      const validInput: CriticalThinking = {
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

      const response = server.run(validInput);
      expect(response.isError).toBeFalsy();
      expect(response.content).toBeDefined();
    });
  });
}); 