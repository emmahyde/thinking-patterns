/**
 * Tests for SequentialThinkingServer class
 * Tests validation logic, error handling, and MCP integration
 */

import { jest } from '@jest/globals';
import { SequentialThinkingServer } from '../../src/servers/SequentialThinkingServer.js';
import {
  createMockThoughtData,
  createMockCurrentStep,
  resetAllMocks
} from '../helpers/mockFactories.js';

describe('SequentialThinkingServer', () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    // Reset all mocks before each test
    resetAllMocks();

    // Create server instance
    server = new SequentialThinkingServer();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(server).toBeInstanceOf(SequentialThinkingServer);
    });
  });

  describe('process', () => {
    it('should process valid thought data successfully', () => {
      const validInput = createMockThoughtData({
        thought: "I need to analyze this problem systematically",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });

      const result = server.process(validInput);

      expect(result).toHaveProperty('thoughtNumber', 1);
      expect(result).toHaveProperty('totalThoughts', 3);
      expect(result).toHaveProperty('nextThoughtNeeded', true);
      expect(result).toHaveProperty('thought', "I need to analyze this problem systematically");
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('isRevision', false);
      expect(result).toHaveProperty('hasCurrentStep', false);
      expect(result).toHaveProperty('stage');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('framework', 'clear-thought-tools');
    });

    it('should include current step information when provided', () => {
      const currentStep = createMockCurrentStep();
      const validInput = createMockThoughtData({
        thought: "Test thought with current step",
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        currentStep: currentStep
      });

      const result = server.process(validInput);

      expect(result.hasCurrentStep).toBe(true);
      expect(result.thoughtNumber).toBe(2);
      expect(result.totalThoughts).toBe(4);
    });

    it('should handle revision data correctly', () => {
      const validInput = createMockThoughtData({
        thought: "This is a revision",
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 2
      });

      const result = server.process(validInput);

      expect(result.isRevision).toBe(true);
      expect(result.status).toBe('success');
    });

    it('should handle branch data correctly', () => {
      const validInput = createMockThoughtData({
        thought: "This is a branch",
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        branchFromThought: 2,
        branchId: "branch-1"
      });

      const result = server.process(validInput);

      expect(result.branchId).toBe("branch-1");
      expect(result.status).toBe('success');
    });

    it('should determine correct stage for different thought positions', () => {
      // Test initial stage
      const initialInput = createMockThoughtData({
        thoughtNumber: 1,
        totalThoughts: 10,
        nextThoughtNeeded: true
      });
      const initialResult = server.process(initialInput);
      expect(initialResult.stage).toBe('initial');

      // Test middle stage
      const middleInput = createMockThoughtData({
        thoughtNumber: 5,
        totalThoughts: 10,
        nextThoughtNeeded: true
      });
      const middleResult = server.process(middleInput);
      expect(middleResult.stage).toBe('middle');

      // Test final stage
      const finalInput = createMockThoughtData({
        thoughtNumber: 9,
        totalThoughts: 10,
        nextThoughtNeeded: false
      });
      const finalResult = server.process(finalInput);
      expect(finalResult.stage).toBe('final');
    });
  });

  describe('processThought (backward compatibility)', () => {
    it('should process valid thought successfully via run method', () => {
      const validInput = {
        thought: "I need to analyze this problem systematically",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const response = server.processThought(validInput);

      expect(response).toHaveProperty('content');
      expect(response.isError).toBeUndefined();
      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');
      expect(response.content[0]).toHaveProperty('text');

      const result = JSON.parse(response.content[0].text);
      expect(result).toHaveProperty('thoughtNumber', 1);
      expect(result).toHaveProperty('totalThoughts', 3);
      expect(result).toHaveProperty('nextThoughtNeeded', true);
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('framework', 'clear-thought-tools');
    });

    it('should return error response for invalid input', () => {
      const invalidInput = {
        thought: 123, // Invalid type
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const response = server.processThought(invalidInput);

      expect(response).toHaveProperty('isError', true);
      expect(response.content).toHaveLength(1);

      const error = JSON.parse(response.content[0].text);
      expect(error).toHaveProperty('error');
      expect(error).toHaveProperty('status', 'failed');
      expect(error).toHaveProperty('timestamp');
    });

    it('should handle null input', () => {
      const response = server.processThought(null);
      expect(response.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const response = server.processThought(undefined);
      expect(response.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const response = server.processThought({});
      expect(response.isError).toBe(true);
    });

    it('should preserve error timestamp format', () => {
      const response = server.processThought({});
      expect(response.isError).toBe(true);

      const error = JSON.parse(response.content[0].text);
      const timestamp = new Date(error.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(Math.abs(Date.now() - timestamp.getTime())).toBeLessThan(1000);
    });

    it('should handle very large thought content', () => {
      const largeThought = 'x'.repeat(10000);
      const validInput = {
        thought: largeThought,
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const response = server.processThought(validInput);
      expect(response.isError).toBeUndefined();

      const result = JSON.parse(response.content[0].text);
      expect(result.thoughtNumber).toBe(1);
    });
  });

  describe('determineStage (private method behavior verification)', () => {
    it('should return correct stages based on progress', () => {
      // Test through process method which calls determineStage internally

      // Single thought should be final
      const singleInput = createMockThoughtData({
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      });
      const singleResult = server.process(singleInput);
      expect(singleResult.stage).toBe('final');

      // First of many should be initial
      const firstInput = createMockThoughtData({
        thoughtNumber: 1,
        totalThoughts: 10,
        nextThoughtNeeded: true
      });
      const firstResult = server.process(firstInput);
      expect(firstResult.stage).toBe('initial');

      // Last should be final
      const lastInput = createMockThoughtData({
        thoughtNumber: 10,
        totalThoughts: 10,
        nextThoughtNeeded: false
      });
      const lastResult = server.process(lastInput);
      expect(lastResult.stage).toBe('final');

      // Two-thought sequence
      const firstOfTwoInput = createMockThoughtData({
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      });
      const firstOfTwoResult = server.process(firstOfTwoInput);
      expect(firstOfTwoResult.stage).toBe('initial');

      const secondOfTwoInput = createMockThoughtData({
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false
      });
      const secondOfTwoResult = server.process(secondOfTwoInput);
      expect(secondOfTwoResult.stage).toBe('final');

      // Three-thought sequence (middle)
      const middleOfThreeInput = createMockThoughtData({
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });
      const middleOfThreeResult = server.process(middleOfThreeInput);
      expect(middleOfThreeResult.stage).toBe('middle');
    });
  });

  describe('console output', () => {
    it('should log formatted output to console.error when not in test environment', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Temporarily remove test environment indicators
      const originalNodeEnv = process.env.NODE_ENV;
      const originalJestWorker = process.env.JEST_WORKER_ID;
      delete process.env.NODE_ENV;
      delete process.env.JEST_WORKER_ID;

      const validInput = createMockThoughtData({
        thought: "Test thought for console output",
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true
      });

      server.process(validInput);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('💭 Sequential Thinking'));

      // Restore environment
      if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
      if (originalJestWorker !== undefined) process.env.JEST_WORKER_ID = originalJestWorker;
      consoleSpy.mockRestore();
    });

    it('should not log to console.error during tests', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const validInput = createMockThoughtData({
        thought: "Test thought for console output",
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true
      });

      server.process(validInput);

      expect(consoleSpy).toHaveBeenCalledTimes(0);

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle complex thought data with all optional fields', () => {
      const complexInput = createMockThoughtData({
        thought: "Complex thought with all fields",
        thoughtNumber: 3,
        totalThoughts: 7,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 2,
        branchFromThought: 1,
        branchId: "test-branch",
        needsMoreThoughts: true,
        currentStep: createMockCurrentStep(),
        previousSteps: [
          { stepDescription: "Previous step 1", recommendedTools: [], expectedOutcome: "Outcome 1", nextStepConditions: [] },
          { stepDescription: "Previous step 2", recommendedTools: [], expectedOutcome: "Outcome 2", nextStepConditions: [] }
        ],
        remainingSteps: ["Remaining step 1", "Remaining step 2"],
        toolUsageHistory: [
          { toolName: "mental_model", usedAt: new Date().toISOString(), effectivenessScore: 0.8 }
        ]
      });

      const result = server.process(complexInput);

      expect(result.status).toBe('success');
      expect(result.isRevision).toBe(true);
      expect(result.branchId).toBe("test-branch");
      expect(result.hasCurrentStep).toBe(true);
    });
  });
});
