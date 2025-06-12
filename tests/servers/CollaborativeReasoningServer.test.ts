import { CollaborativeReasoningServer } from '../../src/servers/CollaborativeReasoningServer.js';

describe('CollaborativeReasoningServer', () => {
  let server: CollaborativeReasoningServer;

  beforeEach(() => {
    server = new CollaborativeReasoningServer();
  });

  describe('process', () => {
    it('should process valid collaborative reasoning data correctly', () => {
      const input = {
        topic: 'Should we implement a remote-first work policy?',
        sessionId: 'collab-session-001',
        stage: 'ideation' as const,
        activePersonaId: 'persona-1',
        iteration: 1,
        nextContributionNeeded: true,
        personas: [
          {
            id: 'persona-1',
            name: 'HR Director',
            expertise: ['human resources', 'policy development'],
            background: 'Senior HR professional with 15 years experience',
            perspective: 'Focus on employee wellbeing and organizational culture',
            biases: ['status quo bias', 'availability heuristic'],
            communication: {
              style: 'collaborative',
              tone: 'professional'
            }
          }
        ],
        contributions: [
          {
            personaId: 'persona-1',
            content: 'Remote work can improve work-life balance and reduce commuting stress',
            type: 'observation' as const,
            confidence: 0.8
          }
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.topic).toBe('Should we implement a remote-first work policy?');
      expect(result.sessionId).toBe('collab-session-001');
      expect(result.stage).toBe('ideation');
      expect(result.activePersonaId).toBe('persona-1');
      expect(result.iteration).toBe(1);
      expect(result.nextContributionNeeded).toBe(true);
      expect(result.personaCount).toBe(1);
      expect(result.contributionCount).toBe(1);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle problem-definition stage correctly', () => {
      const input = {
        topic: 'Improving team productivity',
        sessionId: 'collab-session-002',
        stage: 'problem-definition' as const,
        activePersonaId: 'persona-1',
        iteration: 1,
        nextContributionNeeded: true,
        personas: [
          {
            id: 'persona-1',
            name: 'Team Lead',
            expertise: ['leadership'],
            background: 'Team management experience',
            perspective: 'Focus on team performance',
            biases: ['confirmation bias'],
            communication: {
              style: 'collaborative',
              tone: 'supportive'
            }
          }
        ],
        contributions: []
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.stage).toBe('problem-definition');
      expect(result.contributionCount).toBe(0);
      expect(result.hasDisagreements).toBe(false);
      expect(result.hasFinalRecommendation).toBe(false);
    });

    it('should handle multiple personas and contributions', () => {
      const input = {
        topic: 'Technology stack selection',
        sessionId: 'collab-session-003',
        stage: 'critique' as const,
        activePersonaId: 'persona-2',
        iteration: 3,
        nextContributionNeeded: true,
        personas: [
          {
            id: 'persona-1',
            name: 'Senior Developer',
            expertise: ['software development'],
            background: 'Full-stack developer',
            perspective: 'Prioritize maintainability',
            biases: ['confirmation bias'],
            communication: {
              style: 'technical',
              tone: 'analytical'
            }
          },
          {
            id: 'persona-2',
            name: 'DevOps Engineer',
            expertise: ['infrastructure', 'deployment'],
            background: 'Infrastructure specialist',
            perspective: 'Focus on scalability and reliability',
            biases: ['availability heuristic'],
            communication: {
              style: 'direct',
              tone: 'pragmatic'
            }
          }
        ],
        contributions: [
          {
            personaId: 'persona-1',
            content: 'We should use React for the frontend',
            type: 'suggestion' as const,
            confidence: 0.9
          },
          {
            personaId: 'persona-2',
            content: 'Vue.js might be better for this use case',
            type: 'challenge' as const,
            confidence: 0.8
          }
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.stage).toBe('critique');
      expect(result.personaCount).toBe(2);
      expect(result.contributionCount).toBe(2);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      const response = server.run(null);
      expect(response.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const response = server.run(undefined);
      expect(response.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const response = server.run({});
      expect(response.isError).toBe(true);
    });

    it('should handle missing required fields', () => {
      const incompleteInput = {
        topic: 'Test topic'
        // Missing required fields
      };

      const response = server.run(incompleteInput);
      expect(response.isError).toBe(true);
    });
  });

  describe('output formatting', () => {
    it('should return properly formatted JSON content', () => {
      const input = {
        topic: 'Test topic',
        sessionId: 'test-session',
        stage: 'ideation' as const,
        activePersonaId: 'persona-1',
        iteration: 1,
        nextContributionNeeded: true,
        personas: [
          {
            id: 'persona-1',
            name: 'Test Person',
            expertise: ['test'],
            background: 'Test background',
            perspective: 'Test perspective',
            biases: [],
            communication: {
              style: 'test',
              tone: 'test'
            }
          }
        ],
        contributions: []
      };

      const response = server.run(input);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(() => JSON.parse(response.content[0].text)).not.toThrow();

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent.status).toBe('success');
      expect(parsedContent.topic).toBe('Test topic');
      expect(parsedContent.sessionId).toBe('test-session');
      expect(parsedContent.personaCount).toBe(1);
      expect(parsedContent.contributionCount).toBe(0);
      expect(parsedContent.timestamp).toBeDefined();
    });
  });
}); 