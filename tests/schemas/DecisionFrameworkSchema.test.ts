/**
 * Tests for DecisionFrameworkSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  DecisionFrameworkSchema,
  DecisionOptionSchema,
  DecisionCriterionSchema,
  CriterionEvaluationSchema,
  PossibleOutcomeSchema,
  InformationGapSchema,
  type DecisionFrameworkData,
  type DecisionOptionData,
  type DecisionCriterionData
} from '../../src/schemas/DecisionFrameworkSchema.js';

describe('DecisionFrameworkSchema', () => {
  describe('DecisionOptionSchema validation', () => {
    it('should validate minimal valid option data', () => {
      const validOption = {
        name: "Option A",
        description: "First possible choice"
      };

      const result = DecisionOptionSchema.parse(validOption);

      expect(result).toMatchObject({
        name: expect.any(String),
        description: expect.any(String)
      });
      expect(result.name).toBe("Option A");
      expect(result.description).toBe("First possible choice");
      expect(result.id).toBeUndefined();
    });

    it('should validate option with id', () => {
      const validOption = {
        id: "opt-1",
        name: "Cloud Migration",
        description: "Migrate to cloud infrastructure"
      };

      const result = DecisionOptionSchema.parse(validOption);

      expect(result.id).toBe("opt-1");
      expect(result.name).toBe("Cloud Migration");
    });

    it('should reject invalid option data', () => {
      expect(() => DecisionOptionSchema.parse({
        name: 123, // invalid type
        description: "Valid description"
      })).toThrow();

      expect(() => DecisionOptionSchema.parse({
        name: "Valid name"
        // missing description
      })).toThrow();
    });
  });

  describe('DecisionCriterionSchema validation', () => {
    it('should validate all evaluation methods', () => {
      const evaluationMethods = ["quantitative", "qualitative", "boolean"];
      
      evaluationMethods.forEach(method => {
        const criterion = {
          name: `${method} criterion`,
          description: `A ${method} evaluation`,
          weight: 0.5,
          evaluationMethod: method as any
        };

        const result = DecisionCriterionSchema.parse(criterion);
        expect(result.evaluationMethod).toBe(method);
      });
    });

    it('should validate weight boundaries', () => {
      const validCriterion = {
        name: "Cost",
        description: "Financial impact",
        weight: 0.0, // minimum valid
        evaluationMethod: "quantitative"
      };

      const result = DecisionCriterionSchema.parse(validCriterion);
      expect(result.weight).toBe(0.0);

      const maxWeightCriterion = {
        name: "Critical Factor",
        description: "Most important factor",
        weight: 1.0, // maximum valid
        evaluationMethod: "qualitative"
      };

      const maxResult = DecisionCriterionSchema.parse(maxWeightCriterion);
      expect(maxResult.weight).toBe(1.0);
    });

    it('should reject invalid weight values', () => {
      expect(() => DecisionCriterionSchema.parse({
        name: "Invalid Criterion",
        description: "Test",
        weight: -0.1, // below minimum
        evaluationMethod: "quantitative"
      })).toThrow();

      expect(() => DecisionCriterionSchema.parse({
        name: "Invalid Criterion",
        description: "Test",
        weight: 1.1, // above maximum
        evaluationMethod: "quantitative"
      })).toThrow();
    });
  });

  describe('CriterionEvaluationSchema validation', () => {
    it('should validate criterion evaluation', () => {
      const evaluation = {
        criterionId: "cost-criterion",
        optionId: "option-a",
        score: 0.8,
        justification: "Option A provides good value for money"
      };

      const result = CriterionEvaluationSchema.parse(evaluation);

      expect(result.criterionId).toBe("cost-criterion");
      expect(result.optionId).toBe("option-a");
      expect(result.score).toBe(0.8);
      expect(result.justification).toContain("good value");
    });

    it('should validate score boundaries', () => {
      const minScore = {
        criterionId: "test",
        optionId: "test",
        score: 0.0,
        justification: "Minimum score"
      };

      expect(() => CriterionEvaluationSchema.parse(minScore)).not.toThrow();

      const maxScore = {
        criterionId: "test",
        optionId: "test",
        score: 1.0,
        justification: "Maximum score"
      };

      expect(() => CriterionEvaluationSchema.parse(maxScore)).not.toThrow();
    });
  });

  describe('PossibleOutcomeSchema validation', () => {
    it('should validate outcome with all fields', () => {
      const outcome = {
        id: "outcome-1",
        description: "Successful implementation within budget",
        probability: 0.7,
        value: 100000,
        optionId: "option-a",
        confidenceInEstimate: 0.8
      };

      const result = PossibleOutcomeSchema.parse(outcome);

      expect(result.id).toBe("outcome-1");
      expect(result.probability).toBe(0.7);
      expect(result.value).toBe(100000);
      expect(result.confidenceInEstimate).toBe(0.8);
    });

    it('should validate outcome without optional id', () => {
      const outcome = {
        description: "Risk of delays",
        probability: 0.3,
        value: -50000,
        optionId: "option-b",
        confidenceInEstimate: 0.6
      };

      const result = PossibleOutcomeSchema.parse(outcome);

      expect(result.id).toBeUndefined();
      expect(result.value).toBe(-50000); // negative values allowed
    });

    it('should reject invalid probability values', () => {
      expect(() => PossibleOutcomeSchema.parse({
        description: "Test outcome",
        probability: -0.1, // invalid
        value: 1000,
        optionId: "test",
        confidenceInEstimate: 0.5
      })).toThrow();

      expect(() => PossibleOutcomeSchema.parse({
        description: "Test outcome",
        probability: 1.1, // invalid
        value: 1000,
        optionId: "test",
        confidenceInEstimate: 0.5
      })).toThrow();
    });
  });

  describe('InformationGapSchema validation', () => {
    it('should validate information gap', () => {
      const gap = {
        description: "Market research needed for competitor analysis",
        impact: 0.6,
        researchMethod: "Survey and competitive analysis"
      };

      const result = InformationGapSchema.parse(gap);

      expect(result.description).toContain("Market research");
      expect(result.impact).toBe(0.6);
      expect(result.researchMethod).toContain("Survey");
    });

    it('should validate impact boundaries', () => {
      const lowImpact = {
        description: "Minor detail needed",
        impact: 0.0,
        researchMethod: "Quick lookup"
      };

      expect(() => InformationGapSchema.parse(lowImpact)).not.toThrow();

      const highImpact = {
        description: "Critical information missing",
        impact: 1.0,
        researchMethod: "Extensive research required"
      };

      expect(() => InformationGapSchema.parse(highImpact)).not.toThrow();
    });
  });

  describe('DecisionFrameworkSchema validation', () => {
    it('should validate minimal valid decision framework', () => {
      const validData = {
        decisionStatement: "Choose the best cloud provider for our application",
        options: [
          {
            name: "AWS",
            description: "Amazon Web Services"
          },
          {
            name: "Azure",
            description: "Microsoft Azure"
          }
        ],
        analysisType: "multi-criteria",
        stage: "problem-definition",
        decisionId: "decision-001",
        iteration: 1,
        nextStageNeeded: true
      };

      const result = DecisionFrameworkSchema.parse(validData);

      expect(result).toMatchObject({
        decisionStatement: expect.any(String),
        options: expect.any(Array),
        analysisType: expect.any(String),
        stage: expect.any(String),
        decisionId: expect.any(String),
        iteration: expect.any(Number),
        nextStageNeeded: expect.any(Boolean)
      });
      expect(result.options).toHaveLength(2);
    });

    it('should validate all analysis types', () => {
      const analysisTypes = ["expected-utility", "multi-criteria", "maximin", "minimax-regret", "satisficing"];
      
      analysisTypes.forEach(analysisType => {
        const data = {
          decisionStatement: "Test decision",
          options: [{ name: "Option 1", description: "First option" }],
          analysisType: analysisType as any,
          stage: "analysis",
          decisionId: "test-decision",
          iteration: 1,
          nextStageNeeded: false
        };

        const result = DecisionFrameworkSchema.parse(data);
        expect(result.analysisType).toBe(analysisType);
      });
    });

    it('should validate all stage types', () => {
      const stages = ["problem-definition", "options", "criteria", "evaluation", "analysis", "recommendation"];
      
      stages.forEach(stage => {
        const data = {
          decisionStatement: "Test decision",
          options: [{ name: "Option 1", description: "First option" }],
          analysisType: "multi-criteria",
          stage: stage as any,
          decisionId: "test-decision",
          iteration: 1,
          nextStageNeeded: false
        };

        const result = DecisionFrameworkSchema.parse(data);
        expect(result.stage).toBe(stage);
      });
    });

    it('should validate all risk tolerance levels', () => {
      const riskLevels = ["risk-averse", "risk-neutral", "risk-seeking"];
      
      riskLevels.forEach(riskTolerance => {
        const data = {
          decisionStatement: "Test decision",
          options: [{ name: "Option 1", description: "First option" }],
          analysisType: "expected-utility",
          stage: "analysis",
          riskTolerance: riskTolerance as any,
          decisionId: "test-decision",
          iteration: 1,
          nextStageNeeded: false
        };

        const result = DecisionFrameworkSchema.parse(data);
        expect(result.riskTolerance).toBe(riskTolerance);
      });
    });

    it('should validate comprehensive decision framework', () => {
      const complexData = {
        decisionStatement: "Select enterprise software architecture approach",
        options: [
          {
            id: "monolith",
            name: "Monolithic Architecture",
            description: "Single deployable unit with all functionality"
          },
          {
            id: "microservices",
            name: "Microservices Architecture",
            description: "Distributed system with independent services"
          },
          {
            id: "modular-monolith",
            name: "Modular Monolith",
            description: "Monolith with clear internal boundaries"
          }
        ],
        criteria: [
          {
            id: "development-speed",
            name: "Development Speed",
            description: "Time to market for new features",
            weight: 0.3,
            evaluationMethod: "quantitative"
          },
          {
            id: "scalability",
            name: "Scalability",
            description: "Ability to handle increased load",
            weight: 0.25,
            evaluationMethod: "qualitative"
          },
          {
            id: "maintainability",
            name: "Maintainability",
            description: "Ease of long-term maintenance",
            weight: 0.25,
            evaluationMethod: "qualitative"
          },
          {
            id: "team-expertise",
            name: "Team Expertise",
            description: "Current team knowledge and skills",
            weight: 0.2,
            evaluationMethod: "boolean"
          }
        ],
        stakeholders: [
          "Development Team",
          "Product Management",
          "Operations Team",
          "Executive Leadership"
        ],
        constraints: [
          "Must deliver within 6 months",
          "Limited budget for infrastructure changes",
          "Team size cannot increase significantly"
        ],
        timeHorizon: "2-3 years",
        riskTolerance: "risk-neutral",
        possibleOutcomes: [
          {
            id: "monolith-success",
            description: "Monolith delivers quickly with good performance",
            probability: 0.7,
            value: 800000,
            optionId: "monolith",
            confidenceInEstimate: 0.8
          },
          {
            id: "microservices-success",
            description: "Microservices provide excellent scalability",
            probability: 0.5,
            value: 1200000,
            optionId: "microservices",
            confidenceInEstimate: 0.6
          }
        ],
        criteriaEvaluations: [
          {
            criterionId: "development-speed",
            optionId: "monolith",
            score: 0.9,
            justification: "Fastest initial development due to simplicity"
          },
          {
            criterionId: "development-speed",
            optionId: "microservices",
            score: 0.4,
            justification: "Slower initial development due to complexity"
          }
        ],
        informationGaps: [
          {
            description: "Exact performance requirements under peak load",
            impact: 0.7,
            researchMethod: "Load testing and capacity planning"
          },
          {
            description: "Long-term maintenance costs comparison",
            impact: 0.5,
            researchMethod: "Industry benchmarking and expert consultation"
          }
        ],
        analysisType: "multi-criteria",
        stage: "evaluation",
        recommendation: "Proceed with modular monolith as balanced approach",
        sensitivityInsights: [
          "Decision highly sensitive to scalability requirements",
          "Team expertise has moderate impact on success probability"
        ],
        expectedValues: {
          "monolith": 560000,
          "microservices": 600000,
          "modular-monolith": 700000
        },
        multiCriteriaScores: {
          "monolith": 0.75,
          "microservices": 0.65,
          "modular-monolith": 0.85
        },
        decisionId: "arch-decision-2024",
        iteration: 3,
        suggestedNextStage: "implementation-planning",
        nextStageNeeded: true
      };

      const result = DecisionFrameworkSchema.parse(complexData);

      expect(result.options).toHaveLength(3);
      expect(result.criteria).toHaveLength(4);
      expect(result.stakeholders).toHaveLength(4);
      expect(result.constraints).toHaveLength(3);
      expect(result.possibleOutcomes).toHaveLength(2);
      expect(result.criteriaEvaluations).toHaveLength(2);
      expect(result.informationGaps).toHaveLength(2);
      expect(result.sensitivityInsights).toHaveLength(2);
      expect(result.expectedValues).toHaveProperty("monolith");
      expect(result.multiCriteriaScores).toHaveProperty("microservices");
    });

    it('should handle empty optional arrays', () => {
      const data = {
        decisionStatement: "Simple binary choice",
        options: [
          { name: "Yes", description: "Proceed with the plan" },
          { name: "No", description: "Do not proceed" }
        ],
        criteria: [],
        stakeholders: [],
        constraints: [],
        possibleOutcomes: [],
        criteriaEvaluations: [],
        informationGaps: [],
        sensitivityInsights: [],
        analysisType: "satisficing",
        stage: "recommendation",
        decisionId: "simple-decision",
        iteration: 1,
        nextStageNeeded: false
      };

      const result = DecisionFrameworkSchema.parse(data);

      expect(result.criteria).toEqual([]);
      expect(result.stakeholders).toEqual([]);
      expect(result.constraints).toEqual([]);
      expect(result.sensitivityInsights).toEqual([]);
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => DecisionFrameworkSchema.parse({})).toThrow();
      
      expect(() => DecisionFrameworkSchema.parse({
        decisionStatement: "Test decision"
        // missing other required fields
      })).toThrow();
    });

    it('should reject invalid analysis types', () => {
      expect(() => DecisionFrameworkSchema.parse({
        decisionStatement: "Test decision",
        options: [{ name: "Option 1", description: "Test" }],
        analysisType: "invalid-analysis",
        stage: "analysis",
        decisionId: "test",
        iteration: 1,
        nextStageNeeded: false
      })).toThrow();
    });

    it('should reject invalid stage values', () => {
      expect(() => DecisionFrameworkSchema.parse({
        decisionStatement: "Test decision",
        options: [{ name: "Option 1", description: "Test" }],
        analysisType: "multi-criteria",
        stage: "invalid-stage",
        decisionId: "test",
        iteration: 1,
        nextStageNeeded: false
      })).toThrow();
    });

    it('should allow negative iteration values', () => {
      // The schema currently allows negative numbers, so this should not throw
      expect(() => DecisionFrameworkSchema.parse({
        decisionStatement: "Test decision",
        options: [{ name: "Option 1", description: "Test" }],
        analysisType: "multi-criteria",
        stage: "analysis",
        decisionId: "test",
        iteration: -1, // currently allowed by schema
        nextStageNeeded: false
      })).not.toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        DecisionFrameworkSchema.parse({
          decisionStatement: 123, // invalid type
          options: "not-array", // invalid type
          analysisType: "invalid-type",
          stage: "invalid-stage"
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('type inference', () => {
    it('should properly infer DecisionFrameworkData type', () => {
      const data: DecisionFrameworkData = {
        decisionStatement: "Type inference test",
        options: [{
          name: "Test Option",
          description: "Test description"
        }],
        analysisType: "multi-criteria",
        stage: "problem-definition",
        decisionId: "test-decision",
        iteration: 1,
        nextStageNeeded: true
      };

      // Should compile without errors
      expect(data.decisionStatement).toBe("Type inference test");
      expect(data.options[0].name).toBe("Test Option");
      expect(data.analysisType).toBe("multi-criteria");
    });

    it('should properly infer DecisionOptionData type', () => {
      const option: DecisionOptionData = {
        id: "opt-1",
        name: "Test Option",
        description: "Test description"
      };

      // Should compile without errors
      expect(option.id).toBe("opt-1");
      expect(option.name).toBe("Test Option");
    });

    it('should properly infer DecisionCriterionData type', () => {
      const criterion: DecisionCriterionData = {
        id: "crit-1",
        name: "Test Criterion",
        description: "Test description",
        weight: 0.5,
        evaluationMethod: "quantitative"
      };

      // Should compile without errors
      expect(criterion.weight).toBe(0.5);
      expect(criterion.evaluationMethod).toBe("quantitative");
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = "x".repeat(10000);
      
      const data = {
        decisionStatement: longString,
        options: [{
          name: "Test Option",
          description: longString
        }],
        analysisType: "multi-criteria",
        stage: "problem-definition",
        decisionId: "test-decision",
        iteration: 1,
        nextStageNeeded: false
      };

      const result = DecisionFrameworkSchema.parse(data);
      expect(result.decisionStatement).toHaveLength(10000);
      expect(result.options[0].description).toHaveLength(10000);
    });

    it('should handle large arrays', () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        id: `option-${i}`,
        name: `Option ${i}`,
        description: `Description for option ${i}`
      }));

      const data = {
        decisionStatement: "Decision with many options",
        options: manyOptions,
        analysisType: "multi-criteria",
        stage: "options",
        decisionId: "many-options-decision",
        iteration: 1,
        nextStageNeeded: true
      };

      const result = DecisionFrameworkSchema.parse(data);
      expect(result.options).toHaveLength(50);
    });

    it('should handle extreme numeric values', () => {
      const data = {
        decisionStatement: "Extreme values test",
        options: [{ name: "Option 1", description: "Test" }],
        possibleOutcomes: [{
          description: "Extreme positive outcome",
          probability: 0.001, // very low probability
          value: 999999999, // very high value
          optionId: "option-1",
          confidenceInEstimate: 0.01 // very low confidence
        }],
        analysisType: "expected-utility",
        stage: "analysis",
        decisionId: "extreme-test",
        iteration: 999, // high iteration count
        nextStageNeeded: false
      };

      const result = DecisionFrameworkSchema.parse(data);
      expect(result.possibleOutcomes?.[0].value).toBe(999999999);
      expect(result.iteration).toBe(999);
    });
  });
}); 