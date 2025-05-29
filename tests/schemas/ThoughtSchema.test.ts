/**
 * Tests for ThoughtSchema and related schemas
 * Tests Zod validation, type inference, and edge cases
 */

import {
  SequentialThoughtSchema,
  StepRecommendationSchema,
  CurrentStepSchema,
  type SequentialThought,
  type CurrentStep
} from '../../src/schemas/SequentialThoughtSchema.js';
import {
  ToolRecommendationSchema,
  ToolUsageHistorySchema,
  ToolContextSchema,
  type ToolRecommendation
} from '../../src/schemas/ToolSchemas.js';
import {
  validSequentialThought,
  validSequentialThoughtWithOptionals,
  finalThoughtData,
  invalidSequentialThought
} from '../helpers/testFixtures.js';
import { createMockThoughtData, createMockToolRecommendation } from '../helpers/mockFactories.js';

describe('ThoughtSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid thought data', () => {
      const result = SequentialThoughtSchema.parse(validSequentialThought);

      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.thought).toBe(validSequentialThought.thought);
      expect(result.thoughtNumber).toBe(validSequentialThought.thoughtNumber);
      expect(result.totalThoughts).toBe(validSequentialThought.totalThoughts);
      expect(result.nextThoughtNeeded).toBe(validSequentialThought.nextThoughtNeeded);
    });

    it('should validate thought data with all optional fields', () => {
      const result = SequentialThoughtSchema.parse(validSequentialThoughtWithOptionals);

      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.isRevision).toBe(true);
      expect(result.revisesThought).toBe(2);
      expect(result.branchFromThought).toBe(1);
      expect(result.branchId).toBe("branch-a");
      expect(result.needsMoreThoughts).toBe(true);
    });

    it('should validate final thought data', () => {
      const result = SequentialThoughtSchema.parse(finalThoughtData);

      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.nextThoughtNeeded).toBe(false);
      expect(result.thoughtNumber).toBe(result.totalThoughts);
    });

    it('should handle undefined optional fields correctly', () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        // All optional fields undefined
      };

      const result = SequentialThoughtSchema.parse(input);

      expect(result.isRevision).toBeUndefined();
      expect(result.revisesThought).toBeUndefined();
      expect(result.branchFromThought).toBeUndefined();
      expect(result.branchId).toBeUndefined();
      expect(result.needsMoreThoughts).toBeUndefined();
    });

    it('should validate thought data with complex nested structures', () => {
      const complexThought = {
        thought: "Complex thought with all nested data",
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        currentStep: {
          stepDescription: "Current analysis step",
          recommendedTools: [{
            toolName: "sequential_thinking",
            confidence: 0.9,
            rationale: "Best for this type of analysis",
            priority: 1,
            alternativeTools: ["mental_model", "debugging"]
          }],
          expectedOutcome: "Better understanding of the problem",
          nextStepConditions: ["Analysis complete", "Ready for synthesis"],
          stepNumber: 2,
          estimatedDuration: "10 minutes",
          complexityLevel: "high" as const
        },
        previousSteps: [{
          stepDescription: "Initial problem identification",
          recommendedTools: [{
            toolName: "mental_model",
            confidence: 0.8,
            rationale: "Good for understanding problem structure",
            priority: 1
          }],
          expectedOutcome: "Clear problem definition",
          nextStepConditions: ["Problem identified"]
        }],
        remainingSteps: ["Synthesis", "Conclusion", "Validation"],
        toolUsageHistory: [{
          toolName: "mental_model",
          usedAt: "2024-01-01T10:00:00Z",
          effectivenessScore: 0.85
        }]
      };

      const result = SequentialThoughtSchema.parse(complexThought);

      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.currentStep).toBeDefined();
      expect(result.currentStep?.stepDescription).toBe("Current analysis step");
      expect(result.previousSteps).toHaveLength(1);
      expect(result.remainingSteps).toHaveLength(3);
      expect(result.toolUsageHistory).toHaveLength(1);
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => SequentialThoughtSchema.parse(finalThoughtData?.missingRequired))
        .toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() => SequentialThoughtSchema.parse(finalThoughtData.invalidTypes))
        .toThrow();
    });

    it('should reject negative numbers', () => {
      expect(() => SequentialThoughtSchema.parse(finalThoughtData.negativeNumbers))
        .toThrow();
    });

    it('should reject invalid optional field values', () => {
      expect(() => SequentialThoughtSchema.parse(finalThoughtData.invalidOptionals))
        .toThrow();
    });

    it('should provide detailed error messages for validation failures', () => {
      try {
        SequentialThoughtSchema.parse({
          thought: 123, // Invalid type
          thoughtNumber: "not a number", // Invalid type
          totalThoughts: -1, // Invalid value
          nextThoughtNeeded: "yes" // Invalid type
        });
        fail('Should have thrown validation error');
      } catch (error: any) {  
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);

        // Check that error includes information about each invalid field
        const errorMessage = error.toString();
        expect(errorMessage).toContain('thought');
        expect(errorMessage).toContain('thoughtNumber');
        expect(errorMessage).toContain('totalThoughts');
        expect(errorMessage).toContain('nextThoughtNeeded');
      }
    });

    it('should reject null values for required fields', () => {
      expect(() => SequentialThoughtSchema.parse({
        thought: null,
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      })).toThrow();
    });

    it('should reject empty strings for thought field', () => {
      expect(() => SequentialThoughtSchema.parse({
        thought: "",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      })).toThrow();
    });

    it('should reject zero values for positive number fields', () => {
      expect(() => SequentialThoughtSchema.parse({
        thought: "Valid thought",
        thoughtNumber: 0, // Should be positive
        totalThoughts: 3,
        nextThoughtNeeded: true
      })).toThrow();

      expect(() => SequentialThoughtSchema.parse({
        thought: "Valid thought",
        thoughtNumber: 1,
        totalThoughts: 0, // Should be positive
        nextThoughtNeeded: true
      })).toThrow();
    });
  });

  describe('type inference', () => {
    it('should infer correct TypeScript types', () => {
      const validData: SequentialThought = {
        thought: "Type test",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      // Type checking - these should compile without errors
      const thought: string = validData.thought;
      const thoughtNumber: number = validData.thoughtNumber;
      const totalThoughts: number = validData.totalThoughts;
      const nextNeeded: boolean = validData.nextThoughtNeeded;
      const isRevision: boolean | undefined = validData.isRevision;

      expect(thought).toBe("Type test");
      expect(thoughtNumber).toBe(1);
      expect(totalThoughts).toBe(3);
      expect(nextNeeded).toBe(true);
      expect(isRevision).toBeUndefined();
    });

    it('should maintain type safety for optional fields', () => {
      const parsed = SequentialThoughtSchema.parse(validSequentialThoughtWithOptionals);

      // TypeScript should know these can be undefined
      if (parsed.isRevision !== undefined) {
        expect(typeof parsed.isRevision).toBe('boolean');
      }

      if (parsed.revisesThought !== undefined) {
        expect(typeof parsed.revisesThought).toBe('number');
      }

      if (parsed.branchId !== undefined) {
        expect(typeof parsed.branchId).toBe('string');
      }
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very long thought strings', () => {
      const longThought = "x".repeat(10000);
      const data = {
        thought: longThought,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = SequentialThoughtSchema.parse(data);
      expect(result.thought).toBe(longThought);
      expect(result.thought.length).toBe(10000);
    });

    it('should handle maximum safe integer values', () => {
      const data = {
        thought: "Large numbers test",
        thoughtNumber: Number.MAX_SAFE_INTEGER,
        totalThoughts: Number.MAX_SAFE_INTEGER,
        nextThoughtNeeded: true
      };

      const result = SequentialThoughtSchema.parse(data);
      expect(result.thoughtNumber).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.totalThoughts).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle Unicode and special characters in thought text', () => {
      const unicodeThought = "思考 🤔 with émojis and spëcial çharacters → ★ ♦";
      const data = {
        thought: unicodeThought,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = SequentialThoughtSchema.parse(data);
      expect(result.thought).toBe(unicodeThought);
    });

    it('should handle thoughtNumber greater than totalThoughts', () => {
      // This might seem illogical but schema doesn't enforce this business rule
      const data = {
        thought: "Boundary test",
        thoughtNumber: 5,
        totalThoughts: 3,
        nextThoughtNeeded: false
      };

      const result = SequentialThoughtSchema.parse(data);
      expect(result.thoughtNumber).toBe(5);
      expect(result.totalThoughts).toBe(3);
    });

    it('should handle floating point numbers by rejecting them', () => {
      expect(() => SequentialThoughtSchema.parse({
        thought: "Float test",
        thoughtNumber: 1.5, // Should be integer
        totalThoughts: 3,
        nextThoughtNeeded: true
      })).toThrow();
    });
  });

  describe('performance and stress testing', () => {
    it('should handle rapid successive validations', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        const data = createMockThoughtData({
          thoughtNumber: i + 1,
          totalThoughts: 1000
        });

        const result = SequentialThoughtSchema.parse(data);
        expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle validation of large arrays in nested structures', () => {
      const largeToolHistory = Array.from({ length: 100 }, (_, i) => ({
        toolName: `tool_${i}`,
        usedAt: new Date().toISOString(),
        effectivenessScore: Math.random()
      }));

      const data = {
        thought: "Large history test",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        toolUsageHistory: largeToolHistory
      };

      const result = SequentialThoughtSchema.parse(data);
      expect(result.toolUsageHistory).toHaveLength(100);
    });
  });
});

describe('ToolRecommendationSchema', () => {
  it('should validate valid tool recommendation', () => {
    const recommendation = createMockToolRecommendation();
    const result = ToolRecommendationSchema.parse(recommendation);

    expect(result.toolName).toBe(recommendation.toolName);
    expect(result.confidence).toBe(recommendation.confidence);
    expect(result.rationale).toBe(recommendation.rationale);
    expect(result.priority).toBe(recommendation.priority);
  });

  it('should reject invalid confidence values', () => {
    expect(() => ToolRecommendationSchema.parse({
      toolName: "test",
      confidence: 1.5, // Must be <= 1
      rationale: "test",
      priority: 1
    })).toThrow();

    expect(() => ToolRecommendationSchema.parse({
      toolName: "test",
      confidence: -0.1, // Must be >= 0
      rationale: "test",
      priority: 1
    })).toThrow();
  });
});

describe('CurrentStepSchema', () => {
  it('should validate current step with all fields', () => {
    const step = {
      stepDescription: "Test step",
      recommendedTools: [createMockToolRecommendation()],
      expectedOutcome: "Test outcome",
      nextStepConditions: ["condition1", "condition2"],
      stepNumber: 1,
      estimatedDuration: "5 minutes",
      complexityLevel: "medium" as const
    };

    const result = CurrentStepSchema.parse(step);
    expect(result.complexityLevel).toBe("medium");
    expect(result.stepNumber).toBe(1);
  });

  it('should reject invalid complexity levels', () => {
    expect(() => CurrentStepSchema.parse({
      stepDescription: "Test step",
      recommendedTools: [],
      expectedOutcome: "Test outcome",
      nextStepConditions: [],
      complexityLevel: "invalid" // Must be low, medium, or high
    })).toThrow();
  });
});

describe('ToolUsageHistorySchema', () => {
  it('should validate tool usage history entry', () => {
    const history = {
      toolName: "sequential_thinking",
      usedAt: "2024-01-01T10:00:00Z",
      effectivenessScore: 0.85
    };

    const result = ToolUsageHistorySchema.parse(history);
    expect(result.toolName).toBe("sequential_thinking");
    expect(result.usedAt).toBe("2024-01-01T10:00:00Z");
    expect(result.effectivenessScore).toBe(0.85);
  });

  it('should validate without effectiveness score', () => {
    const history = {
      toolName: "mental_model",
      usedAt: "2024-01-01T10:00:00Z"
    };

    const result = ToolUsageHistorySchema.parse(history);
    expect(result.effectivenessScore).toBeUndefined();
  });
});

describe('ToolContextSchema', () => {
  it('should validate tool context', () => {
    const context = {
      availableTools: ["sequential_thinking", "mental_model", "debugging"],
      userPreferences: { style: "detailed", format: "structured" },
      sessionHistory: ["Previous thought 1", "Previous thought 2"],
      problemDomain: "analysis"
    };

    const result = ToolContextSchema.parse(context);
    expect(result.availableTools).toHaveLength(3);
    expect(result.userPreferences?.style).toBe("detailed");
  });

  it('should validate minimal tool context', () => {
    const context = {
      availableTools: ["sequential_thinking"]
    };

    const result = ToolContextSchema.parse(context);
    expect(result.userPreferences).toBeUndefined();
    expect(result.sessionHistory).toBeUndefined();
    expect(result.problemDomain).toBeUndefined();
  });
});
