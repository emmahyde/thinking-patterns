/**
 * Tests for CollaborativeReasoningSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  CollaborativeReasoningSchema,
  PersonaSchema,
  ContributionSchema,
  DisagreementSchema,
  type CollaborativeReasoningData,
  type PersonaData,
  type ContributionData,
  type DisagreementData
} from '../../src/schemas/CollaborativeReasoningSchema.js';

describe('CollaborativeReasoningSchema', () => {
  describe('PersonaSchema validation', () => {
    it('should validate minimal valid persona data', () => {
      const validPersona = {
        id: "analyst-1",
        name: "Technical Analyst",
        expertise: ["software-architecture", "performance-optimization"],
        background: "10 years in enterprise software development",
        perspective: "Technical feasibility and performance considerations",
        biases: ["solution-oriented", "risk-averse"],
        communication: {
          style: "analytical",
          tone: "formal"
        }
      };

      const result = PersonaSchema.parse(validPersona);

      expect(result).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        expertise: expect.any(Array),
        background: expect.any(String),
        perspective: expect.any(String),
        biases: expect.any(Array),
        communication: expect.objectContaining({
          style: expect.any(String),
          tone: expect.any(String)
        })
      });
      expect(result.expertise).toHaveLength(2);
      expect(result.biases).toHaveLength(2);
    });

    it('should handle personas with empty arrays', () => {
      const validPersona = {
        id: "neutral-observer",
        name: "Neutral Observer",
        expertise: [],
        background: "General knowledge",
        perspective: "Unbiased observation",
        biases: [],
        communication: {
          style: "neutral",
          tone: "objective"
        }
      };

      const result = PersonaSchema.parse(validPersona);

      expect(result.expertise).toEqual([]);
      expect(result.biases).toEqual([]);
    });

    it('should reject invalid persona data', () => {
      expect(() => PersonaSchema.parse({
        // missing required fields
      })).toThrow();

      expect(() => PersonaSchema.parse({
        id: "test",
        name: "Test",
        expertise: "not-array", // should be array
        background: "Test",
        perspective: "Test",
        biases: [],
        communication: {
          style: "test",
          tone: "test"
        }
      })).toThrow();
    });
  });

  describe('ContributionSchema validation', () => {
    it('should validate all contribution types', () => {
      const contributionTypes = ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"];
      
      contributionTypes.forEach(type => {
        const validContribution = {
          personaId: "test-persona",
          content: `This is a ${type} contribution`,
          type: type as any,
          confidence: 0.8
        };

        const result = ContributionSchema.parse(validContribution);
        expect(result.type).toBe(type);
        expect(result.confidence).toBe(0.8);
      });
    });

    it('should validate contribution with optional fields', () => {
      const validContribution = {
        personaId: "analyst-1",
        content: "This solution addresses the core architectural concerns",
        type: "insight",
        confidence: 0.9,
        referenceIds: ["contrib-1", "contrib-3"]
      };

      const result = ContributionSchema.parse(validContribution);

      expect(result.referenceIds).toEqual(["contrib-1", "contrib-3"]);
      expect(result.referenceIds).toHaveLength(2);
    });

    it('should reject invalid confidence values', () => {
      expect(() => ContributionSchema.parse({
        personaId: "test",
        content: "Test content",
        type: "observation",
        confidence: 1.5 // invalid: > 1
      })).toThrow();

      expect(() => ContributionSchema.parse({
        personaId: "test",
        content: "Test content",
        type: "observation",
        confidence: -0.1 // invalid: < 0
      })).toThrow();
    });

    it('should reject invalid contribution types', () => {
      expect(() => ContributionSchema.parse({
        personaId: "test",
        content: "Test content",
        type: "invalid-type",
        confidence: 0.5
      })).toThrow();
    });
  });

  describe('DisagreementSchema validation', () => {
    it('should validate disagreement with positions', () => {
      const validDisagreement = {
        topic: "Choice of database technology",
        positions: [
          {
            personaId: "architect-1",
            position: "Use PostgreSQL for reliability",
            arguments: ["ACID compliance", "Mature ecosystem", "Better for complex queries"]
          },
          {
            personaId: "performance-expert",
            position: "Use MongoDB for scalability",
            arguments: ["Better horizontal scaling", "Flexible schema", "Lower latency for reads"]
          }
        ]
      };

      const result = DisagreementSchema.parse(validDisagreement);

      expect(result.positions).toHaveLength(2);
      expect(result.positions[0].arguments).toHaveLength(3);
      expect(result.resolution).toBeUndefined();
    });

    it('should validate disagreement with resolution', () => {
      const validDisagreement = {
        topic: "API design approach",
        positions: [
          {
            personaId: "api-designer",
            position: "Use GraphQL",
            arguments: ["Single endpoint", "Flexible queries"]
          }
        ],
        resolution: {
          type: "consensus",
          description: "Team agreed on GraphQL after discussing trade-offs"
        }
      };

      const result = DisagreementSchema.parse(validDisagreement);

      expect(result.resolution).toBeDefined();
      expect(result.resolution?.type).toBe("consensus");
    });

    it('should validate all resolution types', () => {
      const resolutionTypes = ["consensus", "compromise", "integration", "tabled"];
      
      resolutionTypes.forEach(type => {
        const disagreement = {
          topic: "Test topic",
          positions: [{
            personaId: "test",
            position: "Test position",
            arguments: ["Test argument"]
          }],
          resolution: {
            type: type as any,
            description: `${type} resolution`
          }
        };

        const result = DisagreementSchema.parse(disagreement);
        expect(result.resolution?.type).toBe(type);
      });
    });
  });

  describe('CollaborativeReasoningSchema validation', () => {
    it('should validate minimal valid collaborative reasoning data', () => {
      const validData = {
        topic: "System architecture redesign",
        personas: [
          {
            id: "architect-1",
            name: "Senior Architect",
            expertise: ["distributed-systems"],
            background: "15 years experience",
            perspective: "Scalability focus",
            biases: ["performance-oriented"],
            communication: {
              style: "technical",
              tone: "direct"
            }
          }
        ],
        contributions: [
          {
            personaId: "architect-1",
            content: "We need to consider microservices architecture",
            type: "suggestion",
            confidence: 0.8
          }
        ],
        stage: "problem-definition",
        activePersonaId: "architect-1",
        sessionId: "session-123",
        iteration: 1,
        nextContributionNeeded: true
      };

      const result = CollaborativeReasoningSchema.parse(validData);

      expect(result).toMatchObject({
        topic: expect.any(String),
        personas: expect.any(Array),
        contributions: expect.any(Array),
        stage: expect.any(String),
        activePersonaId: expect.any(String),
        sessionId: expect.any(String),
        iteration: expect.any(Number),
        nextContributionNeeded: expect.any(Boolean)
      });
      expect(result.personas).toHaveLength(1);
      expect(result.contributions).toHaveLength(1);
    });

    it('should validate all stage types', () => {
      const stages = ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"];
      
      stages.forEach(stage => {
        const data = {
          topic: "Test topic",
          personas: [{
            id: "test-persona",
            name: "Test",
            expertise: ["test"],
            background: "Test background",
            perspective: "Test perspective",
            biases: ["test-bias"],
            communication: { style: "test", tone: "test" }
          }],
          contributions: [{
            personaId: "test-persona",
            content: "Test content",
            type: "observation",
            confidence: 0.5
          }],
          stage: stage as any,
          activePersonaId: "test-persona",
          sessionId: "test-session",
          iteration: 1,
          nextContributionNeeded: false
        };

        const result = CollaborativeReasoningSchema.parse(data);
        expect(result.stage).toBe(stage);
      });
    });

    it('should validate data with all optional fields', () => {
      const complexData = {
        topic: "Enterprise integration strategy",
        personas: [
          {
            id: "architect-1",
            name: "Enterprise Architect",
            expertise: ["integration-patterns", "enterprise-architecture"],
            background: "20 years in enterprise systems",
            perspective: "Holistic system design",
            biases: ["standards-oriented", "long-term-focused"],
            communication: {
              style: "comprehensive",
              tone: "consultative"
            }
          },
          {
            id: "developer-1",
            name: "Senior Developer",
            expertise: ["microservices", "api-design"],
            background: "8 years in modern development",
            perspective: "Implementation practicality",
            biases: ["agile-oriented", "simplicity-focused"],
            communication: {
              style: "pragmatic",
              tone: "collaborative"
            }
          }
        ],
        contributions: [
          {
            personaId: "architect-1",
            content: "We should establish clear integration patterns",
            type: "suggestion",
            confidence: 0.9,
            referenceIds: []
          },
          {
            personaId: "developer-1",
            content: "How do we handle legacy system constraints?",
            type: "question",
            confidence: 0.7
          }
        ],
        stage: "ideation",
        activePersonaId: "developer-1",
        nextPersonaId: "architect-1",
        consensusPoints: [
          "Need for standardized API contracts",
          "Importance of monitoring and observability"
        ],
        disagreements: [
          {
            topic: "Technology choice for message queuing",
            positions: [
              {
                personaId: "architect-1",
                position: "Use enterprise message broker",
                arguments: ["Proven reliability", "Enterprise support"]
              },
              {
                personaId: "developer-1",
                position: "Use cloud-native messaging",
                arguments: ["Lower operational overhead", "Better scalability"]
              }
            ],
            resolution: {
              type: "compromise",
              description: "Hybrid approach with gradual migration"
            }
          }
        ],
        keyInsights: [
          "Legacy constraints significantly impact architecture choices",
          "Team consensus on monitoring importance"
        ],
        openQuestions: [
          "Timeline for legacy system migration",
          "Budget constraints for new infrastructure"
        ],
        finalRecommendation: "Implement phased approach with pilot integration",
        sessionId: "collab-session-456",
        iteration: 3,
        suggestedContributionTypes: ["insight", "concern"],
        nextContributionNeeded: true
      };

      const result = CollaborativeReasoningSchema.parse(complexData);

      expect(result.consensusPoints).toHaveLength(2);
      expect(result.disagreements).toHaveLength(1);
      expect(result.keyInsights).toHaveLength(2);
      expect(result.openQuestions).toHaveLength(2);
      expect(result.suggestedContributionTypes).toHaveLength(2);
      expect(result.finalRecommendation).toContain("phased approach");
    });

    it('should handle empty optional arrays', () => {
      const data = {
        topic: "Simple decision",
        personas: [{
          id: "single-persona",
          name: "Decision Maker",
          expertise: ["decision-making"],
          background: "Experience in decisions",
          perspective: "Practical approach",
          biases: [],
          communication: { style: "direct", tone: "decisive" }
        }],
        contributions: [{
          personaId: "single-persona",
          content: "Let's proceed with option A",
          type: "suggestion",
          confidence: 1.0
        }],
        stage: "decision",
        activePersonaId: "single-persona",
        consensusPoints: [],
        disagreements: [],
        keyInsights: [],
        openQuestions: [],
        suggestedContributionTypes: [],
        sessionId: "simple-session",
        iteration: 1,
        nextContributionNeeded: false
      };

      const result = CollaborativeReasoningSchema.parse(data);

      expect(result.consensusPoints).toEqual([]);
      expect(result.disagreements).toEqual([]);
      expect(result.keyInsights).toEqual([]);
      expect(result.openQuestions).toEqual([]);
      expect(result.suggestedContributionTypes).toEqual([]);
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => CollaborativeReasoningSchema.parse({})).toThrow();
      
      expect(() => CollaborativeReasoningSchema.parse({
        topic: "Test topic"
        // missing other required fields
      })).toThrow();
    });

    it('should reject invalid stage values', () => {
      expect(() => CollaborativeReasoningSchema.parse({
        topic: "Test topic",
        personas: [{
          id: "test",
          name: "test",
          expertise: ["test"],
          background: "test",
          perspective: "test",
          biases: [],
          communication: { style: "test", tone: "test" }
        }],
        contributions: [],
        stage: "invalid-stage",
        activePersonaId: "test",
        sessionId: "test",
        iteration: 1,
        nextContributionNeeded: false
      })).toThrow();
    });

    it('should allow negative iteration values', () => {
      // The schema currently allows negative numbers, so this should not throw
      expect(() => CollaborativeReasoningSchema.parse({
        topic: "Test topic",
        personas: [{
          id: "test",
          name: "test",
          expertise: ["test"],
          background: "test",
          perspective: "test",
          biases: [],
          communication: { style: "test", tone: "test" }
        }],
        contributions: [],
        stage: "problem-definition",
        activePersonaId: "test",
        sessionId: "test",
        iteration: -1, // currently allowed by schema
        nextContributionNeeded: false
      })).not.toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        CollaborativeReasoningSchema.parse({
          topic: 123, // invalid type
          personas: "not-array", // invalid type
          stage: "invalid-stage"
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('type inference', () => {
    it('should properly infer CollaborativeReasoningData type', () => {
      const data: CollaborativeReasoningData = {
        topic: "Type inference test",
        personas: [{
          id: "test-persona",
          name: "Test Persona",
          expertise: ["testing"],
          background: "Test background",
          perspective: "Test perspective",
          biases: ["test-bias"],
          communication: {
            style: "test-style",
            tone: "test-tone"
          }
        }],
        contributions: [{
          personaId: "test-persona",
          content: "Test contribution",
          type: "observation",
          confidence: 0.8
        }],
        stage: "problem-definition",
        activePersonaId: "test-persona",
        sessionId: "test-session",
        iteration: 1,
        nextContributionNeeded: true
      };

      // Should compile without errors
      expect(data.topic).toBe("Type inference test");
      expect(data.personas[0].expertise[0]).toBe("testing");
      expect(data.contributions[0].type).toBe("observation");
    });

    it('should properly infer PersonaData type', () => {
      const persona: PersonaData = {
        id: "test-id",
        name: "Test Name",
        expertise: ["skill1", "skill2"],
        background: "Test background",
        perspective: "Test perspective",
        biases: ["bias1"],
        communication: {
          style: "test-style",
          tone: "test-tone"
        }
      };

      // Should compile without errors
      expect(persona.expertise).toHaveLength(2);
      expect(persona.communication.style).toBe("test-style");
    });
  });

  describe('edge cases', () => {
    it('should handle very long content strings', () => {
      const longContent = "x".repeat(10000);
      
      const data = {
        topic: "Long content test",
        personas: [{
          id: "test-persona",
          name: "Test",
          expertise: ["test"],
          background: longContent,
          perspective: "Test perspective",
          biases: [],
          communication: { style: "test", tone: "test" }
        }],
        contributions: [{
          personaId: "test-persona",
          content: longContent,
          type: "observation",
          confidence: 0.5
        }],
        stage: "problem-definition",
        activePersonaId: "test-persona",
        sessionId: "test-session",
        iteration: 1,
        nextContributionNeeded: false
      };

      const result = CollaborativeReasoningSchema.parse(data);
      expect(result.personas[0].background).toHaveLength(10000);
      expect(result.contributions[0].content).toHaveLength(10000);
    });

    it('should handle large arrays', () => {
      const manyPersonas = Array.from({ length: 100 }, (_, i) => ({
        id: `persona-${i}`,
        name: `Persona ${i}`,
        expertise: [`skill-${i}`],
        background: `Background ${i}`,
        perspective: `Perspective ${i}`,
        biases: [`bias-${i}`],
        communication: {
          style: `style-${i}`,
          tone: `tone-${i}`
        }
      }));

      const data = {
        topic: "Large array test",
        personas: manyPersonas,
        contributions: [{
          personaId: "persona-0",
          content: "Test contribution",
          type: "observation",
          confidence: 0.5
        }],
        stage: "problem-definition",
        activePersonaId: "persona-0",
        sessionId: "test-session",
        iteration: 1,
        nextContributionNeeded: false
      };

      const result = CollaborativeReasoningSchema.parse(data);
      expect(result.personas).toHaveLength(100);
    });
  });
}); 