/**
 * Tests for CustomErrors module
 * Tests custom error types, error serialization, and error handling patterns
 */

import { jest } from '@jest/globals';
import {
  ValidationError,
  StateError,
  SecurityError,
  ProcessingError,
  ErrorResponse
} from '../../src/errors/CustomErrors.js';
import { resetAllMocks } from '../helpers/mockFactories.js';

describe('CustomErrors', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const message = 'Invalid input provided';
      const error = new ValidationError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeUndefined();
    });

    it('should create validation error with message and details', () => {
      const message = 'Validation failed';
      const details = {
        field: 'email',
        value: 'invalid-email',
        expected: 'valid email format'
      };
      const error = new ValidationError(message, details);

      expect(error.message).toBe(message);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });

    it('should handle complex details object', () => {
      const details = {
        errors: [
          { field: 'name', message: 'Required field' },
          { field: 'age', message: 'Must be positive number' }
        ],
        requestId: 'req-123',
        timestamp: new Date().toISOString()
      };
      const error = new ValidationError('Multiple validation errors', details);

      expect(error.details).toEqual(details);
      expect(error.details!.errors).toHaveLength(2);
    });

    it('should maintain error stack trace', () => {
      const error = new ValidationError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });

    it('should be serializable to JSON', () => {
      const error = new ValidationError('Test error', { field: 'test' });
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe('Test error');
      expect(parsed.name).toBe('ValidationError');
      expect(parsed.code).toBe('VALIDATION_ERROR');
      expect(parsed.details).toEqual({ field: 'test' });
    });

    it('should handle null and undefined details', () => {
      const errorWithNull = new ValidationError('Test', null as any);
      const errorWithUndefined = new ValidationError('Test', undefined);

      expect(errorWithNull.details).toBeNull();
      expect(errorWithUndefined.details).toBeUndefined();
    });
  });

  describe('StateError', () => {
    it('should create state error with message', () => {
      const message = 'Invalid state transition';
      const error = new StateError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StateError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('StateError');
      expect(error.code).toBe('STATE_ERROR');
      expect(error.sessionId).toBeUndefined();
    });

    it('should create state error with message and session ID', () => {
      const message = 'Session state corrupted';
      const sessionId = 'session-123';
      const error = new StateError(message, sessionId);

      expect(error.message).toBe(message);
      expect(error.name).toBe('StateError');
      expect(error.code).toBe('STATE_ERROR');
      expect(error.sessionId).toBe(sessionId);
    });

    it('should handle empty session ID', () => {
      const error = new StateError('Test error', '');
      expect(error.sessionId).toBe('');
    });

    it('should maintain error stack trace', () => {
      const error = new StateError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('StateError');
    });

    it('should be serializable to JSON', () => {
      const error = new StateError('Test error', 'session-456');
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe('Test error');
      expect(parsed.name).toBe('StateError');
      expect(parsed.code).toBe('STATE_ERROR');
      expect(parsed.sessionId).toBe('session-456');
    });
  });

  describe('SecurityError', () => {
    it('should create security error with message and default severity', () => {
      const message = 'Unauthorized access attempt';
      const error = new SecurityError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SecurityError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('SecurityError');
      expect(error.code).toBe('SECURITY_ERROR');
      expect(error.severity).toBe('medium');
    });

    it('should create security error with specified severity levels', () => {
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];

      severities.forEach(severity => {
        const error = new SecurityError(`Test ${severity} severity`, severity);
        expect(error.severity).toBe(severity);
        expect(error.code).toBe('SECURITY_ERROR');
      });
    });

    it('should handle low severity security error', () => {
      const error = new SecurityError('Minor security issue', 'low');
      expect(error.severity).toBe('low');
      expect(error.message).toBe('Minor security issue');
    });

    it('should handle critical severity security error', () => {
      const error = new SecurityError('Critical security breach', 'critical');
      expect(error.severity).toBe('critical');
      expect(error.message).toBe('Critical security breach');
    });

    it('should maintain error stack trace', () => {
      const error = new SecurityError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('SecurityError');
    });

    it('should be serializable to JSON', () => {
      const error = new SecurityError('Security violation', 'high');
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe('Security violation');
      expect(parsed.name).toBe('SecurityError');
      expect(parsed.code).toBe('SECURITY_ERROR');
      expect(parsed.severity).toBe('high');
    });
  });

  describe('ProcessingError', () => {
    it('should create processing error with message', () => {
      const message = 'Processing failed';
      const error = new ProcessingError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProcessingError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('ProcessingError');
      expect(error.code).toBe('PROCESSING_ERROR');
      expect(error.context).toBeUndefined();
    });

    it('should create processing error with message and context', () => {
      const message = 'Failed to process request';
      const context = {
        requestId: 'req-789',
        operation: 'data-analysis',
        inputSize: 1000,
        timestamp: new Date().toISOString()
      };
      const error = new ProcessingError(message, context);

      expect(error.message).toBe(message);
      expect(error.name).toBe('ProcessingError');
      expect(error.code).toBe('PROCESSING_ERROR');
      expect(error.context).toEqual(context);
    });

    it('should handle complex context object', () => {
      const context = {
        pipeline: {
          stage: 'validation',
          step: 3,
          totalSteps: 10
        },
        input: {
          type: 'thought-data',
          size: 2048
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform
        }
      };
      const error = new ProcessingError('Pipeline failed', context);

      expect(error.context).toEqual(context);
      expect(error.context!.pipeline.stage).toBe('validation');
    });

    it('should maintain error stack trace', () => {
      const error = new ProcessingError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ProcessingError');
    });

    it('should be serializable to JSON', () => {
      const context = { operation: 'test', status: 'failed' };
      const error = new ProcessingError('Test error', context);
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe('Test error');
      expect(parsed.name).toBe('ProcessingError');
      expect(parsed.code).toBe('PROCESSING_ERROR');
      expect(parsed.context).toEqual(context);
    });

    it('should handle null and undefined context', () => {
      const errorWithNull = new ProcessingError('Test', null as any);
      const errorWithUndefined = new ProcessingError('Test', undefined);

      expect(errorWithNull.context).toBeNull();
      expect(errorWithUndefined.context).toBeUndefined();
    });
  });

  describe('ErrorResponse interface compliance', () => {
    it('should create valid ErrorResponse objects', () => {
      const baseResponse: ErrorResponse = {
        code: 'TEST_ERROR',
        message: 'Test error message',
        timestamp: new Date().toISOString()
      };

      expect(baseResponse.code).toBe('TEST_ERROR');
      expect(baseResponse.message).toBe('Test error message');
      expect(baseResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should create ErrorResponse with optional fields', () => {
      const fullResponse: ErrorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          field: 'email',
          expectedFormat: 'user@example.com'
        },
        timestamp: new Date().toISOString(),
        requestId: 'req-123'
      };

      expect(fullResponse.details).toBeDefined();
      expect(fullResponse.requestId).toBe('req-123');
      expect(fullResponse.details!.field).toBe('email');
    });

    it('should convert custom errors to ErrorResponse format', () => {
      const validationError = new ValidationError('Invalid data', { field: 'name' });

      const response: ErrorResponse = {
        code: validationError.code,
        message: validationError.message,
        details: validationError.details,
        timestamp: new Date().toISOString(),
        requestId: 'req-456'
      };

      expect(response.code).toBe('VALIDATION_ERROR');
      expect(response.message).toBe('Invalid data');
      expect(response.details).toEqual({ field: 'name' });
    });
  });

  describe('Error inheritance and instanceof checks', () => {
    it('should properly inherit from Error class', () => {
      const validationError = new ValidationError('Test');
      const stateError = new StateError('Test');
      const securityError = new SecurityError('Test');
      const processingError = new ProcessingError('Test');

      expect(validationError instanceof Error).toBe(true);
      expect(stateError instanceof Error).toBe(true);
      expect(securityError instanceof Error).toBe(true);
      expect(processingError instanceof Error).toBe(true);

      expect(validationError instanceof ValidationError).toBe(true);
      expect(stateError instanceof StateError).toBe(true);
      expect(securityError instanceof SecurityError).toBe(true);
      expect(processingError instanceof ProcessingError).toBe(true);
    });

    it('should distinguish between different error types', () => {
      const validationError = new ValidationError('Test');
      const stateError = new StateError('Test');

      expect(validationError instanceof ValidationError).toBe(true);
      expect(validationError instanceof StateError).toBe(false);
      expect(stateError instanceof StateError).toBe(true);
      expect(stateError instanceof ValidationError).toBe(false);
    });
  });

  describe('Error handling patterns', () => {
    it('should support try-catch error handling', () => {
      const throwValidationError = () => {
        throw new ValidationError('Invalid input', { field: 'test' });
      };

      expect(() => throwValidationError()).toThrow(ValidationError);
      expect(() => throwValidationError()).toThrow('Invalid input');

      try {
        throwValidationError();
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.code).toBe('VALIDATION_ERROR');
          expect(error.details).toEqual({ field: 'test' });
        }
      }
    });

    it('should support error type switching', () => {
      const errors = [
        new ValidationError('Validation failed'),
        new StateError('State error'),
        new SecurityError('Security error', 'high'),
        new ProcessingError('Processing error')
      ];

      errors.forEach(error => {
        if (error instanceof ValidationError) {
          expect(error.code).toBe('VALIDATION_ERROR');
        } else if (error instanceof StateError) {
          expect(error.code).toBe('STATE_ERROR');
        } else if (error instanceof SecurityError) {
          expect(error.code).toBe('SECURITY_ERROR');
        } else if (error instanceof ProcessingError) {
          expect(error.code).toBe('PROCESSING_ERROR');
        }
      });
    });

    it('should support error chaining and wrapping', () => {
      const originalError = new Error('Original error');
      const wrappedError = new ProcessingError('Wrapped error', {
        originalError: originalError.message,
        stack: originalError.stack
      });

      expect(wrappedError.context!.originalError).toBe('Original error');
      expect(wrappedError.message).toBe('Wrapped error');
    });
  });

  describe('Error serialization patterns', () => {
    it('should serialize errors for logging', () => {
      const error = new ValidationError('Test error', {
        field: 'email',
        value: 'invalid',
        timestamp: new Date().toISOString()
      });

      const logEntry = {
        level: 'error',
        message: error.message,
        errorCode: error.code,
        errorName: error.name,
        details: error.details,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };

      expect(logEntry.errorCode).toBe('VALIDATION_ERROR');
      expect(logEntry.details!.field).toBe('email');
    });

    it('should serialize errors for API responses', () => {
      const error = new SecurityError('Access denied', 'critical');

      const apiResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          severity: error.severity,
          timestamp: new Date().toISOString()
        }
      };

      expect(apiResponse.success).toBe(false);
      expect(apiResponse.error.code).toBe('SECURITY_ERROR');
      expect(apiResponse.error.severity).toBe('critical');
    });

    it('should handle circular references in error context', () => {
      const circularContext: any = { name: 'test' };
      circularContext.self = circularContext;

      const error = new ProcessingError('Test', circularContext);

      // Test that we can still access non-circular properties
      expect(error.context!.name).toBe('test');
      expect(error.context!.self).toBe(circularContext);

      // JSON.stringify would throw on circular references, but we can handle it
      expect(() => {
        const safe = { ...error.context };
        delete safe.self;
        JSON.stringify(safe);
      }).not.toThrow();
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle very long error messages', () => {
      const longMessage = 'x'.repeat(10000);
      const error = new ValidationError(longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    it('should handle special characters in error messages', () => {
      const specialMessage = 'Error with special chars: ñáéíóú 中文 🚀 "quotes" \'apostrophes\'';
      const error = new StateError(specialMessage);

      expect(error.message).toBe(specialMessage);
    });

    it('should handle empty error messages', () => {
      const error = new ProcessingError('');
      expect(error.message).toBe('');
      expect(error.code).toBe('PROCESSING_ERROR');
    });

    it('should handle large context objects', () => {
      const largeContext = {
        data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` })),
        metadata: {
          total: 1000,
          processed: 500,
          errors: Array.from({ length: 100 }, (_, i) => `error-${i}`)
        }
      };

      const error = new ProcessingError('Large context test', largeContext);
      expect(error.context!.data).toHaveLength(1000);
      expect(error.context!.metadata.errors).toHaveLength(100);
    });

    it('should maintain immutability of error properties', () => {
      const details = { field: 'test', value: 'original' };
      const error = new ValidationError('Test', details);

      // Modifying the original details object should not affect the error
      details.value = 'modified';
      expect(error.details!.value).toBe('original');
    });
  });
});
