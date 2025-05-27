/**
 * Integration tests for all schemas
 * Tests schema interactions, compatibility, and integration patterns
 */

import { z } from 'zod';
import {
  ThoughtSchema,
  ToolRecommendationSchema,
  StepRecommendationSchema,
  CurrentStepSchema,
  ToolUsageHistorySchema,
  ToolContextSchema,
  type ThoughtData,
  type ToolRecommendation,
  type StepRecommendation,
  type CurrentStep,
  type ToolUsageHistory,
  type ToolContext
} from '../../src/schemas/ThoughtSchema.js';
import {
  createMockThoughtData,
  createMockToolRecommendation,
  createMockCurrentStep,
  generateLargeThoughtHistory,
  generateLargeToolRecommendations
} from '../helpers/mockFactories.js';

describe('Schema Integration Tests', () => {
  describe('cross-schema validation', () => {
    it('should validate complete thought workflow with all schemas', () => {
      // Create a complete workflow that uses all schemas
      const toolRecommendations: ToolRecommendation[] = [
        ToolRecommendationSchema.parse({
          tool_name: "sequentialthinking",
          confidence: 0.9,
          rationale: "Best for systematic analysis",
          priority: 1,
          alternative_tools: ["mentalmodel", "debugging"]
        }),
        ToolRecommendationSchema.parse({
          tool_name: "mentalmodel",
          confidence: 0.7,
          rationale: "Good for understanding structure",
          priority: 2
        })
      ];

      const currentStep: CurrentStep = CurrentStepSchema.parse({
        step_description: "Analyze the problem systematically",
        recommended_tools: toolRecommendations,
        expected_outcome: "Clear understanding of the problem",
        next_step_conditions: ["Analysis complete", "Key insights identified"],
        step_number: 2,
        estimated_duration: "15 minutes",
        complexity_level: "high"
      });

      const previousSteps: StepRecommendation[] = [
        StepRecommendationSchema.parse({
          step_description: "Initial problem identification",
          recommended_tools: toolRecommendations.slice(1),
          expected_outcome: "Problem clearly defined",
          next_step_conditions: ["Problem scope understood"]
        })
      ];

      const toolHistory: ToolUsageHistory[] = [
        ToolUsageHistorySchema.parse({
          tool_name: "mentalmodel",
          used_at: "2024-01-01T10:00:00Z",
          effectiveness_score: 0.85
        }),
        ToolUsageHistorySchema.parse({
          tool_name: "sequentialthinking",
          used_at: "2024-01-01T10:15:00Z",
          effectiveness_score: 0.92
        })
      ];

      const thoughtData: ThoughtData = ThoughtSchema.parse({
        thought: "Based on the mental model analysis, I need to break this down systematically",
        thought_number: 2,
        total_thoughts: 5,
        next_thought_needed: true,
        is_revision: false,
        current_step: currentStep,
        previous_steps: previousSteps,
        remaining_steps: ["Synthesis", "Conclusion", "Validation"],
        tool_usage_history: toolHistory
      });

      // Verify the integrated structure
      expect(thoughtData).toBeValidThoughtData();
      expect(thoughtData.current_step?.recommended_tools).toHaveLength(2);
      expect(thoughtData.previous_steps).toHaveLength(1);
      expect(thoughtData.tool_usage_history).toHaveLength(2);
      expect(thoughtData.remaining_steps).toHaveLength(3);

      // Verify tool recommendations are properly nested
      expect(thoughtData.current_step?.recommended_tools[0].tool_name).toBe("sequentialthinking");
      expect(thoughtData.current_step?.recommended_tools[0].confidence).toBe(0.9);

      // Verify tool history integration
      expect(thoughtData.tool_usage_history?.[1].tool_name).toBe("sequentialthinking");
      expect(thoughtData.tool_usage_history?.[1].effectiveness_score).toBe(0.92);
    });

    it('should validate tool context integration with other schemas', () => {
      const context: ToolContext = ToolContextSchema.parse({
        available_tools: ["sequentialthinking", "mentalmodel", "debugging", "stochastic"],
        user_preferences: {
          style: "detailed",
          format: "structured",
          verbosity: "high"
        },
        session_history: [
          "Previous analysis of similar problem",
          "Used mental model successfully",
          "Sequential thinking helped break down complexity"
        ],
        problem_domain: "complex_analysis"
      });

      // Create thought data that references tools from the context
      const thoughtWithContext: ThoughtData = ThoughtSchema.parse({
        thought: "Using the available tools from context to approach this problem",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        current_step: {
          step_description: "Select appropriate tools based on context",
          recommended_tools: context.available_tools.slice(0, 2).map(toolName => ({
            tool_name: toolName,
            confidence: 0.8,
            rationale: `Tool ${toolName} is available in context`,
            priority: 1
          })),
          expected_outcome: "Optimal tool selection",
          next_step_conditions: ["Tools selected", "Context considered"]
        }
      });

      expect(thoughtWithContext).toBeValidThoughtData();
      expect(thoughtWithContext.current_step?.recommended_tools).toHaveLength(2);
      expect(thoughtWithContext.current_step?.recommended_tools[0].tool_name).toBe("sequentialthinking");
      expect(thoughtWithContext.current_step?.recommended_tools[1].tool_name).toBe("mentalmodel");
    });
  });

  describe('schema composition and nesting', () => {
    it('should handle deeply nested schema structures', () => {
      const deeplyNestedThought = {
        thought: "This tests deep nesting of all schema types",
        thought_number: 3,
        total_thoughts: 5,
        next_thought_needed: true,
        current_step: {
          step_description: "Deep analysis step",
          recommended_tools: [
            {
              tool_name: "sequentialthinking",
              confidence: 0.95,
              rationale: "Perfect for deep analysis",
              priority: 1,
              alternative_tools: ["mentalmodel", "debugging", "stochastic"]
            },
            {
              tool_name: "collaborative",
              confidence: 0.8,
              rationale: "Good for complex problems",
              priority: 2,
              alternative_tools: ["mentalmodel"]
            }
          ],
          expected_outcome: "Comprehensive understanding",
          next_step_conditions: [
            "All aspects analyzed",
            "Edge cases considered",
            "Alternative approaches evaluated"
          ],
          step_number: 3,
          estimated_duration: "25 minutes",
          complexity_level: "high" as const
        },
        previous_steps: [
          {
            step_description: "Initial exploration",
            recommended_tools: [
              {
                tool_name: "mentalmodel",
                confidence: 0.7,
                rationale: "Good starting point",
                priority: 1
              }
            ],
            expected_outcome: "Problem framework",
            next_step_conditions: ["Framework established"]
          },
          {
            step_description: "Detailed analysis",
            recommended_tools: [
              {
                tool_name: "debugging",
                confidence: 0.85,
                rationale: "Systematic approach needed",
                priority: 1
              },
              {
                tool_name: "sequentialthinking",
                confidence: 0.9,
                rationale: "Step-by-step breakdown",
                priority: 2
              }
            ],
            expected_outcome: "Detailed understanding",
            next_step_conditions: ["Analysis complete", "Patterns identified"]
          }
        ],
        remaining_steps: [
          "Synthesis and integration",
          "Solution formulation"
        ],
        tool_usage_history: [
          {
            tool_name: "mentalmodel",
            used_at: "2024-01-01T09:00:00Z",
            effectiveness_score: 0.7
          },
          {
            tool_name: "debugging",
            used_at: "2024-01-01T09:30:00Z",
            effectiveness_score: 0.85
          },
          {
            tool_name: "sequentialthinking",
            used_at: "2024-01-01T10:00:00Z",
            effectiveness_score: 0.9
          }
        ]
      };

      const result = ThoughtSchema.parse(deeplyNestedThought);

      expect(result).toBeValidThoughtData();
      expect(result.current_step?.recommended_tools).toHaveLength(2);
      expect(result.previous_steps).toHaveLength(2);
      expect(result.tool_usage_history).toHaveLength(3);

      // Verify nested tool recommendations
      expect(result.current_step?.recommended_tools[0].alternative_tools).toHaveLength(3);
      expect(result.previous_steps?.[1].recommended_tools).toHaveLength(2);

      // Verify consistency across the structure
      const allRecommendedTools = [
        ...(result.current_step?.recommended_tools || []),
        ...(result.previous_steps?.flatMap(step => step.recommended_tools) || [])
      ];
      const allHistoryTools = result.tool_usage_history?.map(h => h.tool_name) || [];

      // Some recommended tools should appear in history
      const recommendedToolNames = allRecommendedTools.map(t => t.tool_name);
      const intersection = recommendedToolNames.filter(name => allHistoryTools.includes(name));
      expect(intersection.length).toBeGreaterThan(0);
    });

    it('should validate schema arrays with mixed complexity', () => {
      const mixedComplexitySteps: StepRecommendation[] = [
        // Simple step
        {
          step_description: "Simple initial step",
          recommended_tools: [{
            tool_name: "mentalmodel",
            confidence: 0.8,
            rationale: "Basic framework",
            priority: 1
          }],
          expected_outcome: "Basic understanding",
          next_step_conditions: ["Basics covered"]
        },
        // Complex step
        {
          step_description: "Complex analytical step",
          recommended_tools: [
            {
              tool_name: "sequentialthinking",
              confidence: 0.95,
              rationale: "Systematic breakdown needed",
              priority: 1,
              alternative_tools: ["debugging", "stochastic", "collaborative"]
            },
            {
              tool_name: "debugging",
              confidence: 0.85,
              rationale: "Error checking required",
              priority: 2,
              alternative_tools: ["sequentialthinking"]
            }
          ],
          expected_outcome: "Comprehensive analysis complete",
          next_step_conditions: [
            "All variables considered",
            "Edge cases identified",
            "Alternative solutions explored"
          ]
        }
      ];

      // Validate each step individually
      const validatedSteps = mixedComplexitySteps.map(step =>
        StepRecommendationSchema.parse(step)
      );

      expect(validatedSteps).toHaveLength(2);
      expect(validatedSteps[0].recommended_tools).toHaveLength(1);
      expect(validatedSteps[1].recommended_tools).toHaveLength(2);
      expect(validatedSteps[1].recommended_tools[0].alternative_tools).toHaveLength(3);

      // Use in a ThoughtData structure
      const thoughtWithMixedSteps = ThoughtSchema.parse({
        thought: "Processing steps of varying complexity",
        thought_number: 2,
        total_thoughts: 3,
        next_thought_needed: true,
        previous_steps: validatedSteps
      });

      expect(thoughtWithMixedSteps.previous_steps).toHaveLength(2);
    });
  });

  describe('schema performance and scalability', () => {
    it('should handle large-scale schema validation efficiently', () => {
      const start = Date.now();

      // Generate large datasets
      const largeThoughtHistory = generateLargeThoughtHistory(50);
      const largeToolRecommendations = generateLargeToolRecommendations(25);

      // Validate all thought data
      const validatedThoughts = largeThoughtHistory.map(thought =>
        ThoughtSchema.parse(thought)
      );

      // Validate all tool recommendations
      const validatedRecommendations = largeToolRecommendations.map(rec =>
        ToolRecommendationSchema.parse(rec)
      );

      const elapsed = Date.now() - start;

      expect(validatedThoughts).toHaveLength(50);
      expect(validatedRecommendations).toHaveLength(25);
      expect(elapsed).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle complex nested structures without performance degradation', () => {
      const complexThoughtData = createMockThoughtData({
        current_step: createMockCurrentStep({
          recommended_tools: generateLargeToolRecommendations(10)
        }),
        previous_steps: Array.from({ length: 5 }, () => ({
          step_description: "Previous step",
          recommended_tools: generateLargeToolRecommendations(5),
          expected_outcome: "Step outcome",
          next_step_conditions: ["Condition 1", "Condition 2"]
        })),
        tool_usage_history: Array.from({ length: 20 }, (_, i) => ({
          tool_name: `tool_${i}`,
          used_at: new Date().toISOString(),
          effectiveness_score: Math.random()
        }))
      });

      const start = Date.now();
      const result = ThoughtSchema.parse(complexThoughtData);
      const elapsed = Date.now() - start;

      expect(result).toBeValidThoughtData();
      expect(result.current_step?.recommended_tools).toHaveLength(10);
      expect(result.previous_steps).toHaveLength(5);
      expect(result.tool_usage_history).toHaveLength(20);
      expect(elapsed).toBeLessThan(100); // Should be very fast for single validation
    });
  });

  describe('schema error handling and recovery', () => {
    it('should provide detailed error paths for nested validation failures', () => {
      const invalidNestedStructure = {
        thought: "Valid thought",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        current_step: {
          step_description: "Valid description",
          recommended_tools: [
            {
              tool_name: "valid_tool",
              confidence: 1.5, // Invalid - greater than 1
              rationale: "Valid rationale",
              priority: 1
            },
            {
              tool_name: "", // Invalid - empty string
              confidence: 0.8,
              rationale: "Valid rationale",
              priority: "invalid" // Invalid - should be number
            }
          ],
          expected_outcome: "Valid outcome",
          next_step_conditions: ["Valid condition"]
        }
      };

      try {
        ThoughtSchema.parse(invalidNestedStructure);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();

        // Should have errors for nested paths
        const errorPaths = error.errors.map((err: any) => err.path.join('.'));
        expect(errorPaths.some((path: string) => path.includes('current_step'))).toBe(true);
        expect(errorPaths.some((path: string) => path.includes('recommended_tools'))).toBe(true);
      }
    });

    it('should validate partial schemas when some optional fields fail', () => {
      const partiallyValidData = {
        thought: "Valid thought",
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        // Valid optional field
        is_revision: false,
        // Invalid optional field that should be ignored in this test
        tool_usage_history: [
          {
            tool_name: "valid_tool",
            used_at: "2024-01-01T10:00:00Z",
            effectiveness_score: 0.8
          },
          {
            tool_name: "another_tool",
            used_at: "invalid_date", // This might be okay as it's just a string
            effectiveness_score: 1.2 // This might be okay as there's no constraint
          }
        ]
      };

      // This should pass because the schema doesn't enforce date format or score range for tool usage
      const result = ThoughtSchema.parse(partiallyValidData);
      expect(result).toBeValidThoughtData();
      expect(result.tool_usage_history).toHaveLength(2);
    });
  });

  describe('schema compatibility and evolution', () => {
    it('should maintain backward compatibility with simpler schema versions', () => {
      // Test with minimal required fields (like an older version might have)
      const minimalThought = {
        thought: "Minimal thought for compatibility test",
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false
      };

      const result = ThoughtSchema.parse(minimalThought);
      expect(result).toBeValidThoughtData();

      // All optional fields should be undefined
      expect(result.is_revision).toBeUndefined();
      expect(result.current_step).toBeUndefined();
      expect(result.previous_steps).toBeUndefined();
      expect(result.tool_usage_history).toBeUndefined();
    });

    it('should support schema extension patterns', () => {
      // Test that the schema can be extended for future use
      const extendedThoughtSchema = ThoughtSchema.extend({
        // Future fields that might be added
        experimental_field: z.string().optional(),
        version: z.string().default("1.0")
      });

      const extendedData = {
        thought: "Extended thought",
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        experimental_field: "test_value",
        version: "1.1"
      };

      const result = extendedThoughtSchema.parse(extendedData);
      expect(result.thought).toBe("Extended thought");
      expect((result as any).experimental_field).toBe("test_value");
      expect((result as any).version).toBe("1.1");
    });

    it('should handle schema transformations for data migration', () => {
      // Simulate old data format that needs transformation
      const oldFormatData = {
        // Old camelCase format
        thought: "Legacy data",
        thoughtNumber: 1, // Old field name
        totalThoughts: 3, // Old field name
        nextThoughtNeeded: true, // Old field name
        isRevision: false // Old field name
      };

      // Transform to new format
      const transformedData = {
        thought: oldFormatData.thought,
        thought_number: oldFormatData.thoughtNumber,
        total_thoughts: oldFormatData.totalThoughts,
        next_thought_needed: oldFormatData.nextThoughtNeeded,
        is_revision: oldFormatData.isRevision
      };

      const result = ThoughtSchema.parse(transformedData);
      expect(result).toBeValidThoughtData();
      expect(result.thought_number).toBe(1);
      expect(result.total_thoughts).toBe(3);
      expect(result.next_thought_needed).toBe(true);
      expect(result.is_revision).toBe(false);
    });
  });
});
