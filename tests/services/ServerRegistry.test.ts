import { ServerRegistry, ThinkingPatternServer, ServerResponse } from '../../src/services/ServerRegistry.js';

// Mock server for testing
class MockServer implements ThinkingPatternServer {
  constructor(private shouldError: boolean = false) { }

  process(input: unknown): ServerResponse {
    if (this.shouldError) {
      throw new Error('Mock server error');
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ processed: true, input }) }],
      data: { processed: true, input }
    };
  }
}

describe('ServerRegistry', () => {
  let registry: ServerRegistry;

  beforeEach(() => {
    registry = new ServerRegistry();
  });

  describe('initialization', () => {
    it('should initialize with default servers', () => {
      const availableServers = registry.getAvailableServers();

      // Original servers
      expect(availableServers).toContain('scientific_method');
      expect(availableServers).toContain('mental_model');
      expect(availableServers).toContain('debugging_approach');
      expect(availableServers).toContain('stochastic_algorithm');
      expect(availableServers).toContain('sequential_thinking');

      // Newly integrated servers
      expect(availableServers).toContain('decision_framework');
      expect(availableServers).toContain('collaborative_reasoning');
      expect(availableServers).toContain('metacognitive_monitoring');
      expect(availableServers).toContain('structured_argumentation');
      expect(availableServers).toContain('visual_reasoning');
    });

    it('should have correct number of default servers', () => {
      const stats = registry.getServerStats();
      expect(stats.totalServers).toBe(10);
    });
  });

  describe('server management', () => {
    it('should check if server exists', () => {
      expect(registry.hasServer('scientific_method')).toBe(true);
      expect(registry.hasServer('decision_framework')).toBe(true);
      expect(registry.hasServer('collaborative_reasoning')).toBe(true);
      expect(registry.hasServer('metacognitive_monitoring')).toBe(true);
      expect(registry.hasServer('structured_argumentation')).toBe(true);
      expect(registry.hasServer('visual_reasoning')).toBe(true);
      expect(registry.hasServer('nonexistent')).toBe(false);
    });

    it('should be case insensitive for server names', () => {
      expect(registry.hasServer('SCIENTIFIC_METHOD')).toBe(true);
      expect(registry.hasServer('Scientific_Method')).toBe(true);
      expect(registry.hasServer('scientific_method')).toBe(true);

      // Test case insensitivity for new servers
      expect(registry.hasServer('DECISION_FRAMEWORK')).toBe(true);
      expect(registry.hasServer('Collaborative_Reasoning')).toBe(true);
      expect(registry.hasServer('METACOGNITIVE_MONITORING')).toBe(true);
      expect(registry.hasServer('structured_ARGUMENTATION')).toBe(true);
      expect(registry.hasServer('Visual_Reasoning')).toBe(true);
    });

    it('should retrieve all newly integrated servers', () => {
      const newServers = [
        'decision_framework',
        'collaborative_reasoning',
        'metacognitive_monitoring',
        'structured_argumentation',
        'visual_reasoning'
      ];

      newServers.forEach(serverName => {
        const server = registry.getServer(serverName);
        expect(server).toBeDefined();
        expect(typeof server?.process).toBe('function');
      });
    });

    it('should get server instance', () => {
      const server = registry.getServer('scientific_method');
      expect(server).toBeDefined();
      expect(typeof server?.process).toBe('function');
    });

    it('should return undefined for non-existent server', () => {
      const server = registry.getServer('nonexistent');
      expect(server).toBeUndefined();
    });

    it('should register custom server', () => {
      const mockServer = new MockServer();
      registry.registerCustomServer('custom', mockServer);

      expect(registry.hasServer('custom')).toBe(true);
      expect(registry.getAvailableServers()).toContain('custom');
    });

    it('should unregister server', () => {
      const mockServer = new MockServer();
      registry.registerCustomServer('temporary', mockServer);

      expect(registry.hasServer('temporary')).toBe(true);

      const unregistered = registry.unregisterServer('temporary');
      expect(unregistered).toBe(true);
      expect(registry.hasServer('temporary')).toBe(false);
    });

    it('should return false when unregistering non-existent server', () => {
      const unregistered = registry.unregisterServer('nonexistent');
      expect(unregistered).toBe(false);
    });
  });

  describe('request processing', () => {
    it('should process valid request to existing server', () => {
      const input = {
        stage: 'observation',
        observation: 'Test observation',
        inquiryId: 'test-001',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = registry.processRequest('scientific_method', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should handle request to non-existent server', () => {
      const result = registry.processRequest('nonexistent', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Server \'nonexistent\' not found');
    });

    it('should handle server processing errors', () => {
      const errorServer = new MockServer(true);
      registry.registerCustomServer('errorserver', errorServer);

      const result = registry.processRequest('errorserver', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error processing request');
    });

    it('should process request with custom server', () => {
      const mockServer = new MockServer();
      registry.registerCustomServer('mockserver', mockServer);

      const input = { test: 'data' };
      const result = registry.processRequest('mockserver', input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.processed).toBe(true);
      expect(result.data?.input).toEqual(input);
    });
  });

  describe('server statistics', () => {
    it('should provide correct server statistics', () => {
      const stats = registry.getServerStats();

      expect(stats.totalServers).toBe(10);
      expect(Array.isArray(stats.availableServers)).toBe(true);
      expect(stats.serverTypes).toBeDefined();

      // Original server categories
      expect(stats.serverTypes.scientific).toContain('scientific_method');
      expect(stats.serverTypes.cognitive).toContain('mental_model');
      expect(stats.serverTypes.cognitive).toContain('sequential_thinking');
      expect(stats.serverTypes.cognitive).toContain('metacognitive_monitoring');
      expect(stats.serverTypes.technical).toContain('debugging_approach');
      expect(stats.serverTypes.probabilistic).toContain('stochastic_algorithm');

      // New server categories
      expect(stats.serverTypes.reasoning).toContain('collaborative_reasoning');
      expect(stats.serverTypes.reasoning).toContain('structured_argumentation');
      expect(stats.serverTypes.reasoning).toContain('visual_reasoning');
      expect(stats.serverTypes.decision).toContain('decision_framework');
    });

    it('should update statistics when servers are added', () => {
      const initialStats = registry.getServerStats();
      const initialCount = initialStats.totalServers;

      registry.registerCustomServer('newserver', new MockServer());

      const updatedStats = registry.getServerStats();
      expect(updatedStats.totalServers).toBe(initialCount + 1);
      expect(updatedStats.availableServers).toContain('newserver');
    });

    it('should update statistics when servers are removed', () => {
      registry.registerCustomServer('tempserver', new MockServer());
      const statsWithTemp = registry.getServerStats();
      const countWithTemp = statsWithTemp.totalServers;

      registry.unregisterServer('tempserver');

      const statsWithoutTemp = registry.getServerStats();
      expect(statsWithoutTemp.totalServers).toBe(countWithTemp - 1);
      expect(statsWithoutTemp.availableServers).not.toContain('tempserver');
    });
  });

  describe('integration with actual servers', () => {
    it('should process mental model request', () => {
      const input = {
        modelName: 'Test Model',
        problem: 'Test problem',
        steps: ['Step 1', 'Step 2'],
        reasoning: 'Test reasoning',
        conclusion: 'Test conclusion'
      };

      const result = registry.processRequest('mental_model', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // Parse the JSON response and check the data
      const parsedData = JSON.parse(result.content[0].text);
      expect(parsedData.modelName).toBe('Test Model');
    });

    it('should process debugging approach request', () => {
      const input = {
        approachName: 'Test Approach',
        issue: 'Test issue',
        steps: ['Debug step 1', 'Debug step 2'],
        findings: 'Test findings',
        resolution: 'Test resolution'
      };

      const result = registry.processRequest('debugging_approach', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // Parse the JSON response and check the data
      const parsedData = JSON.parse(result.content[0].text);
      expect(parsedData.approachName).toBe('Test Approach');
    });

    it('should process stochastic algorithm request', () => {
      const input = {
        algorithm: 'mcts',
        problem: 'Test optimization problem',
        parameters: {
          iterations: 1000,
          explorationConstant: 1.414
        }
      };

      const result = registry.processRequest('stochastic_algorithm', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // Parse the JSON response and check the data
      const parsedData = JSON.parse(result.content[0].text);
      expect(parsedData.algorithm).toBe('mcts');
    });

    it('should process decision framework request', () => {
      const input = {
        decisionStatement: 'Choose the best project approach',
        decisionId: 'project-001',
        analysisType: 'multi-criteria',
        stage: 'options',
        iteration: 1,
        nextStageNeeded: true,
        options: [
          { name: 'Option A', description: 'First approach', id: 'opt-1' },
          { name: 'Option B', description: 'Second approach', id: 'opt-2' }
        ]
      };

      const result = registry.processRequest('decision_framework', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should process collaborative reasoning request', () => {
      const input = {
        topic: 'Software Architecture Discussion',
        sessionId: 'session-001',
        stage: 'ideation',
        activePersonaId: 'persona-1',
        iteration: 1,
        nextContributionNeeded: true,
        personas: [
          {
            id: 'persona-1',
            name: 'Tech Lead',
            expertise: ['architecture', 'scalability'],
            background: 'Senior software engineer with 10+ years experience',
            perspective: 'technical',
            biases: ['optimization'],
            communication: { style: 'analytical', tone: 'professional' }
          }
        ],
        contributions: [
          {
            personaId: 'persona-1',
            type: 'suggestion',
            content: 'We should consider microservices architecture',
            confidence: 0.8
          }
        ]
      };

      const result = registry.processRequest('collaborative_reasoning', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should process metacognitive monitoring request', () => {
      const input = {
        task: 'Complex problem analysis',
        monitoringId: 'monitor-001',
        stage: 'knowledge-assessment',
        iteration: 1,
        overallConfidence: 0.8,
        nextAssessmentNeeded: true,
        uncertaintyAreas: ['data quality', 'model assumptions'],
        recommendedApproach: 'systematic'
      };

      const result = registry.processRequest('metacognitive_monitoring', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should process structured argumentation request', () => {
      const input = {
        claim: 'AI will significantly impact software development',
        argumentId: 'arg-001',
        argumentType: 'thesis',
        confidence: 0.9,
        nextArgumentNeeded: true,
        premises: [
          'AI tools are becoming more sophisticated',
          'Developer productivity is increasing with AI assistance'
        ],
        conclusion: 'AI will transform how software is built'
      };

      const result = registry.processRequest('structured_argumentation', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should process visual reasoning request', () => {
      const input = {
        diagramId: 'diagram-001',
        diagramType: 'flowchart',
        operation: 'create',
        iteration: 1,
        nextOperationNeeded: true,
        elements: [
          {
            id: 'start',
            type: 'node',
            label: 'Start Process',
            properties: { shape: 'oval', color: 'green' }
          },
          {
            id: 'decision',
            type: 'node',
            label: 'Make Decision',
            properties: { shape: 'diamond', color: 'yellow' }
          }
        ]
      };

      const result = registry.processRequest('visual_reasoning', input);

      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should handle invalid input gracefully', () => {
      const result = registry.processRequest('mental_model', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });
  });

  describe('edge cases', () => {
    it('should handle null input', () => {
      const result = registry.processRequest('mental_model', null);
      expect(result.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const result = registry.processRequest('mental_model', undefined);
      expect(result.isError).toBe(true);
    });

    it('should handle empty string server name', () => {
      const result = registry.processRequest('', {});
      expect(result.isError).toBe(true);
    });

    it('should handle whitespace-only server name', () => {
      const result = registry.processRequest('   ', {});
      expect(result.isError).toBe(true);
    });
  });
});
