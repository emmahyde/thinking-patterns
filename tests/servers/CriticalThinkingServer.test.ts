import { describe, it, expect } from '@jest/globals';
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
        potentialIssues: ['Issue 1'],
        edgeCases: ['Edge Case 1'],
        invalidAssumptions: ['Assumption 1'],
        alternativeApproaches: ['Approach 1'],
      };

      const response = server.run(validInput);
      expect(response.isError).toBeFalsy();
      expect(response.content).toBeDefined();
    });
  });
}); 