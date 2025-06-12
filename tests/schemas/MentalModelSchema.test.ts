/**
 * Tests for MentalModelSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  MentalModelSchema,
  type MentalModelData
} from '../../src/schemas/MentalModelSchema.js';

describe('MentalModelSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid mental model data', () => {
      const validData = {
        modelName: "Problem Decomposition Model",
        problem: "Complex software architecture design"
      };

      const result = MentalModelSchema.parse(validData);

      expect(result).toMatchObject({
        modelName: expect.any(String),
        problem: expect.any(String)
      });
      expect(result.modelName).toBe(validData.modelName);
      expect(result.problem).toBe(validData.problem);
      expect(result.steps).toBeUndefined();
      expect(result.reasoning).toBeUndefined();
      expect(result.conclusion).toBeUndefined();
    });

    it('should validate mental model data with all optional fields', () => {
      const validData = {
        modelName: "Systems Thinking Model",
        problem: "Understanding organizational dynamics",
        steps: [
          "Identify key stakeholders",
          "Map relationships and dependencies",
          "Analyze feedback loops",
          "Identify leverage points"
        ],
        reasoning: "Systems thinking helps understand complex interactions and emergent behaviors in organizations",
        conclusion: "The organization exhibits classic symptoms of a learning organization with strong feedback mechanisms"
      };

      const result = MentalModelSchema.parse(validData);

      expect(result).toMatchObject({
        modelName: expect.any(String),
        problem: expect.any(String),
        steps: expect.any(Array),
        reasoning: expect.any(String),
        conclusion: expect.any(String)
      });
      expect(result.steps).toHaveLength(4);
      expect(result.steps?.[0]).toBe("Identify key stakeholders");
      expect(result.reasoning).toContain("Systems thinking");
      expect(result.conclusion).toContain("learning organization");
    });

    it('should handle empty optional arrays', () => {
      const validData = {
        modelName: "Empty Steps Model",
        problem: "Testing empty arrays",
        steps: [],
        reasoning: "Testing with empty steps array",
        conclusion: "Empty arrays should be valid"
      };

      const result = MentalModelSchema.parse(validData);

      expect(result.steps).toEqual([]);
      expect(result.steps).toHaveLength(0);
    });

    it('should validate complex mental models with detailed steps', () => {
      const complexModel = {
        modelName: "Root Cause Analysis Model",
        problem: "Production system failures occurring intermittently",
        steps: [
          "Gather failure data and logs",
          "Identify patterns in failure timing",
          "Map system dependencies",
          "Analyze resource utilization trends",
          "Review recent changes and deployments",
          "Test hypotheses in staging environment",
          "Implement monitoring improvements",
          "Document findings and preventive measures"
        ],
        reasoning: "Root cause analysis requires systematic investigation of symptoms, patterns, and underlying causes. The intermittent nature suggests environmental factors or race conditions rather than deterministic bugs.",
        conclusion: "The failures correlate with peak traffic periods and appear to be caused by resource contention in the database connection pool, exacerbated by a recent configuration change that reduced connection timeout values."
      };

      const result = MentalModelSchema.parse(complexModel);

      expect(result.steps).toHaveLength(8);
      expect(result.reasoning).toContain("systematic investigation");
      expect(result.conclusion).toContain("database connection pool");
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => MentalModelSchema.parse({})).toThrow();
      
      expect(() => MentalModelSchema.parse({
        modelName: "Valid Model"
        // missing problem
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        problem: "Valid Problem"
        // missing modelName
      })).toThrow();
    });

    it('should reject empty strings for required fields', () => {
      expect(() => MentalModelSchema.parse({
        modelName: "",
        problem: "Valid problem"
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: ""
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "",
        problem: ""
      })).toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() => MentalModelSchema.parse({
        modelName: 123,
        problem: "Valid problem"
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: 456
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: "Valid problem",
        steps: "not an array"
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: "Valid problem",
        reasoning: 789
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: "Valid problem",
        conclusion: true
      })).toThrow();
    });

    it('should reject null values', () => {
      expect(() => MentalModelSchema.parse({
        modelName: null,
        problem: "Valid problem"
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: null
      })).toThrow();
    });

    it('should reject arrays with non-string elements in steps', () => {
      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: "Valid problem",
        steps: [123, "valid step", true]
      })).toThrow();

      expect(() => MentalModelSchema.parse({
        modelName: "Valid model",
        problem: "Valid problem",
        steps: ["valid step", null, "another valid step"]
      })).toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        MentalModelSchema.parse({
          modelName: 123,
          problem: "",
          steps: "not an array",
          reasoning: null
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);

        const errorMessage = error.toString();
        expect(errorMessage).toContain('modelName');
        expect(errorMessage).toContain('problem');
      }
    });
  });

  describe('type inference', () => {
    it('should infer correct TypeScript types', () => {
      const validData: MentalModelData = {
        modelName: "Type Test Model",
        problem: "Testing TypeScript type inference"
      };

      // Type checking - these should compile without errors
      const modelName: string = validData.modelName;
      const problem: string = validData.problem;
      const steps: string[] | undefined = validData.steps;
      const reasoning: string | undefined = validData.reasoning;
      const conclusion: string | undefined = validData.conclusion;

      expect(modelName).toBe("Type Test Model");
      expect(problem).toBe("Testing TypeScript type inference");
      expect(steps).toBeUndefined();
      expect(reasoning).toBeUndefined();
      expect(conclusion).toBeUndefined();
    });

    it('should maintain type safety for optional fields', () => {
      const parsed = MentalModelSchema.parse({
        modelName: "Optional Fields Test",
        problem: "Testing optional field types",
        steps: ["step1", "step2"],
        reasoning: "Some reasoning",
        conclusion: "Some conclusion"
      });

      // TypeScript should know these can be undefined
      if (parsed.steps !== undefined) {
        expect(Array.isArray(parsed.steps)).toBe(true);
        expect(parsed.steps.length).toBe(2);
      }

      if (parsed.reasoning !== undefined) {
        expect(typeof parsed.reasoning).toBe('string');
      }

      if (parsed.conclusion !== undefined) {
        expect(typeof parsed.conclusion).toBe('string');
      }
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very long strings', () => {
      const longModelName = "x".repeat(1000);
      const longProblem = "y".repeat(2000);
      const longReasoning = "z".repeat(5000);

      const data = {
        modelName: longModelName,
        problem: longProblem,
        reasoning: longReasoning
      };

      const result = MentalModelSchema.parse(data);
      expect(result.modelName.length).toBe(1000);
      expect(result.problem.length).toBe(2000);
      expect(result.reasoning?.length).toBe(5000);
    });

    it('should handle Unicode and special characters', () => {
      const unicodeData = {
        modelName: "思考模型 🧠 with émojis and spëcial çharacters → ★",
        problem: "Problème avec des caractères spéciaux: αβγδε ∑∏∫ ♠♣♥♦",
        steps: [
          "Step with emoji 🚀",
          "Step with math symbols: ∀x∈ℝ",
          "Step with currency: $€£¥"
        ],
        reasoning: "Reasoning with quotes: \"double\" and 'single' and `backticks`",
        conclusion: "Conclusion with newlines:\nLine 1\nLine 2\tTabbed"
      };

      const result = MentalModelSchema.parse(unicodeData);
      expect(result.modelName).toContain("思考模型");
      expect(result.problem).toContain("αβγδε");
      expect(result.steps?.[0]).toContain("🚀");
      expect(result.reasoning).toContain("\"double\"");
      expect(result.conclusion).toContain("\n");
    });

    it('should handle large arrays of steps', () => {
      const manySteps = Array.from({ length: 100 }, (_, i) => `Step ${i + 1}: Detailed description of step ${i + 1}`);

      const data = {
        modelName: "Large Steps Model",
        problem: "Testing with many steps",
        steps: manySteps
      };

      const result = MentalModelSchema.parse(data);
      expect(result.steps).toHaveLength(100);
      expect(result.steps?.[99]).toBe("Step 100: Detailed description of step 100");
    });

    it('should handle whitespace-only strings as valid', () => {
      // Note: The schema uses .min(1) which checks length, not trimmed content
      const data = {
        modelName: "   ",
        problem: "\t\n\r  ",
        reasoning: "     ",
        conclusion: "\n\n\n"
      };

      const result = MentalModelSchema.parse(data);
      expect(result.modelName).toBe("   ");
      expect(result.problem).toBe("\t\n\r  ");
    });
  });

  describe('performance and stress testing', () => {
    it('should handle rapid successive validations', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        const data = {
          modelName: `Model ${i}`,
          problem: `Problem ${i}`,
          steps: [`Step 1 for model ${i}`, `Step 2 for model ${i}`],
          reasoning: `Reasoning for model ${i}`,
          conclusion: `Conclusion for model ${i}`
        };

        const result = MentalModelSchema.parse(data);
        expect(result.modelName).toBe(`Model ${i}`);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle validation of deeply nested or complex data efficiently', () => {
      const complexData = {
        modelName: "Performance Test Model",
        problem: "Testing validation performance with complex data structures",
        steps: Array.from({ length: 50 }, (_, i) => 
          `Complex step ${i}: ${JSON.stringify({ substep: i, details: `Detail ${i}`.repeat(10) })}`
        ),
        reasoning: "Complex reasoning: " + JSON.stringify({
          factors: Array.from({ length: 20 }, (_, i) => `Factor ${i}`),
          analysis: "Deep analysis".repeat(100),
          metadata: { timestamp: new Date().toISOString(), version: "1.0" }
        }),
        conclusion: "Complex conclusion with embedded data: " + Array.from({ length: 10 }, (_, i) => 
          `Point ${i}: ${"x".repeat(100)}`
        ).join(" | ")
      };

      const start = Date.now();
      const result = MentalModelSchema.parse(complexData);
      const elapsed = Date.now() - start;

      expect(result.steps).toHaveLength(50);
      expect(result.reasoning).toContain("Complex reasoning");
      expect(elapsed).toBeLessThan(100); // Should be very fast
    });
  });

  describe('real-world usage patterns', () => {
    it('should validate common mental model patterns', () => {
      const commonModels = [
        {
          modelName: "First Principles Thinking",
          problem: "Understanding complex system behavior",
          steps: [
            "Break down to fundamental truths",
            "Question assumptions",
            "Rebuild from basics"
          ]
        },
        {
          modelName: "Systems Thinking",
          problem: "Organizational change management",
          steps: [
            "Identify system boundaries",
            "Map stakeholders and relationships",
            "Find leverage points"
          ]
        },
        {
          modelName: "Design Thinking",
          problem: "User experience improvement",
          steps: [
            "Empathize with users",
            "Define problem statement",
            "Ideate solutions",
            "Prototype and test"
          ]
        }
      ];

      commonModels.forEach(model => {
        const result = MentalModelSchema.parse(model);
        expect(result.modelName).toBeTruthy();
        expect(result.problem).toBeTruthy();
        expect(result.steps?.length).toBeGreaterThan(0);
      });
    });

    it('should handle incomplete models (work in progress)', () => {
      const incompleteModel = {
        modelName: "Work in Progress Model",
        problem: "Still defining the problem space",
        steps: ["Initial step identified"],
        reasoning: "Still working through the reasoning...",
        // conclusion intentionally omitted
      };

      const result = MentalModelSchema.parse(incompleteModel);
      expect(result.conclusion).toBeUndefined();
      expect(result.steps).toHaveLength(1);
    });
  });
}); 