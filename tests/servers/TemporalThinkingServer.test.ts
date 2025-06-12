import { describe, it, expect } from '@jest/globals';
import { TemporalThinkingServer } from '../../src/servers/TemporalThinkingServer.js';
import { TemporalThinking } from '../../src/schemas/index.js';

describe('TemporalThinkingServer', () => {
  let server: TemporalThinkingServer;

  beforeEach(() => {
    server = new TemporalThinkingServer();
  });

  describe('run method', () => {
    it('should successfully process a valid input', () => {
      const validInput: TemporalThinking = {
        context: 'Test Context',
        initialState: 'Initial',
        states: [{ name: 'Initial' }],
        events: [{ name: 'Test Event' }],
        transitions: [{ from: 'Initial', to: 'Final', event: 'Test Event' }],
        finalStates: ['Final']
      };

      const response = server.run(validInput);
      expect(response.isError).toBeFalsy();
      expect(response.content).toBeDefined();
    });
  });
}); 