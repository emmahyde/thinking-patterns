/**
 * Mock factories for generating test data and mocking dependencies
 */

import { jest } from '@jest/globals';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { ThoughtData, ToolRecommendation, CurrentStep } from '../../src/schemas/ThoughtSchema.js';
import { BaseToolServer } from '../../src/base/BaseToolServer.js';

// Mock factory for creating ThoughtData with customizable fields
export const createMockThoughtData = (overrides: Partial<ThoughtData> = {}): ThoughtData => ({
  thought: "Mock thought for testing",
  thought_number: 1,
  total_thoughts: 3,
  next_thought_needed: true,
  is_revision: false,
  revises_thought: undefined,
  branch_from_thought: undefined,
  branch_id: undefined,
  needs_more_thoughts: false,
  current_step: undefined,
  previous_steps: undefined,
  remaining_steps: undefined,
  tool_usage_history: undefined,
  ...overrides,
});

// Mock factory for ToolRecommendation
export const createMockToolRecommendation = (overrides: Partial<ToolRecommendation> = {}): ToolRecommendation => ({
  tool_name: "sequentialthinking",
  confidence: 0.8,
  rationale: "Mock rationale for testing",
  priority: 1,
  alternative_tools: ["mentalmodel", "debugging"],
  ...overrides,
});

// Mock factory for CurrentStep
export const createMockCurrentStep = (overrides: Partial<CurrentStep> = {}): CurrentStep => ({
  step_description: "Mock step description",
  recommended_tools: [createMockToolRecommendation()],
  expected_outcome: "Mock expected outcome",
  next_step_conditions: ["Condition 1", "Condition 2"],
  step_number: 1,
  estimated_duration: "5 minutes",
  complexity_level: "medium" as const,
  ...overrides,
});

// Mock factory for MCP request
export const createMockMcpRequest = (toolName: string = "sequentialthinking", args: any = {}) => ({
  jsonrpc: "2.0" as const,
  id: `mock-request-${Date.now()}`,
  method: "tools/call" as const,
  params: {
    name: toolName,
    arguments: args,
  },
});

// Mock factory for MCP response
export const createMockMcpResponse = (content: string = "Mock response", isError: boolean = false) => ({
  content: [
    {
      type: "text" as const,
      text: content,
    },
  ],
  isError,
});

// Mock factory for session data
export const createMockSessionData = (overrides: any = {}) => ({
  sessionId: `mock-session-${Date.now()}`,
  userId: `mock-user-${Date.now()}`,
  createdAt: new Date(),
  lastActivity: new Date(),
  thoughtHistory: [createMockThoughtData()],
  metadata: {
    userAgent: "test-agent/1.0",
    clientId: "test-client",
  },
  ...overrides,
});

// Mock BaseToolServer class
export const createMockBaseToolServer = <TIn, TOut>(): MockProxy<BaseToolServer<TIn, TOut>> => {
  const mock = mockDeep<BaseToolServer<TIn, TOut>>();

  // Setup default mock behavior
  mock.run.mockReturnValue({
    content: [{ type: "text", text: "Mock server response" }],
    isError: false,
  });

  return mock;
};

// Mock console methods for testing output
export const createMockConsole = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
});

// Mock file system operations
export const createMockFs = () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
});

// Mock network/HTTP operations
export const createMockHttp = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
});

// Mock timer functions for testing async behavior
export const createMockTimers = () => {
  jest.useFakeTimers();

  return {
    advanceTimersByTime: jest.advanceTimersByTime,
    runOnlyPendingTimers: jest.runOnlyPendingTimers,
    runAllTimers: jest.runAllTimers,
    clearAllTimers: jest.clearAllTimers,
    restoreTimers: () => jest.useRealTimers(),
  };
};

// Mock validation error for testing error scenarios
export const createMockValidationError = (message: string = "Mock validation error") => {
  const error = new Error(message);
  error.name = "ValidationError";
  return error;
};

// Mock network error for testing network failure scenarios
export const createMockNetworkError = (message: string = "Mock network error") => {
  const error = new Error(message);
  error.name = "NetworkError";
  return error;
};

// Mock timeout error for testing timeout scenarios
export const createMockTimeoutError = (message: string = "Mock timeout error") => {
  const error = new Error(message);
  error.name = "TimeoutError";
  return error;
};

// Helper to create a mock implementation of any function
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  const mockFn = jest.fn() as unknown as jest.MockedFunction<T>;
  if (implementation) {
    mockFn.mockImplementation(implementation);
  }
  return mockFn;
};

// Helper to create a spy on object methods
export const createMethodSpy = <T extends object, K extends keyof T>(
  object: T,
  method: K
): any => {
  return jest.spyOn(object as any, method as any);
};

// Helper to create a mock class instance
export const createMockInstance = <T>(constructor: new (...args: any[]) => T): MockProxy<T> => {
  return mockDeep<T>();
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
};

// Helper to wait for async operations in tests
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to create random test data
export const createRandomString = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

export const createRandomNumber = (min: number = 1, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const createRandomBoolean = (): boolean => {
  return Math.random() < 0.5;
};

// Test data generators for stress testing
export const generateLargeThoughtHistory = (count: number = 100): ThoughtData[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockThoughtData({
      thought: `Thought ${i + 1}: ${createRandomString(50)}`,
      thought_number: i + 1,
      total_thoughts: count,
      next_thought_needed: i < count - 1,
    })
  );
};

export const generateLargeToolRecommendations = (count: number = 50): ToolRecommendation[] => {
  const tools = ["sequentialthinking", "mentalmodel", "debugging", "stochastic", "collaborative"];

  return Array.from({ length: count }, (_, i) =>
    createMockToolRecommendation({
      tool_name: tools[i % tools.length],
      confidence: Math.random(),
      priority: i + 1,
      rationale: `Rationale ${i + 1}: ${createRandomString(30)}`,
    })
  );
};
