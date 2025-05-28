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
          toolName: "sequential_thinking",
          confidence: 0.9,
          rationale: "Best for systematic analysis",
          priority: 1,
          alternativeTools: ["mental_model", "debugging"]
        }),
        ToolRecommendationSchema.parse({
          toolName: "mental_model",
          confidence: 0.7,
          rationale: "Good for understanding structure",
          priority: 2
        })
      ];

      const currentStep: CurrentStep = CurrentStepSchema.parse({
        stepDescription: "Analyze the problem systematically",
        recommendedTools: toolRecommendations,
        expectedOutcome: "Clear understanding of the problem",
        nextStepConditions: ["Analysis complete", "Key insights identified"],
        stepNumber: 2,
        estimatedDuration: "15 minutes",
        complexityLevel: "high"
      });

      const previousSteps: StepRecommendation[] = [
        StepRecommendationSchema.parse({
          stepDescription: "Initial problem identification",
          recommendedTools: toolRecommendations.slice(1),
          expectedOutcome: "Problem clearly defined",
          nextStepConditions: ["Problem scope understood"]
        })
      ];

      const toolHistory: ToolUsageHistory[] = [
        ToolUsageHistorySchema.parse({
          toolName: "mental_model",
          usedAt: "2024-01-01T10:00:00Z",
          effectivenessScore: 0.85
        }),
        ToolUsageHistorySchema.parse({
          toolName: "sequential_thinking",
          usedAt: "2024-01-01T10:15:00Z",
          effectivenessScore: 0.92
        })
      ];

      const thoughtData: ThoughtData = ThoughtSchema.parse({
        thought: "Based on the mental model analysis, I need to break this down systematically",
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        isRevision: false,
        currentStep: currentStep,
        previousSteps: previousSteps,
        remainingSteps: ["Synthesis", "Conclusion", "Validation"],
        toolUsageHistory: toolHistory
      });

      // Verify the integrated structure
      expect(thoughtData).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(thoughtData.currentStep?.recommendedTools).toHaveLength(2);
      expect(thoughtData.previousSteps).toHaveLength(1);
      expect(thoughtData.toolUsageHistory).toHaveLength(2);
      expect(thoughtData.remainingSteps).toHaveLength(3);

      // Verify tool recommendations are properly nested
      expect(thoughtData.currentStep?.recommendedTools[0].toolName).toBe("sequential_thinking");
      expect(thoughtData.currentStep?.recommendedTools[0].confidence).toBe(0.9);

      // Verify tool history integration
      expect(thoughtData.toolUsageHistory?.[1].toolName).toBe("sequential_thinking");
      expect(thoughtData.toolUsageHistory?.[1].effectivenessScore).toBe(0.92);
    });

    it('should validate tool context integration with other schemas', () => {
      const context: ToolContext = ToolContextSchema.parse({
        availableTools: ["sequential_thinking", "mental_model", "debugging", "stochastic"],
        userPreferences: {
          style: "detailed",
          format: "structured",
          verbosity: "high"
        },
        sessionHistory: [
          "Previous analysis of similar problem",
          "Used mental model successfully",
          "Sequential thinking helped break down complexity"
        ],
        problemDomain: "complexAnalysis"
      });

      // Create thought data that references tools from the context
      const thoughtWithContext: ThoughtData = ThoughtSchema.parse({
        thought: "Using the available tools from context to approach this problem",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        currentStep: {
          stepDescription: "Select appropriate tools based on context",
          recommendedTools: context.availableTools.slice(0, 2).map(toolName => ({
            toolName: toolName,
            confidence: 0.8,
            rationale: `Tool ${toolName} is available in context`,
            priority: 1
          })),
          expectedOutcome: "Optimal tool selection",
          nextStepConditions: ["Tools selected", "Context considered"]
        }
      });

      expect(thoughtWithContext).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(thoughtWithContext.currentStep?.recommendedTools).toHaveLength(2);
      expect(thoughtWithContext.currentStep?.recommendedTools[0].toolName).toBe("sequential_thinking");
      expect(thoughtWithContext.currentStep?.recommendedTools[1].toolName).toBe("mental_model");
    });
  });

  describe('schema composition and nesting', () => {
    it('should handle deeply nested schema structures', () => {
      const deeplyNestedThought = {
        thought: "This tests deep nesting of all schema types",
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        currentStep: {
          stepDescription: "Deep analysis step",
          recommendedTools: [
            {
              toolName: "sequential_thinking",
              confidence: 0.95,
              rationale: "Perfect for deep analysis",
              priority: 1,
              alternativeTools: ["mental_model", "debugging", "stochastic"]
            },
            {
              toolName: "collaborative",
              confidence: 0.8,
              rationale: "Good for complex problems",
              priority: 2,
              alternativeTools: ["mental_model"]
            }
          ],
          expectedOutcome: "Comprehensive understanding",
          nextStepConditions: [
            "All aspects analyzed",
            "Edge cases considered",
            "Alternative approaches evaluated"
          ],
          stepNumber: 3,
          estimatedDuration: "25 minutes",
          complexityLevel: "high" as const
        },
        previousSteps: [
          {
            stepDescription: "Initial exploration",
            recommendedTools: [
              {
                toolName: "mental_model",
                confidence: 0.7,
                rationale: "Good starting point",
                priority: 1
              }
            ],
            expectedOutcome: "Problem framework",
            nextStepConditions: ["Framework established"]
          },
          {
            stepDescription: "Detailed analysis",
            recommendedTools: [
              {
                toolName: "debugging",
                confidence: 0.85,
                rationale: "Systematic approach needed",
                priority: 1
              },
              {
                toolName: "sequential_thinking",
                confidence: 0.9,
                rationale: "Step-by-step breakdown",
                priority: 2
              }
            ],
            expectedOutcome: "Detailed understanding",
            nextStepConditions: ["Analysis complete", "Patterns identified"]
          }
        ],
        remainingSteps: [
          "Synthesis and integration",
          "Solution formulation"
        ],
        toolUsageHistory: [
          {
            toolName: "mental_model",
            usedAt: "2024-01-01T09:00:00Z",
            effectivenessScore: 0.7
          },
          {
            toolName: "debugging",
            usedAt: "2024-01-01T09:30:00Z",
            effectivenessScore: 0.85
          },
          {
            toolName: "sequential_thinking",
            usedAt: "2024-01-01T10:00:00Z",
            effectivenessScore: 0.9
          }
        ]
      };

      const result = ThoughtSchema.parse(deeplyNestedThought);

      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.currentStep?.recommendedTools).toHaveLength(2);
      expect(result.previousSteps).toHaveLength(2);
      expect(result.toolUsageHistory).toHaveLength(3);

      // Verify nested tool recommendations
      expect(result.currentStep?.recommendedTools[0].alternativeTools).toHaveLength(3);
      expect(result.previousSteps?.[1].recommendedTools).toHaveLength(2);

      // Verify consistency across the structure
      const allRecommendedTools = [
        ...(result.currentStep?.recommendedTools || []),
        ...(result.previousSteps?.flatMap(step => step.recommendedTools) || [])
      ];
      const allHistoryTools = result.toolUsageHistory?.map(h => h.toolName) || [];

      // Some recommended tools should appear in history
      const recommendedToolNames = allRecommendedTools.map(t => t.toolName);
      const intersection = recommendedToolNames.filter(name => allHistoryTools.includes(name));
      expect(intersection.length).toBeGreaterThan(0);
    });

    it('should validate schema arrays with mixed complexity', () => {
      const mixedComplexitySteps: StepRecommendation[] = [
        // Simple step
        {
          stepDescription: "Simple initial step",
          recommendedTools: [{
            toolName: "mental_model",
            confidence: 0.8,
            rationale: "Basic framework",
            priority: 1
          }],
          expectedOutcome: "Basic understanding",
          nextStepConditions: ["Basics covered"]
        },
        // Complex step
        {
          stepDescription: "Complex analytical step",
          recommendedTools: [
            {
              toolName: "sequential_thinking",
              confidence: 0.95,
              rationale: "Systematic breakdown needed",
              priority: 1,
              alternativeTools: ["debugging", "stochastic", "collaborative"]
            },
            {
              toolName: "debugging",
              confidence: 0.85,
              rationale: "Error checking required",
              priority: 2,
              alternativeTools: ["sequential_thinking"]
            }
          ],
          expectedOutcome: "Comprehensive analysis complete",
          nextStepConditions: [
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
      expect(validatedSteps[0].recommendedTools).toHaveLength(1);
      expect(validatedSteps[1].recommendedTools).toHaveLength(2);
      expect(validatedSteps[1].recommendedTools[0].alternativeTools).toHaveLength(3);

      // Use in a ThoughtData structure
      const thoughtWithMixedSteps = ThoughtSchema.parse({
        thought: "Processing steps of varying complexity",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        previousSteps: validatedSteps
      });

      expect(thoughtWithMixedSteps.previousSteps).toHaveLength(2);
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
        currentStep: createMockCurrentStep({
          recommendedTools: generateLargeToolRecommendations(10)
        }),
        previousSteps: Array.from({ length: 5 }, () => ({
          stepDescription: "Previous step",
          recommendedTools: generateLargeToolRecommendations(5),
          expectedOutcome: "Step outcome",
          nextStepConditions: ["Condition 1", "Condition 2"]
        })),
        toolUsageHistory: Array.from({ length: 20 }, (_, i) => ({
          toolName: `tool_${i}`,
          usedAt: new Date().toISOString(),
          effectivenessScore: Math.random()
        }))
      });

      const start = Date.now();
      const result = ThoughtSchema.parse(complexThoughtData);
      const elapsed = Date.now() - start;

      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.currentStep?.recommendedTools).toHaveLength(10);
      expect(result.previousSteps).toHaveLength(5);
      expect(result.toolUsageHistory).toHaveLength(20);
      expect(elapsed).toBeLessThan(100); // Should be very fast for single validation
    });
  });

  describe('schema error handling and recovery', () => {
    it('should provide detailed error paths for nested validation failures', () => {
      const invalidNestedStructure = {
        thought: "Valid thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        currentStep: {
          stepDescription: "Valid description",
          recommendedTools: [
            {
              toolName: "validTool",
              confidence: 1.5, // Invalid - greater than 1
              rationale: "Valid rationale",
              priority: 1
            },
            {
              toolName: "", // Invalid - empty string
              confidence: 0.8,
              rationale: "Valid rationale",
              priority: "invalid" // Invalid - should be number
            }
          ],
          expectedOutcome: "Valid outcome",
          nextStepConditions: ["Valid condition"]
        }
      };

      try {
        ThoughtSchema.parse(invalidNestedStructure);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();

        // Should have errors for nested paths
        const errorPaths = error.errors.map((err: any) => err.path.join('.'));
        expect(errorPaths.some((path: string) => path.includes('currentStep'))).toBe(true);
        expect(errorPaths.some((path: string) => path.includes('recommendedTools'))).toBe(true);
      }
    });

    it('should validate partial schemas when some optional fields fail', () => {
      const partiallyValidData = {
        thought: "Valid thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        // Valid optional field
        isRevision: false,
        // Invalid optional field that should be ignored in this test
        toolUsageHistory: [
          {
            toolName: "validTool",
            usedAt: "2024-01-01T10:00:00Z",
            effectivenessScore: 0.8
          },
          {
            toolName: "anotherTool",
            usedAt: "invalidDate", // This might be okay as it's just a string
            effectivenessScore: 1.2 // This might be okay as there's no constraint
          }
        ]
      };

      // This should pass because the schema doesn't enforce date format or score range for tool usage
      const result = ThoughtSchema.parse(partiallyValidData);
      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.toolUsageHistory).toHaveLength(2);
    });
  });

  describe('schema compatibility and evolution', () => {
    it('should maintain backward compatibility with simpler schema versions', () => {
      // Test with minimal required fields (like an older version might have)
      const minimalThought = {
        thought: "Minimal thought for compatibility test",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = ThoughtSchema.parse(minimalThought);
      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });

      // All optional fields should be undefined
      expect(result.isRevision).toBeUndefined();
      expect(result.currentStep).toBeUndefined();
      expect(result.previousSteps).toBeUndefined();
      expect(result.toolUsageHistory).toBeUndefined();
    });

    it('should support schema extension patterns', () => {
      // Test that the schema can be extended for future use
      const extendedThoughtSchema = ThoughtSchema.extend({
        // Future fields that might be added
        experimentalField: z.string().optional(),
        version: z.string().default("1.0")
      });

      const extendedData = {
        thought: "Extended thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        experimentalField: "testValue",
        version: "1.1"
      };

      const result = extendedThoughtSchema.parse(extendedData);
      expect(result.thought).toBe("Extended thought");
      expect((result as any).experimentalField).toBe("testValue");
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
        thoughtNumber: oldFormatData.thoughtNumber,
        totalThoughts: oldFormatData.totalThoughts,
        nextThoughtNeeded: oldFormatData.nextThoughtNeeded,
        isRevision: oldFormatData.isRevision
      };

      const result = ThoughtSchema.parse(transformedData);
      expect(result).toMatchObject({
        thought: expect.any(String),
        thoughtNumber: expect.any(Number),
        totalThoughts: expect.any(Number),
        nextThoughtNeeded: expect.any(Boolean)
      });
      expect(result.thoughtNumber).toBe(1);
      expect(result.totalThoughts).toBe(3);
      expect(result.nextThoughtNeeded).toBe(true);
      expect(result.isRevision).toBe(false);
    });
  });
});
