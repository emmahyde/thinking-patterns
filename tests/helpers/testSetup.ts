/**
 * Jest test setup file
 * Configures global test environment settings
 */

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

// Mock process.exit to prevent tests from actually exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit() was called in test');
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  mockExit.mockRestore();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidThoughtData(): R;
      toHaveValidBoxFormat(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidThoughtData(received: any) {
    const requiredFields = ['thought', 'thought_number', 'total_thoughts', 'next_thought_needed'];
    const missingFields = requiredFields.filter(field => !(field in received));

    if (missingFields.length > 0) {
      return {
        message: () => `Expected object to have required fields: ${missingFields.join(', ')}`,
        pass: false,
      };
    }

    if (typeof received.thought !== 'string') {
      return {
        message: () => `Expected thought to be a string, got ${typeof received.thought}`,
        pass: false,
      };
    }

    if (typeof received.thought_number !== 'number' || received.thought_number < 1) {
      return {
        message: () => `Expected thought_number to be a positive number, got ${received.thought_number}`,
        pass: false,
      };
    }

    if (typeof received.total_thoughts !== 'number' || received.total_thoughts < 1) {
      return {
        message: () => `Expected total_thoughts to be a positive number, got ${received.total_thoughts}`,
        pass: false,
      };
    }

    if (typeof received.next_thought_needed !== 'boolean') {
      return {
        message: () => `Expected next_thought_needed to be a boolean, got ${typeof received.next_thought_needed}`,
        pass: false,
      };
    }

    return {
      message: () => `Expected object to be invalid thought data`,
      pass: true,
    };
  },

  toHaveValidBoxFormat(received: string) {
    // Check for box structure (borders, content, etc.)
    const lines = received.split('\n');

    if (lines.length < 3) {
      return {
        message: () => `Expected formatted box to have at least 3 lines, got ${lines.length}`,
        pass: false,
      };
    }

    // Check for consistent border characters
    const topBorder = lines[0];
    const bottomBorder = lines[lines.length - 1];

    if (!topBorder.includes('─') || !bottomBorder.includes('─')) {
      return {
        message: () => `Expected box to have proper border characters`,
        pass: false,
      };
    }

    return {
      message: () => `Expected string to not have valid box format`,
      pass: true,
    };
  },
});

// Export to make this file a module (required for global augmentation)
export {};
