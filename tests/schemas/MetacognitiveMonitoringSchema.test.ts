/**
 * Tests for MetacognitiveMonitoringSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  MetacognitiveMonitoringSchema,
  type MetacognitiveMonitoringData
} from '../../src/schemas/MetacognitiveMonitoringSchema.js';

describe('MetacognitiveMonitoringSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid metacognitive monitoring data', () => {
      const validData = {
        task: "Analyze software architecture decision",
        stage: "knowledge-assessment",
        overallConfidence: 0.7,
        uncertaintyAreas: ["Long-term scalability implications"],
        recommendedApproach: "Gather more information about expected load patterns",
        monitoringId: "monitor-001",
        iteration: 1,
        nextAssessmentNeeded: true
      };

      const result = MetacognitiveMonitoringSchema.parse(validData);

      expect(result).toMatchObject({
        task: expect.any(String),
        stage: expect.any(String),
        overallConfidence: expect.any(Number),
        uncertaintyAreas: expect.any(Array),
        recommendedApproach: expect.any(String),
        monitoringId: expect.any(String),
        iteration: expect.any(Number),
        nextAssessmentNeeded: expect.any(Boolean)
      });
      expect(result.task).toBe("Analyze software architecture decision");
      expect(result.stage).toBe("knowledge-assessment");
      expect(result.overallConfidence).toBe(0.7);
      expect(result.uncertaintyAreas).toHaveLength(1);
    });

    it('should validate all stage types', () => {
      const stages = ["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"];
      
      stages.forEach(stage => {
        const data = {
          task: "Test task",
          stage: stage as any,
          overallConfidence: 0.5,
          uncertaintyAreas: ["Test uncertainty"],
          recommendedApproach: "Test approach",
          monitoringId: "test-monitor",
          iteration: 1,
          nextAssessmentNeeded: false
        };

        const result = MetacognitiveMonitoringSchema.parse(data);
        expect(result.stage).toBe(stage);
      });
    });

    it('should validate confidence boundaries', () => {
      const minConfidence = {
        task: "Low confidence task",
        stage: "planning",
        overallConfidence: 0.0, // minimum valid
        uncertaintyAreas: ["Everything is uncertain"],
        recommendedApproach: "Start with basic research",
        monitoringId: "low-conf-001",
        iteration: 1,
        nextAssessmentNeeded: true
      };

      const result = MetacognitiveMonitoringSchema.parse(minConfidence);
      expect(result.overallConfidence).toBe(0.0);

      const maxConfidence = {
        task: "High confidence task",
        stage: "evaluation",
        overallConfidence: 1.0, // maximum valid
        uncertaintyAreas: [],
        recommendedApproach: "Proceed with current plan",
        monitoringId: "high-conf-001",
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const maxResult = MetacognitiveMonitoringSchema.parse(maxConfidence);
      expect(maxResult.overallConfidence).toBe(1.0);
    });

    it('should validate comprehensive metacognitive monitoring with all fields', () => {
      const complexData = {
        task: "Design and implement distributed caching system",
        stage: "execution",
        overallConfidence: 0.65,
        uncertaintyAreas: [
          "Cache invalidation strategies across multiple nodes",
          "Performance impact under high load conditions",
          "Consistency guarantees during network partitions"
        ],
        recommendedApproach: "Implement prototype with basic features, then iteratively add complexity while monitoring performance",
        knowledgeAssessment: {
          domain: "Distributed Systems",
          knowledgeLevel: "proficient",
          confidenceScore: 0.7,
          supportingEvidence: "Have implemented basic distributed systems before, familiar with CAP theorem",
          knownLimitations: [
            "Limited experience with large-scale cache invalidation",
            "Haven't dealt with network partition scenarios in production"
          ],
          relevantTrainingCutoff: "2023-04"
        },
        reasoningSteps: [
          {
            step: "Analyze requirements for cache consistency",
            potentialBiases: ["Overconfidence in eventual consistency"],
            assumptions: ["Network partitions will be rare", "Read-heavy workload"],
            logicalValidity: 0.8,
            inferenceStrength: 0.7
          },
          {
            step: "Choose between AP and CP in CAP theorem",
            potentialBiases: ["Availability bias from past experience"],
            assumptions: ["Business can tolerate some inconsistency"],
            logicalValidity: 0.9,
            inferenceStrength: 0.6
          }
        ],
        claims: [
          {
            claim: "Redis Cluster will meet our scalability requirements",
            status: "inference",
            confidenceScore: 0.75,
            evidenceBasis: "Benchmarks show good performance for similar workloads",
            falsifiabilityCriteria: "Load testing with production-like data volumes",
            alternativeInterpretations: [
              "Might need custom sharding strategy",
              "Could require additional caching layer"
            ]
          },
          {
            claim: "Implementing cache-aside pattern is optimal",
            status: "speculation",
            confidenceScore: 0.6,
            evidenceBasis: "Common pattern in microservices architectures",
            falsifiabilityCriteria: "Compare performance with write-through and write-behind patterns"
          }
        ],
        monitoringId: "cache-system-monitor",
        iteration: 3,
        suggestedAssessments: ["reasoning", "claim"],
        nextAssessmentNeeded: true
      };

      const result = MetacognitiveMonitoringSchema.parse(complexData);

      expect(result.knowledgeAssessment).toBeDefined();
      expect(result.knowledgeAssessment?.domain).toBe("Distributed Systems");
      expect(result.knowledgeAssessment?.knowledgeLevel).toBe("proficient");
      expect(result.knowledgeAssessment?.knownLimitations).toHaveLength(2);
      
      expect(result.reasoningSteps).toHaveLength(2);
      expect(result.reasoningSteps?.[0].step).toContain("cache consistency");
      expect(result.reasoningSteps?.[0].logicalValidity).toBe(0.8);
      
      expect(result.claims).toHaveLength(2);
      expect(result.claims?.[0].claim).toContain("Redis Cluster");
      expect(result.claims?.[0].status).toBe("inference");
      expect(result.claims?.[1].status).toBe("speculation");
      
      expect(result.suggestedAssessments).toEqual(["reasoning", "claim"]);
    });

    it('should validate knowledge assessment with all knowledge levels', () => {
      const knowledgeLevels = ["expert", "proficient", "familiar", "basic", "minimal", "none"];
      
      knowledgeLevels.forEach(level => {
        const data = {
          task: "Test task",
          stage: "knowledge-assessment",
          overallConfidence: 0.5,
          uncertaintyAreas: ["Test"],
          recommendedApproach: "Test approach",
          knowledgeAssessment: {
            domain: "Test Domain",
            knowledgeLevel: level as any,
            confidenceScore: 0.5,
            supportingEvidence: "Test evidence",
            knownLimitations: ["Test limitation"],
            relevantTrainingCutoff: "2023-01"
          },
          monitoringId: "test-monitor",
          iteration: 1,
          nextAssessmentNeeded: false
        };

        const result = MetacognitiveMonitoringSchema.parse(data);
        expect(result.knowledgeAssessment?.knowledgeLevel).toBe(level);
      });
    });

    it('should validate all claim status types', () => {
      const claimStatuses = ["fact", "inference", "speculation", "uncertain"];
      
      claimStatuses.forEach(status => {
        const data = {
          task: "Test task",
          stage: "evaluation",
          overallConfidence: 0.5,
          uncertaintyAreas: ["Test"],
          recommendedApproach: "Test approach",
          claims: [{
            claim: `This is a ${status} claim`,
            status: status as any,
            confidenceScore: 0.5,
            evidenceBasis: "Test evidence"
          }],
          monitoringId: "test-monitor",
          iteration: 1,
          nextAssessmentNeeded: false
        };

        const result = MetacognitiveMonitoringSchema.parse(data);
        expect(result.claims?.[0].status).toBe(status);
      });
    });

    it('should validate all suggested assessment types', () => {
      const assessmentTypes = ["knowledge", "claim", "reasoning", "overall"];
      
      assessmentTypes.forEach(type => {
        const data = {
          task: "Test task",
          stage: "monitoring",
          overallConfidence: 0.5,
          uncertaintyAreas: ["Test"],
          recommendedApproach: "Test approach",
          suggestedAssessments: [type as any],
          monitoringId: "test-monitor",
          iteration: 1,
          nextAssessmentNeeded: false
        };

        const result = MetacognitiveMonitoringSchema.parse(data);
        expect(result.suggestedAssessments).toContain(type);
      });
    });

    it('should handle empty optional arrays', () => {
      const data = {
        task: "Simple task",
        stage: "reflection",
        overallConfidence: 0.8,
        uncertaintyAreas: [],
        recommendedApproach: "Continue current approach",
        reasoningSteps: [],
        claims: [],
        suggestedAssessments: [],
        monitoringId: "simple-monitor",
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = MetacognitiveMonitoringSchema.parse(data);

      expect(result.uncertaintyAreas).toEqual([]);
      expect(result.reasoningSteps).toEqual([]);
      expect(result.claims).toEqual([]);
      expect(result.suggestedAssessments).toEqual([]);
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => MetacognitiveMonitoringSchema.parse({})).toThrow();
      
      expect(() => MetacognitiveMonitoringSchema.parse({
        task: "Test task"
        // missing other required fields
      })).toThrow();
    });

    it('should reject invalid confidence values', () => {
      expect(() => MetacognitiveMonitoringSchema.parse({
        task: "Test task",
        stage: "planning",
        overallConfidence: -0.1, // below minimum
        uncertaintyAreas: ["Test"],
        recommendedApproach: "Test approach",
        monitoringId: "test",
        iteration: 1,
        nextAssessmentNeeded: false
      })).toThrow();

      expect(() => MetacognitiveMonitoringSchema.parse({
        task: "Test task",
        stage: "planning",
        overallConfidence: 1.1, // above maximum
        uncertaintyAreas: ["Test"],
        recommendedApproach: "Test approach",
        monitoringId: "test",
        iteration: 1,
        nextAssessmentNeeded: false
      })).toThrow();
    });

    it('should reject invalid stage values', () => {
      expect(() => MetacognitiveMonitoringSchema.parse({
        task: "Test task",
        stage: "invalid-stage",
        overallConfidence: 0.5,
        uncertaintyAreas: ["Test"],
        recommendedApproach: "Test approach",
        monitoringId: "test",
        iteration: 1,
        nextAssessmentNeeded: false
      })).toThrow();
    });

    it('should reject invalid knowledge levels', () => {
      expect(() => MetacognitiveMonitoringSchema.parse({
        task: "Test task",
        stage: "knowledge-assessment",
        overallConfidence: 0.5,
        uncertaintyAreas: ["Test"],
        recommendedApproach: "Test approach",
        knowledgeAssessment: {
          domain: "Test",
          knowledgeLevel: "invalid-level",
          confidenceScore: 0.5,
          supportingEvidence: "Test",
          knownLimitations: ["Test"]
        },
        monitoringId: "test",
        iteration: 1,
        nextAssessmentNeeded: false
      })).toThrow();
    });

    it('should reject invalid claim status values', () => {
      expect(() => MetacognitiveMonitoringSchema.parse({
        task: "Test task",
        stage: "evaluation",
        overallConfidence: 0.5,
        uncertaintyAreas: ["Test"],
        recommendedApproach: "Test approach",
        claims: [{
          claim: "Test claim",
          status: "invalid-status",
          confidenceScore: 0.5,
          evidenceBasis: "Test"
        }],
        monitoringId: "test",
        iteration: 1,
        nextAssessmentNeeded: false
      })).toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        MetacognitiveMonitoringSchema.parse({
          task: 123, // invalid type
          stage: "invalid-stage",
          overallConfidence: 1.5, // invalid range
          uncertaintyAreas: "not-array" // invalid type
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('type inference', () => {
    it('should properly infer MetacognitiveMonitoringData type', () => {
      const data: MetacognitiveMonitoringData = {
        task: "Type inference test",
        stage: "planning",
        overallConfidence: 0.7,
        uncertaintyAreas: ["Type safety"],
        recommendedApproach: "Use TypeScript",
        monitoringId: "type-test",
        iteration: 1,
        nextAssessmentNeeded: true
      };

      // Should compile without errors
      expect(data.task).toBe("Type inference test");
      expect(data.stage).toBe("planning");
      expect(data.uncertaintyAreas[0]).toBe("Type safety");
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = "x".repeat(10000);
      
      const data = {
        task: longString,
        stage: "execution",
        overallConfidence: 0.5,
        uncertaintyAreas: [longString],
        recommendedApproach: longString,
        monitoringId: "long-test",
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = MetacognitiveMonitoringSchema.parse(data);
      expect(result.task).toHaveLength(10000);
      expect(result.uncertaintyAreas[0]).toHaveLength(10000);
      expect(result.recommendedApproach).toHaveLength(10000);
    });

    it('should handle large arrays', () => {
      const manyUncertainties = Array.from({ length: 50 }, (_, i) => `Uncertainty ${i + 1}`);
      
      const data = {
        task: "Complex multi-faceted problem",
        stage: "planning",
        overallConfidence: 0.3,
        uncertaintyAreas: manyUncertainties,
        recommendedApproach: "Break down into smaller, manageable pieces",
        monitoringId: "complex-problem",
        iteration: 1,
        nextAssessmentNeeded: true
      };

      const result = MetacognitiveMonitoringSchema.parse(data);
      expect(result.uncertaintyAreas).toHaveLength(50);
      expect(result.uncertaintyAreas[49]).toBe("Uncertainty 50");
    });

    it('should handle complex nested reasoning steps', () => {
      const complexReasoningSteps = Array.from({ length: 10 }, (_, i) => ({
        step: `Complex reasoning step ${i + 1} with detailed analysis`,
        potentialBiases: [
          "Confirmation bias",
          "Anchoring bias",
          "Availability heuristic"
        ],
        assumptions: [
          `Assumption ${i + 1}A about domain constraints`,
          `Assumption ${i + 1}B about user behavior`,
          `Assumption ${i + 1}C about technical limitations`
        ],
        logicalValidity: Math.random(),
        inferenceStrength: Math.random()
      }));

      const data = {
        task: "Complex multi-step analysis",
        stage: "execution",
        overallConfidence: 0.6,
        uncertaintyAreas: ["Logical consistency", "Evidence quality"],
        recommendedApproach: "Systematic step-by-step validation",
        reasoningSteps: complexReasoningSteps,
        monitoringId: "complex-reasoning",
        iteration: 5,
        nextAssessmentNeeded: true
      };

      const result = MetacognitiveMonitoringSchema.parse(data);
      expect(result.reasoningSteps).toHaveLength(10);
      expect(result.reasoningSteps?.[0].potentialBiases).toHaveLength(3);
      expect(result.reasoningSteps?.[9].assumptions).toHaveLength(3);
    });

    it('should handle high iteration numbers', () => {
      const data = {
        task: "Long-running iterative process",
        stage: "monitoring",
        overallConfidence: 0.85,
        uncertaintyAreas: ["Process convergence"],
        recommendedApproach: "Continue monitoring for stability",
        monitoringId: "long-process",
        iteration: 9999,
        nextAssessmentNeeded: true
      };

      const result = MetacognitiveMonitoringSchema.parse(data);
      expect(result.iteration).toBe(9999);
    });
  });
}); 