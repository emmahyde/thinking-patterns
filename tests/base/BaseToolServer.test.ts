/**
 * Tests for BaseToolServer abstract class
 * Tests validation, error handling, and response formatting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { BaseToolServer } from '../../src/base/BaseToolServer.js';
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
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Validation failed');
        expect((error as Error).message).toContain('message');
        expect((error as Error).message).toContain('count');
      }
    });
  });

  describe('run method', () => {
    it('should process valid input and return standardized response format', () => {
      const validInput = {
        message: "hello world",
        count: 42,
        enabled: true,
      };

      const response = testServer.run(validInput);

      expect(response).toEqual({
        content: [{
          type: "text",
          text: JSON.stringify({
            result: 'Processed: hello world (count: 42)',
            processed: true
          })
        }],
        data: {
          result: 'Processed: hello world (count: 42)',
          processed: true
        }
      });
    });

    it('should return standardized error response for validation failures', () => {
      const invalidInput = {
        message: "test",
        // missing count
      };

      const response = testServer.run(invalidInput);

      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");
      expect(response.content[0].text).toContain('"error"');
      expect(response.content[0].text).toContain('Validation failed');
    });

    it('should return standardized error response for handle method errors', () => {
      const validInput = {
        message: "test",
        count: 1,
      };

      const response = errorServer.run(validInput);

      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");
      expect(response.content[0].text).toContain('"error":"Intentional error for testing"');
    });

    it('should handle non-Error exceptions in standardized format', () => {
      class StringThrowingServer extends BaseToolServer<TestInput, TestOutput> {
        constructor() {
          super(TestSchema);
        }

        protected handle(_validInput: TestInput): TestOutput {
          throw "String error";
        }
      }

      const stringServer = new StringThrowingServer();
      const validInput = { message: "test", count: 1 };

      const response = stringServer.run(validInput);

      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");
      expect(response.content[0].text).toContain('"error":"String error"');
    });
  });

  describe('Server with different input/output shapes', () => {
    // Simplified tests for other server shapes
    it('should work with simple string output', () => {
      const simpleSchema = z.object({ value: z.string() });
      class SimpleServer extends BaseToolServer<{ value: string }, string> {
        constructor() {
          super(simpleSchema);
        }
        protected handle(validInput: { value: string }): string {
          return `output: ${validInput.value}`;
        }
      }
      const server = new SimpleServer();
      const result = server.run({ value: 'test' });

      expect(result).toEqual({
        content: [{
          type: "text",
          text: JSON.stringify('output: test')
        }],
        data: 'output: test'
      });
    });

    it('should work with complex output objects', () => {
      const complexSchema = z.object({ a: z.number(), b: z.string() });
      type ComplexOutput = { summary: string; count: number };
      class ComplexServer extends BaseToolServer<z.infer<typeof complexSchema>, ComplexOutput> {
        constructor() {
          super(complexSchema);
        }
        protected handle(validInput: z.infer<typeof complexSchema>): ComplexOutput {
          return { summary: validInput.b, count: validInput.a };
        }
      }

      const server = new ComplexServer();
      const result = server.run({ a: 10, b: 'complex' });

      expect(result).toEqual({
        content: [{
          type: "text",
          text: JSON.stringify({ summary: 'complex', count: 10 })
        }],
        data: { summary: 'complex', count: 10 }
      });
    });
  });
});
