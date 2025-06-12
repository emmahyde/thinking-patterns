import { describe, it, expect } from 'vitest';
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
        baseCases: [{
          condition: 'Base Case 1',
          solution: 'Direct solution for base case'
        }],
        recursiveCases: [{
          condition: 'Recursive condition',
          decomposition: 'Recursive Step',
          recombination: 'Combine subproblem solutions'
        }],
        terminationConditions: ['Termination Condition 1']
      };

      const response = server.run(validInput);
      expect(response.isError).toBeFalsy();
      expect(response.content).toBeDefined();
    });
  });
}); 