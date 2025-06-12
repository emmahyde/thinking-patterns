import { describe, it, expect } from '@jest/globals';
import { RecursiveThinkingServer } from '../../src/servers/RecursiveThinkingServer.js';
import { RecursiveThinking } from '../../src/schemas/index.js';

describe('RecursiveThinkingServer', () => {
  let server: RecursiveThinkingServer;

  beforeEach(() => {
    server = new RecursiveThinkingServer();
  });

  describe('run method', () => {
    it('should successfully process a valid input', () => {
      const validInput: RecursiveThinking = {
        problem: 'Test Problem',
        baseCases: ['Base Case 1'],
        recursiveCases: ['Recursive Step'],
        terminationConditions: ['Termination Condition 1']
      };

      const response = server.run(validInput);
      expect(response.isError).toBeFalsy();
      expect(response.content).toBeDefined();
    });
  });
}); 