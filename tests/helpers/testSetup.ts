/**
 * Vitest test setup file
 * Configures global test environment settings
 */

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock process.exit to prevent tests from actually exiting
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit() was called in test');
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  mockExit.mockRestore();
});

// Global test utilities
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidThoughtData(): T;
    toHaveValidBoxFormat(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidThoughtData(): any;
    toHaveValidBoxFormat(): any;
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidThoughtData(received: any) {
    const requiredFields = ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded'];
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

    if (typeof received.thoughtNumber !== 'number' || received.thoughtNumber < 1) {
      return {
        message: () => `Expected thoughtNumber to be a positive number, got ${received.thoughtNumber}`,
        pass: false,
      };
    }

    if (typeof received.totalThoughts !== 'number' || received.totalThoughts < 1) {
      return {
        message: () => `Expected totalThoughts to be a positive number, got ${received.totalThoughts}`,
        pass: false,
      };
    }

    if (typeof received.nextThoughtNeeded !== 'boolean') {
      return {
        message: () => `Expected nextThoughtNeeded to be a boolean, got ${typeof received.nextThoughtNeeded}`,
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
export { };