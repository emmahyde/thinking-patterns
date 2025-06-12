/**
 * Tests for CriticalThinkingServer
 * Tests systematic critical analysis of code, designs, requirements, or concepts
 */

import { CriticalThinkingServer } from '../../src/servers/CriticalThinkingServer.js';
import { CriticalThinkingData } from '../../src/schemas/index.js';

describe('CriticalThinkingServer', () => {
  let server: CriticalThinkingServer;

  beforeEach(() => {
    server = new CriticalThinkingServer();
  });

  describe('process', () => {
    it('should process valid critical thinking data correctly', () => {
      const validInput: CriticalThinkingData = {
        subject: 'New API Design for User Authentication',
        potentialIssues: [
          {
            description: 'Password storage without proper hashing',
            severity: 'high',
            category: 'security',
            likelihood: 0.8
          },
          {
            description: 'No rate limiting on login attempts',
            severity: 'medium',
            category: 'security',
            likelihood: 0.6
          }
        ],
        edgeCases: [
          {
            scenario: 'User attempts login with expired session',
            conditions: ['Session timeout reached', 'User still has valid cookie'],
            testability: 'easy',
            businessImpact: 'medium'
          },
          {
            scenario: 'Concurrent login attempts from different devices',
            conditions: ['Multiple active sessions', 'Different IP addresses'],
            testability: 'moderate',
            businessImpact: 'low'
          }
        ],
        invalidAssumptions: [
          {
            statement: 'Users will always log out properly',
            validity: 'invalid'
          },
          {
            statement: 'Network connections are always reliable',
            validity: 'questionable'
          }
        ],
        alternativeApproaches: [
          {
            name: 'OAuth 2.0 Integration',
            description: 'Use third-party OAuth providers for authentication',
            advantages: ['Reduced security burden', 'Better user experience', 'Industry standard'],
            disadvantages: ['External dependency', 'Less control over user data'],
            complexity: 'medium',
            feasibility: 0.9
          },
          {
            name: 'Multi-factor Authentication',
            description: 'Implement MFA for enhanced security',
            advantages: ['Higher security', 'Compliance benefits'],
            disadvantages: ['User friction', 'Implementation complexity'],
            complexity: 'high',
            feasibility: 0.7
          }
        ]
      };

      const result = server.process(validInput);

      expect(result.subject).toBe('New API Design for User Authentication');
      expect(result.potentialIssues).toHaveLength(2);
      expect(result.edgeCases).toHaveLength(2);
      expect(result.invalidAssumptions).toHaveLength(2);
      expect(result.alternativeApproaches).toHaveLength(2);
      expect(result.status).toBe('success');
      expect(result.issueCount).toBe(2);
      expect(result.edgeCaseCount).toBe(2);
      expect(result.assumptionCount).toBe(2);
      expect(result.alternativeCount).toBe(2);
      expect(result.highSeverityIssues).toBe(1);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle minimal critical thinking data', () => {
      const minimalInput: CriticalThinkingData = {
        subject: 'Simple Code Review',
        potentialIssues: [],
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      };

      const result = server.process(minimalInput);

      expect(result.subject).toBe('Simple Code Review');
      expect(result.issueCount).toBe(0);
      expect(result.edgeCaseCount).toBe(0);
      expect(result.assumptionCount).toBe(0);
      expect(result.alternativeCount).toBe(0);
      expect(result.highSeverityIssues).toBe(0);
      expect(result.status).toBe('success');
    });

    it('should categorize issues by severity', () => {
      const input: CriticalThinkingData = {
        subject: 'Security Analysis',
        potentialIssues: [
          {
            description: 'Critical vulnerability',
            severity: 'high',
            category: 'security',
            likelihood: 0.9
          },
          {
            description: 'Minor performance issue',
            severity: 'low',
            category: 'performance',
            likelihood: 0.3
          },
          {
            description: 'Moderate usability concern',
            severity: 'medium',
            category: 'usability',
            likelihood: 0.5
          }
        ],
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      };

      const result = server.process(input);

      expect(result.highSeverityIssues).toBe(1);
      expect(result.potentialIssues[0].severity).toBe('high');
      expect(result.potentialIssues[1].severity).toBe('low');
      expect(result.potentialIssues[2].severity).toBe('medium');
    });

    it('should handle validation errors gracefully', () => {
      const invalidInput = {
        // Missing required subject field
        potentialIssues: [],
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      } as any;

      const response = server.run(invalidInput);
      expect(response.isError).toBe(true);
    });

    it('should return properly formatted output', () => {
      const input: CriticalThinkingData = {
        subject: 'Test Subject',
        potentialIssues: [],
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      };

      const result = server.process(input);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('issueCount');
      expect(result).toHaveProperty('edgeCaseCount');
      expect(result).toHaveProperty('assumptionCount');
      expect(result).toHaveProperty('alternativeCount');
      expect(result).toHaveProperty('highSeverityIssues');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      expect(() => server.process(null as any)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => server.process(undefined as any)).toThrow();
    });

    it('should handle empty object input', () => {
      expect(() => server.process({} as any)).toThrow();
    });

    it('should handle invalid field types', () => {
      const invalidInput = {
        subject: 123, // Should be string
        potentialIssues: 'not-array', // Should be array
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      };

      expect(() => server.process(invalidInput as any)).toThrow();
    });

    it('should handle very long subject strings', () => {
      const longSubject = 'A'.repeat(10000);
      const input: CriticalThinkingData = {
        subject: longSubject,
        potentialIssues: [],
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      };

      const result = server.process(input);
      expect(result.subject).toBe(longSubject);
      expect(result.status).toBe('success');
    });

    it('should handle large arrays of issues and alternatives', () => {
      const manyIssues = Array.from({ length: 50 }, (_, i) => ({
        description: `Issue ${i + 1}`,
        severity: 'medium' as const,
        category: 'logic' as const,
        likelihood: 0.5
      }));

      const input: CriticalThinkingData = {
        subject: 'Large Analysis',
        potentialIssues: manyIssues,
        edgeCases: [],
        invalidAssumptions: [],
        alternativeApproaches: []
      };

      const result = server.process(input);
      expect(result.issueCount).toBe(50);
      expect(result.potentialIssues).toHaveLength(50);
    });
  });
}); 