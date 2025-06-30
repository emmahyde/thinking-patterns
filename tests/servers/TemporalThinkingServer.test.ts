/**
 * Tests for TemporalThinkingServer
 * Tests temporal reasoning, state machine modeling, and analysis metrics
 */

import { TemporalThinkingServer } from '../../src/servers/TemporalThinkingServer.js';
import { TemporalThinkingData } from '../../src/schemas/index.js';

describe('TemporalThinkingServer', () => {
  let server: TemporalThinkingServer;

  beforeEach(() => {
    server = new TemporalThinkingServer();
  });

  describe('process', () => {
    it('should successfully process a valid state-machine input', () => {
      const validInput: TemporalThinkingData = {
        context: 'Order Processing Workflow',
        initialState: 'Pending',
        states: [
          { name: 'Pending' },
          { name: 'Processing' },
          { name: 'Shipped' },
          { name: 'Delivered', properties: { isFinal: true } },
        ],
        events: [
          { name: 'Confirm Order' },
          { name: 'Ship Order' },
          { name: 'Deliver Order' }
        ],
        transitions: [
          { from: 'Pending', to: 'Processing', event: 'Confirm Order' },
          { from: 'Processing', to: 'Shipped', event: 'Ship Order' },
          { from: 'Shipped', to: 'Delivered', event: 'Deliver Order' }
        ],
        finalStates: ['Delivered']
      };

      const result = server.process(validInput);

      expect(result.status).toBe('success');
      expect(result.context).toBe('Order Processing Workflow');
      expect(result.stateCount).toBe(4);
      expect(result.eventCount).toBe(3);
      expect(result.transitionCount).toBe(3);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle a minimal temporal model', () => {
      const minimalInput: TemporalThinkingData = {
        context: 'Simple Toggle',
        initialState: 'Off',
        states: [{ name: 'Off' }, { name: 'On' }],
        events: [{ name: 'Toggle' }],
        transitions: [{ from: 'Off', to: 'On', event: 'Toggle' }],
        finalStates: ['On']
      };

      const result = server.process(minimalInput);

      expect(result.status).toBe('success');
      expect(result.stateCount).toBe(2);
      expect(result.eventCount).toBe(1);
      expect(result.transitionCount).toBe(1);
    });

    it('should calculate counts correctly', () => {
      const input: TemporalThinkingData = {
        context: 'Traffic Light',
        initialState: 'Red',
        states: [
          { name: 'Red' },
          { name: 'Green' },
          { name: 'Yellow' }
        ],
        events: [
          { name: 'Timer' }
        ],
        transitions: [
          { from: 'Red', to: 'Green', event: 'Timer' },
          { from: 'Green', to: 'Yellow', event: 'Timer' },
          { from: 'Yellow', to: 'Red', event: 'Timer' }
        ],
        finalStates: []
      };

      const result = server.process(input);
      expect(result.stateCount).toBe(3);
      expect(result.transitionCount).toBe(3);
      expect(result.eventCount).toBe(1);
    });
  });

  describe('edge cases and error handling', () => {
    it('should throw validation error for missing required fields', () => {
      const invalidInput = {
        // Missing initialState and transitions
        context: 'Invalid Model',
        states: [{ name: 'OnlyState' }],
        events: [],
      } as unknown as TemporalThinkingData;

      expect(() => server.process(invalidInput)).toThrow();
    });

    it('should handle null input', () => {
      expect(() => server.process(null as any)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => server.process(undefined as any)).toThrow();
    });

    it('should handle empty object input', () => {
      expect(() => server.process({} as any)).toThrow();
    });
  });

  describe('testSequenceDiagram', () => {
    it('should generate a sequence diagram', () => {
      const server = new TemporalThinkingServer();

      const input = {
        context: "User authentication flow for a web application",
        domain: "web authentication",
        purpose: "Model the complete user login process",
        initialState: "logged_out",
        states: [
          {
            name: "logged_out",
            description: "User is not authenticated"
          },
          {
            name: "entering_credentials",
            description: "User is filling login form"
          },
          {
            name: "authenticating",
            description: "System is validating credentials"
          },
          {
            name: "logged_in",
            description: "User is successfully authenticated"
          },
          {
            name: "authentication_failed",
            description: "Authentication failed, showing error"
          }
        ],
        events: [
          {
            name: "click_login",
            description: "User clicks the login button"
          },
          {
            name: "submit_credentials",
            description: "User submits username and password"
          },
          {
            name: "credentials_valid",
            description: "System validates credentials successfully"
          },
          {
            name: "credentials_invalid",
            description: "System rejects credentials"
          },
          {
            name: "logout",
            description: "User logs out"
          }
        ],
        transitions: [
          {
            from: "logged_out",
            to: "entering_credentials",
            event: "click_login",
            action: "show_login_form"
          },
          {
            from: "entering_credentials",
            to: "authenticating",
            event: "submit_credentials",
            action: "validate_credentials"
          },
          {
            from: "authenticating",
            to: "logged_in",
            event: "credentials_valid",
            action: "create_session"
          },
          {
            from: "authenticating",
            to: "authentication_failed",
            event: "credentials_invalid",
            action: "show_error"
          },
          {
            from: "authentication_failed",
            to: "entering_credentials",
            event: "click_login",
            action: "clear_error"
          },
          {
            from: "logged_in",
            to: "logged_out",
            event: "logout",
            action: "destroy_session"
          }
        ],
        finalStates: ["logged_in"],
        generateSequenceDiagram: true
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.sequenceDiagram).toBeDefined();
      expect(result.sequenceDiagram?.mermaidSyntax).toBeDefined();
      expect(result.sequenceDiagram?.mermaidSyntax).toContain('sequenceDiagram');
      expect(result.sequenceDiagram?.mermaidSyntax).toContain('actor');
    });
  });
});
