/**
 * Tests for ScientificMethodSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  ScientificMethodSchema,
  type ScientificMethodData
} from '../../src/schemas/ScientificMethodSchema.js';

describe('ScientificMethodSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid scientific method data', () => {
      const validData = {
        stage: "observation",
        inquiryId: "inquiry-001",
        iteration: 1,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(validData);

      expect(result).toMatchObject({
        stage: expect.any(String),
        inquiryId: expect.any(String),
        iteration: expect.any(Number),
        nextStageNeeded: expect.any(Boolean)
      });
      expect(result.stage).toBe("observation");
      expect(result.inquiryId).toBe("inquiry-001");
      expect(result.iteration).toBe(1);
    });

    it('should validate all stage types', () => {
      const stages = ["observation", "question", "hypothesis", "experiment", "analysis", "conclusion", "iteration"];
      
      stages.forEach(stage => {
        const data = {
          stage: stage as any,
          inquiryId: "test-inquiry",
          iteration: 1,
          nextStageNeeded: false
        };

        const result = ScientificMethodSchema.parse(data);
        expect(result.stage).toBe(stage);
      });
    });

    it('should validate observation stage', () => {
      const observationData = {
        stage: "observation",
        observation: "Water boils at different temperatures at different altitudes",
        inquiryId: "altitude-boiling-study",
        iteration: 1,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(observationData);
      expect(result.observation).toBe("Water boils at different temperatures at different altitudes");
    });

    it('should validate question stage', () => {
      const questionData = {
        stage: "question",
        question: "How does atmospheric pressure affect the boiling point of water?",
        observation: "Water boils at different temperatures at different altitudes",
        inquiryId: "altitude-boiling-study",
        iteration: 2,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(questionData);
      expect(result.question).toContain("atmospheric pressure");
      expect(result.observation).toBeDefined();
    });

    it('should validate hypothesis stage with complete hypothesis', () => {
      const hypothesisData = {
        stage: "hypothesis",
        question: "How does atmospheric pressure affect the boiling point of water?",
        hypothesis: {
          statement: "Lower atmospheric pressure will result in lower boiling point of water",
          variables: [
            {
              name: "atmospheric pressure",
              type: "independent",
              operationalization: "Measured in kilopascals using barometer"
            },
            {
              name: "boiling point",
              type: "dependent",
              operationalization: "Temperature at which water begins to boil, measured with thermometer"
            },
            {
              name: "water purity",
              type: "controlled",
              operationalization: "Use distilled water for all experiments"
            }
          ],
          assumptions: [
            "Water purity remains constant",
            "Measurement instruments are accurate",
            "Environmental temperature is controlled"
          ],
          hypothesisId: "altitude-pressure-hypothesis",
          confidence: 0.8,
          domain: "Physical Chemistry",
          iteration: 1,
          status: "proposed"
        },
        inquiryId: "altitude-boiling-study",
        iteration: 3,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(hypothesisData);
      expect(result.hypothesis).toBeDefined();
      expect(result.hypothesis?.statement).toContain("Lower atmospheric pressure");
      expect(result.hypothesis?.variables).toHaveLength(3);
      expect(result.hypothesis?.assumptions).toHaveLength(3);
      expect(result.hypothesis?.confidence).toBe(0.8);
    });

    it('should validate all variable types', () => {
      const variableTypes = ["independent", "dependent", "controlled", "confounding"];
      
      variableTypes.forEach(type => {
        const data = {
          stage: "hypothesis",
          hypothesis: {
            statement: "Test hypothesis",
            variables: [{
              name: `${type} variable`,
              type: type as any,
              operationalization: "Test measurement"
            }],
            assumptions: ["Test assumption"],
            hypothesisId: "test-hypothesis",
            confidence: 0.5,
            domain: "Test domain",
            iteration: 1,
            status: "proposed"
          },
          inquiryId: "test-inquiry",
          iteration: 1,
          nextStageNeeded: false
        };

        const result = ScientificMethodSchema.parse(data);
        expect(result.hypothesis?.variables[0].type).toBe(type);
      });
    });

    it('should validate all hypothesis status types', () => {
      const statusTypes = ["proposed", "testing", "supported", "refuted", "refined"];
      
      statusTypes.forEach(status => {
        const data = {
          stage: "hypothesis",
          hypothesis: {
            statement: "Test hypothesis",
            variables: [{
              name: "test variable",
              type: "independent"
            }],
            assumptions: ["Test assumption"],
            hypothesisId: "test-hypothesis",
            confidence: 0.5,
            domain: "Test domain",
            iteration: 1,
            status: status as any
          },
          inquiryId: "test-inquiry",
          iteration: 1,
          nextStageNeeded: false
        };

        const result = ScientificMethodSchema.parse(data);
        expect(result.hypothesis?.status).toBe(status);
      });
    });

    it('should validate experiment stage', () => {
      const experimentData = {
        stage: "experiment",
        experiment: {
          design: "Controlled laboratory experiment with pressure chamber",
          methodology: "Systematically reduce pressure and measure boiling point at each level",
          predictions: [
            {
              if: "Pressure is reduced to 50 kPa",
              then: "Water will boil at approximately 80°C",
              else: "Hypothesis needs revision"
            },
            {
              if: "Pressure is reduced to 25 kPa",
              then: "Water will boil at approximately 65°C"
            }
          ],
          experimentId: "pressure-boiling-exp-001",
          hypothesisId: "altitude-pressure-hypothesis",
          controlMeasures: [
            "Use identical water samples",
            "Maintain constant ambient temperature",
            "Calibrate instruments before each measurement"
          ],
          results: "At 50 kPa: 81.2°C, At 25 kPa: 64.8°C, At 10 kPa: 45.3°C",
          outcomeMatched: true,
          unexpectedObservations: [
            "Slight vapor formation observed before reaching predicted boiling point"
          ],
          limitations: [
            "Limited pressure range due to equipment constraints",
            "Small sample size of measurements"
          ],
          nextSteps: [
            "Repeat experiment with larger sample size",
            "Test intermediate pressure levels"
          ]
        },
        inquiryId: "altitude-boiling-study",
        iteration: 4,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(experimentData);
      expect(result.experiment).toBeDefined();
      expect(result.experiment?.design).toContain("pressure chamber");
      expect(result.experiment?.predictions).toHaveLength(2);
      expect(result.experiment?.controlMeasures).toHaveLength(3);
      expect(result.experiment?.outcomeMatched).toBe(true);
      expect(result.experiment?.unexpectedObservations).toHaveLength(1);
    });

    it('should validate analysis stage', () => {
      const analysisData = {
        stage: "analysis",
        analysis: "Results show strong inverse correlation between atmospheric pressure and boiling point (r = -0.97, p < 0.001). Linear regression indicates approximately 1°C decrease per 2 kPa pressure reduction.",
        inquiryId: "altitude-boiling-study",
        iteration: 5,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(analysisData);
      expect(result.analysis).toContain("correlation");
      expect(result.analysis).toContain("regression");
    });

    it('should validate conclusion stage', () => {
      const conclusionData = {
        stage: "conclusion",
        conclusion: "The hypothesis is supported. Lower atmospheric pressure does result in lower boiling point of water, with a predictable linear relationship suitable for practical applications.",
        analysis: "Statistical analysis confirms significant relationship",
        inquiryId: "altitude-boiling-study",
        iteration: 6,
        nextStageNeeded: false
      };

      const result = ScientificMethodSchema.parse(conclusionData);
      expect(result.conclusion).toContain("hypothesis is supported");
      expect(result.nextStageNeeded).toBe(false);
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => ScientificMethodSchema.parse({})).toThrow();
      
      expect(() => ScientificMethodSchema.parse({
        stage: "observation"
        // missing other required fields
      })).toThrow();
    });

    it('should reject invalid stage values', () => {
      expect(() => ScientificMethodSchema.parse({
        stage: "invalid-stage",
        inquiryId: "test",
        iteration: 1,
        nextStageNeeded: false
      })).toThrow();
    });

    it('should reject invalid variable types', () => {
      expect(() => ScientificMethodSchema.parse({
        stage: "hypothesis",
        hypothesis: {
          statement: "Test",
          variables: [{
            name: "test",
            type: "invalid-type"
          }],
          assumptions: ["test"],
          hypothesisId: "test",
          confidence: 0.5,
          domain: "test",
          iteration: 1,
          status: "proposed"
        },
        inquiryId: "test",
        iteration: 1,
        nextStageNeeded: false
      })).toThrow();
    });

    it('should reject invalid confidence values', () => {
      expect(() => ScientificMethodSchema.parse({
        stage: "hypothesis",
        hypothesis: {
          statement: "Test",
          variables: [{
            name: "test",
            type: "independent"
          }],
          assumptions: ["test"],
          hypothesisId: "test",
          confidence: 1.5, // invalid
          domain: "test",
          iteration: 1,
          status: "proposed"
        },
        inquiryId: "test",
        iteration: 1,
        nextStageNeeded: false
      })).toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        ScientificMethodSchema.parse({
          stage: "invalid-stage",
          inquiryId: 123, // invalid type
          iteration: "not-number", // invalid type
          nextStageNeeded: "not-boolean" // invalid type
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('type inference', () => {
    it('should properly infer ScientificMethodData type', () => {
      const data: ScientificMethodData = {
        stage: "observation",
        observation: "Test observation",
        inquiryId: "test-inquiry",
        iteration: 1,
        nextStageNeeded: true
      };

      // Should compile without errors
      expect(data.stage).toBe("observation");
      expect(data.observation).toBe("Test observation");
      expect(data.inquiryId).toBe("test-inquiry");
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = "x".repeat(10000);
      
      const data = {
        stage: "observation",
        observation: longString,
        inquiryId: "long-test",
        iteration: 1,
        nextStageNeeded: false
      };

      const result = ScientificMethodSchema.parse(data);
      expect(result.observation).toHaveLength(10000);
    });

    it('should handle large arrays in experiment', () => {
      const manyPredictions = Array.from({ length: 20 }, (_, i) => ({
        if: `Condition ${i + 1}`,
        then: `Prediction ${i + 1}`,
        else: `Alternative ${i + 1}`
      }));

      const data = {
        stage: "experiment",
        experiment: {
          design: "Large scale experiment",
          methodology: "Test many conditions",
          predictions: manyPredictions,
          experimentId: "large-exp",
          hypothesisId: "large-hypothesis",
          controlMeasures: ["Control 1", "Control 2"]
        },
        inquiryId: "large-study",
        iteration: 1,
        nextStageNeeded: false
      };

      const result = ScientificMethodSchema.parse(data);
      expect(result.experiment?.predictions).toHaveLength(20);
      expect(result.experiment?.predictions[19].if).toBe("Condition 20");
    });

    it('should handle high iteration numbers', () => {
      const data = {
        stage: "iteration",
        inquiryId: "long-running-study",
        iteration: 999,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(data);
      expect(result.iteration).toBe(999);
    });

    it('should handle complex hypothesis with many variables', () => {
      const manyVariables = Array.from({ length: 15 }, (_, i) => ({
        name: `Variable ${i + 1}`,
        type: ["independent", "dependent", "controlled", "confounding"][i % 4] as any,
        operationalization: `Measurement method ${i + 1}`
      }));

      const data = {
        stage: "hypothesis",
        hypothesis: {
          statement: "Complex multi-variable hypothesis",
          variables: manyVariables,
          assumptions: Array.from({ length: 10 }, (_, i) => `Assumption ${i + 1}`),
          hypothesisId: "complex-hypothesis",
          confidence: 0.6,
          domain: "Multidisciplinary Research",
          iteration: 3,
          status: "testing",
          alternativeTo: ["simple-hypothesis-1", "simple-hypothesis-2"],
          refinementOf: "preliminary-hypothesis"
        },
        inquiryId: "complex-study",
        iteration: 10,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(data);
      expect(result.hypothesis?.variables).toHaveLength(15);
      expect(result.hypothesis?.assumptions).toHaveLength(10);
      expect(result.hypothesis?.alternativeTo).toHaveLength(2);
    });
  });

  describe('real-world scientific method examples', () => {
    it('should validate medical research workflow', () => {
      const medicalResearch = {
        stage: "hypothesis",
        observation: "Patients taking Drug X show improved symptoms",
        question: "Does Drug X significantly reduce symptoms compared to placebo?",
        hypothesis: {
          statement: "Drug X will reduce symptom severity by at least 30% compared to placebo",
          variables: [
            {
              name: "drug treatment",
              type: "independent",
              operationalization: "Daily 50mg dose of Drug X vs identical placebo"
            },
            {
              name: "symptom severity",
              type: "dependent",
              operationalization: "Standardized symptom severity scale (0-100)"
            },
            {
              name: "patient demographics",
              type: "controlled",
              operationalization: "Age 18-65, similar baseline symptoms"
            }
          ],
          assumptions: [
            "Patients will comply with treatment protocol",
            "Placebo effect is minimized by double-blinding",
            "Scale accurately measures symptom severity"
          ],
          hypothesisId: "drug-x-efficacy",
          confidence: 0.75,
          domain: "Clinical Medicine",
          iteration: 1,
          status: "proposed"
        },
        inquiryId: "drug-x-clinical-trial",
        iteration: 3,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(medicalResearch);
      expect(result.hypothesis?.domain).toBe("Clinical Medicine");
      expect(result.hypothesis?.variables).toHaveLength(3);
    });

    it('should validate physics experiment workflow', () => {
      const physicsExperiment = {
        stage: "experiment",
        question: "How does pendulum length affect oscillation period?",
        hypothesis: {
          statement: "Period is proportional to square root of length",
          variables: [
            { name: "pendulum length", type: "independent" },
            { name: "oscillation period", type: "dependent" }
          ],
          assumptions: ["Small angle approximation holds"],
          hypothesisId: "pendulum-period",
          confidence: 0.9,
          domain: "Classical Mechanics",
          iteration: 1,
          status: "testing"
        },
        experiment: {
          design: "Controlled laboratory measurement of pendulum oscillations",
          methodology: "Measure period for lengths from 0.1m to 2.0m in 0.1m increments",
          predictions: [
            {
              if: "Length is quadrupled",
              then: "Period will double",
              else: "Theory needs revision"
            }
          ],
          experimentId: "pendulum-length-exp",
          hypothesisId: "pendulum-period",
          controlMeasures: ["Constant mass", "Constant release angle", "Minimize air resistance"],
          results: "Period increases with square root of length as predicted",
          outcomeMatched: true
        },
        inquiryId: "pendulum-physics-study",
        iteration: 4,
        nextStageNeeded: true
      };

      const result = ScientificMethodSchema.parse(physicsExperiment);
      expect(result.experiment?.outcomeMatched).toBe(true);
      expect(result.hypothesis?.domain).toBe("Classical Mechanics");
    });
  });
}); 