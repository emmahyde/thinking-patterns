/**
 * Tests for ThoughtSchema and related schemas
 * Tests Zod validation, type inference, and edge cases
 */

import {
  ThoughtSchema,
  ToolRecommendationSchema,
  StepRecommendationSchema,
  CurrentStepSchema,
  ToolUsageHistorySchema,
  ToolContextSchema,
  type ThoughtData,
  type ToolRecommendation,
  type CurrentStep
} from '../../src/schemas/ThoughtSchema.js';
import {
  validThoughtData,
  validThoughtDataWithOptionals,
  finalThoughtData,
  invalidThoughtData
} from '../helpers/testFixtures.js';
import { createMockThoughtData, createMockToolRecommendation } from '../helpers/mockFactories.js';

describe('ThoughtSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid thought data', () => {
      const result = ThoughtSchema.parse(validThoughtData);

      expect(result).toBeValidThoughtData();
      expect(result.thought).toBe(validThoughtData.thought);
      expect(result.thought_number).toBe(validThoughtData.thought_number);
      expect(result.total_thoughts).toBe(validThoughtData.total_thoughts);
      expect(result.next_thought_needed).toBe(validThoughtData.next_thought_needed);
    });

    it('should validate thought data with all optional fields', () => {
      const result = ThoughtSchema.parse(validThoughtDataWithOptionals);

      expect(result).toBeValidThoughtData();
      expect(result.is_revision).toBe(true);
      expect(result.revises_thought).toBe(2);
      expect(result.branch_from_thought).toBe(1);
      expect(result.branch_id).toBe("branch-a");
      expect(result.needs_more_thoughts).toBe(true);
    });

    it('should validate final thought data', () => {
      const result = ThoughtSchema.parse(finalThoughtData);

      expect(result).toBeValidThoughtData();
      expect(result.next_thought_needed).toBe(false);
      expect(result.thought_number).toBe(result.total_thoughts);
    });

    it('should handle undefined optional fields correctly', () => {
      const input = {
        thought: "Test thought",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        // All optional fields undefined
      };

      const result = ThoughtSchema.parse(input);

      expect(result.is_revision).toBeUndefined();
      expect(result.revises_thought).toBeUndefined();
      expect(result.branch_from_thought).toBeUndefined();
      expect(result.branch_id).toBeUndefined();
      expect(result.needs_more_thoughts).toBeUndefined();
    });

    it('should validate thought data with complex nested structures', () => {
      const complexThought = {
        thought: "Complex thought with all nested data",
        thought_number: 2,
        total_thoughts: 5,
        next_thought_needed: true,
        current_step: {
          step_description: "Current analysis step",
          recommended_tools: [{
            tool_name: "sequentialthinking",
            confidence: 0.9,
            rationale: "Best for this type of analysis",
            priority: 1,
            alternative_tools: ["mentalmodel", "debugging"]
          }],
          expected_outcome: "Better understanding of the problem",
          next_step_conditions: ["Analysis complete", "Ready for synthesis"],
          step_number: 2,
          estimated_duration: "10 minutes",
          complexity_level: "high" as const
        },
        previous_steps: [{
          step_description: "Initial problem identification",
          recommended_tools: [{
            tool_name: "mentalmodel",
            confidence: 0.8,
            rationale: "Good for understanding problem structure",
            priority: 1
          }],
          expected_outcome: "Clear problem definition",
          next_step_conditions: ["Problem identified"]
        }],
        remaining_steps: ["Synthesis", "Conclusion", "Validation"],
        tool_usage_history: [{
          tool_name: "mentalmodel",
          used_at: "2024-01-01T10:00:00Z",
          effectiveness_score: 0.85
        }]
      };

      const result = ThoughtSchema.parse(complexThought);

      expect(result).toBeValidThoughtData();
      expect(result.current_step).toBeDefined();
      expect(result.current_step?.step_description).toBe("Current analysis step");
      expect(result.previous_steps).toHaveLength(1);
      expect(result.remaining_steps).toHaveLength(3);
      expect(result.tool_usage_history).toHaveLength(1);
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => ThoughtSchema.parse(invalidThoughtData.missingRequired))
        .toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() => ThoughtSchema.parse(invalidThoughtData.invalidTypes))
        .toThrow();
    });

    it('should reject negative numbers', () => {
      expect(() => ThoughtSchema.parse(invalidThoughtData.negativeNumbers))
        .toThrow();
    });

    it('should reject invalid optional field values', () => {
      expect(() => ThoughtSchema.parse(invalidThoughtData.invalidOptionals))
        .toThrow();
    });

    it('should provide detailed error messages for validation failures', () => {
      try {
        ThoughtSchema.parse({
          thought: 123, // Invalid type
          thought_number: "not a number", // Invalid type
          total_thoughts: -1, // Invalid value
          next_thought_needed: "yes" // Invalid type
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);

        // Check that error includes information about each invalid field
        const errorMessage = error.toString();
        expect(errorMessage).toContain('thought');
        expect(errorMessage).toContain('thought_number');
        expect(errorMessage).toContain('total_thoughts');
        expect(errorMessage).toContain('next_thought_needed');
      }
    });

    it('should reject null values for required fields', () => {
      expect(() => ThoughtSchema.parse({
        thought: null,
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true
      })).toThrow();
    });

    it('should reject empty strings for thought field', () => {
      expect(() => ThoughtSchema.parse({
        thought: "",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true
      })).toThrow();
    });

    it('should reject zero values for positive number fields', () => {
      expect(() => ThoughtSchema.parse({
        thought: "Valid thought",
        thought_number: 0, // Should be positive
        total_thoughts: 3,
        next_thought_needed: true
      })).toThrow();

      expect(() => ThoughtSchema.parse({
        thought: "Valid thought",
        thought_number: 1,
        total_thoughts: 0, // Should be positive
        next_thought_needed: true
      })).toThrow();
    });
  });

  describe('type inference', () => {
    it('should infer correct TypeScript types', () => {
      const validData: ThoughtData = {
        thought: "Type test",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true
      };

      // Type checking - these should compile without errors
      const thought: string = validData.thought;
      const thoughtNumber: number = validData.thought_number;
      const totalThoughts: number = validData.total_thoughts;
      const nextNeeded: boolean = validData.next_thought_needed;
      const isRevision: boolean | undefined = validData.is_revision;

      expect(thought).toBe("Type test");
      expect(thoughtNumber).toBe(1);
      expect(totalThoughts).toBe(3);
      expect(nextNeeded).toBe(true);
      expect(isRevision).toBeUndefined();
    });

    it('should maintain type safety for optional fields', () => {
      const parsed = ThoughtSchema.parse(validThoughtDataWithOptionals);

      // TypeScript should know these can be undefined
      if (parsed.is_revision !== undefined) {
        expect(typeof parsed.is_revision).toBe('boolean');
      }

      if (parsed.revises_thought !== undefined) {
        expect(typeof parsed.revises_thought).toBe('number');
      }

      if (parsed.branch_id !== undefined) {
        expect(typeof parsed.branch_id).toBe('string');
      }
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very long thought strings', () => {
      const longThought = "x".repeat(10000);
      const data = {
        thought: longThought,
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false
      };

      const result = ThoughtSchema.parse(data);
      expect(result.thought).toBe(longThought);
      expect(result.thought.length).toBe(10000);
    });

    it('should handle maximum safe integer values', () => {
      const data = {
        thought: "Large numbers test",
        thought_number: Number.MAX_SAFE_INTEGER,
        total_thoughts: Number.MAX_SAFE_INTEGER,
        next_thought_needed: true
      };

      const result = ThoughtSchema.parse(data);
      expect(result.thought_number).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.total_thoughts).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle Unicode and special characters in thought text', () => {
      const unicodeThought = "思考 🤔 with émojis and spëcial çharacters → ★ ♦";
      const data = {
        thought: unicodeThought,
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false
      };

      const result = ThoughtSchema.parse(data);
      expect(result.thought).toBe(unicodeThought);
    });

    it('should handle thought_number greater than total_thoughts', () => {
      // This might seem illogical but schema doesn't enforce this business rule
      const data = {
        thought: "Boundary test",
        thought_number: 5,
        total_thoughts: 3,
        next_thought_needed: false
      };

      const result = ThoughtSchema.parse(data);
      expect(result.thought_number).toBe(5);
      expect(result.total_thoughts).toBe(3);
    });

    it('should handle floating point numbers by rejecting them', () => {
      expect(() => ThoughtSchema.parse({
        thought: "Float test",
        thought_number: 1.5, // Should be integer
        total_thoughts: 3,
        next_thought_needed: true
      })).toThrow();
    });
  });

  describe('performance and stress testing', () => {
    it('should handle rapid successive validations', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        const data = createMockThoughtData({
          thought_number: i + 1,
          total_thoughts: 1000
        });

        const result = ThoughtSchema.parse(data);
        expect(result).toBeValidThoughtData();
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle validation of large arrays in nested structures', () => {
      const largeToolHistory = Array.from({ length: 100 }, (_, i) => ({
        tool_name: `tool_${i}`,
        used_at: new Date().toISOString(),
        effectiveness_score: Math.random()
      }));

      const data = {
        thought: "Large history test",
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        tool_usage_history: largeToolHistory
      };

      const result = ThoughtSchema.parse(data);
      expect(result.tool_usage_history).toHaveLength(100);
    });
  });
});

describe('ToolRecommendationSchema', () => {
  it('should validate valid tool recommendation', () => {
    const recommendation = createMockToolRecommendation();
    const result = ToolRecommendationSchema.parse(recommendation);

    expect(result.tool_name).toBe(recommendation.tool_name);
    expect(result.confidence).toBe(recommendation.confidence);
    expect(result.rationale).toBe(recommendation.rationale);
    expect(result.priority).toBe(recommendation.priority);
  });

  it('should reject invalid confidence values', () => {
    expect(() => ToolRecommendationSchema.parse({
      tool_name: "test",
      confidence: 1.5, // Must be <= 1
      rationale: "test",
      priority: 1
    })).toThrow();

    expect(() => ToolRecommendationSchema.parse({
      tool_name: "test",
      confidence: -0.1, // Must be >= 0
      rationale: "test",
      priority: 1
    })).toThrow();
  });
});

describe('CurrentStepSchema', () => {
  it('should validate current step with all fields', () => {
    const step = {
      step_description: "Test step",
      recommended_tools: [createMockToolRecommendation()],
      expected_outcome: "Test outcome",
      next_step_conditions: ["condition1", "condition2"],
      step_number: 1,
      estimated_duration: "5 minutes",
      complexity_level: "medium" as const
    };

    const result = CurrentStepSchema.parse(step);
    expect(result.complexity_level).toBe("medium");
    expect(result.step_number).toBe(1);
  });

  it('should reject invalid complexity levels', () => {
    expect(() => CurrentStepSchema.parse({
      step_description: "Test step",
      recommended_tools: [],
      expected_outcome: "Test outcome",
      next_step_conditions: [],
      complexity_level: "invalid" // Must be low, medium, or high
    })).toThrow();
  });
});

describe('ToolUsageHistorySchema', () => {
  it('should validate tool usage history entry', () => {
    const history = {
      tool_name: "sequentialthinking",
      used_at: "2024-01-01T10:00:00Z",
      effectiveness_score: 0.85
    };

    const result = ToolUsageHistorySchema.parse(history);
    expect(result.tool_name).toBe("sequentialthinking");
    expect(result.used_at).toBe("2024-01-01T10:00:00Z");
    expect(result.effectiveness_score).toBe(0.85);
  });

  it('should validate without effectiveness score', () => {
    const history = {
      tool_name: "mentalmodel",
      used_at: "2024-01-01T10:00:00Z"
    };

    const result = ToolUsageHistorySchema.parse(history);
    expect(result.effectiveness_score).toBeUndefined();
  });
});

describe('ToolContextSchema', () => {
  it('should validate tool context', () => {
    const context = {
      available_tools: ["sequentialthinking", "mentalmodel", "debugging"],
      user_preferences: { style: "detailed", format: "structured" },
      session_history: ["Previous thought 1", "Previous thought 2"],
      problem_domain: "analysis"
    };

    const result = ToolContextSchema.parse(context);
    expect(result.available_tools).toHaveLength(3);
    expect(result.user_preferences?.style).toBe("detailed");
  });

  it('should validate minimal tool context', () => {
    const context = {
      available_tools: ["sequentialthinking"]
    };

    const result = ToolContextSchema.parse(context);
    expect(result.user_preferences).toBeUndefined();
    expect(result.session_history).toBeUndefined();
    expect(result.problem_domain).toBeUndefined();
  });
});
