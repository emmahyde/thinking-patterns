/**
 * Tests for BaseToolServer abstract class
 * Tests validation, error handling, and response formatting
 */

import { z } from 'zod';
import { BaseToolServer, MCPResponse } from '../../src/base/BaseToolServer.js';
import { createMockThoughtData, createMockValidationError } from '../helpers/mockFactories.js';

// Test schema for validation testing
const TestSchema = z.object({
  message: z.string(),
  count: z.number().positive(),
  enabled: z.boolean().optional(),
});

type TestInput = z.infer<typeof TestSchema>;
type TestOutput = { result: string; processed: boolean };

// Concrete implementation for testing
class TestToolServer extends BaseToolServer<TestInput, TestOutput> {
  constructor() {
    super(TestSchema);
  }

  protected handle(validInput: TestInput): TestOutput {
    return {
      result: `Processed: ${validInput.message} (count: ${validInput.count})`,
      processed: true,
    };
  }
}

// Test server that throws an error in handle method
class ErrorThrowingServer extends BaseToolServer<TestInput, TestOutput> {
  constructor() {
    super(TestSchema);
  }

  protected handle(_validInput: TestInput): TestOutput {
    throw new Error("Intentional error for testing");
  }
}

describe('BaseToolServer', () => {
  let testServer: TestToolServer;
  let errorServer: ErrorThrowingServer;

  beforeEach(() => {
    testServer = new TestToolServer();
    errorServer = new ErrorThrowingServer();
  });

  describe('constructor', () => {
    it('should initialize with provided schema', () => {
      expect(testServer).toBeInstanceOf(BaseToolServer);
      expect(testServer['schema']).toBe(TestSchema);
    });
  });

  describe('validate method', () => {
    it('should validate correct input successfully', () => {
      const validInput = {
        message: "test message",
        count: 5,
        enabled: true,
      };

      const result = testServer['validate'](validInput);

      expect(result).toEqual(validInput);
      expect(result.message).toBe("test message");
      expect(result.count).toBe(5);
      expect(result.enabled).toBe(true);
    });

    it('should validate input without optional fields', () => {
      const validInput = {
        message: "test message",
        count: 3,
      };

      const result = testServer['validate'](validInput);

      expect(result).toEqual(validInput);
      expect(result.enabled).toBeUndefined();
    });

    it('should throw error for missing required fields', () => {
      const invalidInput = {
        message: "test message",
        // missing count
      };

      expect(() => testServer['validate'](invalidInput)).toThrow();
      expect(() => testServer['validate'](invalidInput)).toThrow(/Validation failed/);
    });

    it('should throw error for invalid field types', () => {
      const invalidInput = {
        message: 123, // should be string
        count: "not a number", // should be number
      };

      expect(() => testServer['validate'](invalidInput)).toThrow();
      expect(() => testServer['validate'](invalidInput)).toThrow(/Validation failed/);
    });

    it('should throw error for negative count', () => {
      const invalidInput = {
        message: "test",
        count: -1, // should be positive
      };

      expect(() => testServer['validate'](invalidInput)).toThrow();
      expect(() => testServer['validate'](invalidInput)).toThrow(/Validation failed/);
    });

    it('should provide detailed validation error messages', () => {
      const invalidInput = {
        message: 123,
        count: "invalid",
      };

      try {
        testServer['validate'](invalidInput);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Validation failed');
        expect(error.message).toContain('message');
        expect(error.message).toContain('count');
      }
    });
  });

  describe('run method', () => {
    it('should process valid input and return success response', () => {
      const validInput = {
        message: "hello world",
        count: 42,
        enabled: true,
      };

      const response = testServer.run(validInput);

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('isError');
      expect(response.isError).toBeUndefined(); // Success responses don't set isError
      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');
      expect(response.content[0]).toHaveProperty('text');

      const resultText = response.content[0].text;
      const parsedResult = JSON.parse(resultText);
      expect(parsedResult).toHaveProperty('result');
      expect(parsedResult).toHaveProperty('processed', true);
      expect(parsedResult.result).toContain('hello world');
      expect(parsedResult.result).toContain('42');
    });

    it('should return error response for validation failures', () => {
      const invalidInput = {
        message: "test",
        // missing count
      };

      const response = testServer.run(invalidInput);

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('isError', true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toHaveProperty('type', 'text');

      const errorText = response.content[0].text;
      const parsedError = JSON.parse(errorText);
      expect(parsedError).toHaveProperty('error');
      expect(parsedError).toHaveProperty('status', 'failed');
      expect(parsedError).toHaveProperty('timestamp');
      expect(parsedError.error).toContain('Validation failed');
    });

    it('should return error response for handle method errors', () => {
      const validInput = {
        message: "test",
        count: 1,
      };

      const response = errorServer.run(validInput);

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('isError', true);
      expect(response.content).toHaveLength(1);

      const errorText = response.content[0].text;
      const parsedError = JSON.parse(errorText);
      expect(parsedError).toHaveProperty('error', 'Intentional error for testing');
      expect(parsedError).toHaveProperty('status', 'failed');
      expect(parsedError).toHaveProperty('timestamp');
    });

    it('should handle non-Error exceptions', () => {
      class StringThrowingServer extends BaseToolServer<TestInput, TestOutput> {
        constructor() {
          super(TestSchema);
        }

        protected handle(_validInput: TestInput): TestOutput {
          throw "String error"; // Throwing a string instead of Error
        }
      }

      const stringServer = new StringThrowingServer();
      const validInput = { message: "test", count: 1 };
      const response = stringServer.run(validInput);

      expect(response.isError).toBe(true);
      const errorText = response.content[0].text;
      const parsedError = JSON.parse(errorText);
      expect(parsedError.error).toBe("String error");
    });
  });

  describe('formatResponse method', () => {
    it('should format response with default implementation', () => {
      const result: TestOutput = { result: "test data", processed: true };
      const formatted = testServer['formatResponse'](result);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toHaveProperty('type', 'text');
      expect(formatted[0]).toHaveProperty('text');

      const parsedText = JSON.parse(formatted[0].text);
      expect(parsedText).toEqual(result);
    });
  });

  describe('formatError method', () => {
    it('should format error with default implementation', () => {
      const error = new Error("Test error message");
      const formatted = testServer['formatError'](error);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toHaveProperty('type', 'text');
      expect(formatted[0]).toHaveProperty('text');

      const parsedText = JSON.parse(formatted[0].text);
      expect(parsedText).toHaveProperty('error', 'Test error message');
      expect(parsedText).toHaveProperty('status', 'failed');
      expect(parsedText).toHaveProperty('timestamp');
      expect(new Date(parsedText.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('generic type constraints', () => {
    it('should enforce input type constraints through schema', () => {
      const customSchema = z.object({
        value: z.string(),
      });

      class CustomServer extends BaseToolServer<{ value: string }, { output: string }> {
        constructor() {
          super(customSchema);
        }

        protected handle(validInput: { value: string }): { output: string } {
          return { output: validInput.value.toUpperCase() };
        }
      }

      const server = new CustomServer();
      const response = server.run({ value: "hello" });

      expect(response.isError).toBeUndefined();
      const result = JSON.parse(response.content[0].text);
      expect(result.output).toBe("HELLO");
    });

    it('should work with complex nested types', () => {
      const complexSchema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
        settings: z.array(z.string()),
      });

      type ComplexInput = z.infer<typeof complexSchema>;
      type ComplexOutput = { summary: string; count: number };

      class ComplexServer extends BaseToolServer<ComplexInput, ComplexOutput> {
        constructor() {
          super(complexSchema);
        }

        protected handle(validInput: ComplexInput): ComplexOutput {
          return {
            summary: `User ${validInput.user.name} has ${validInput.settings.length} settings`,
            count: validInput.settings.length,
          };
        }
      }

      const server = new ComplexServer();
      const input = {
        user: { name: "Alice", age: 30 },
        settings: ["theme", "language", "notifications"],
      };

      const response = server.run(input);
      expect(response.isError).toBeUndefined();

      const result = JSON.parse(response.content[0].text);
      expect(result.summary).toContain("Alice");
      expect(result.summary).toContain("3 settings");
      expect(result.count).toBe(3);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle null input', () => {
      const response = testServer.run(null);
      expect(response.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const response = testServer.run(undefined);
      expect(response.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const response = testServer.run({});
      expect(response.isError).toBe(true);
    });

    it('should handle very large input objects', () => {
      const largeInput = {
        message: "x".repeat(10000),
        count: 1,
      };

      const response = testServer.run(largeInput);
      expect(response.isError).toBeUndefined();

      const result = JSON.parse(response.content[0].text);
      expect(result.processed).toBe(true);
    });

    it('should preserve timestamp format in error responses', () => {
      const response = testServer.run({});
      expect(response.isError).toBe(true);

      const error = JSON.parse(response.content[0].text);
      const timestamp = new Date(error.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(Math.abs(Date.now() - timestamp.getTime())).toBeLessThan(1000);
    });
  });
});
