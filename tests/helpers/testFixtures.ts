/**
 * Test fixtures and sample data for testing
 */

import { ThoughtData } from '../../src/schemas/ThoughtSchema.js';

// Sample thought data for testing
// Sample thought data for testing
export const validThoughtData: ThoughtData = {
  thought: "This is a test thought for validation",
  thought_number: 1,
  total_thoughts: 5,
  next_thought_needed: true,
  is_revision: false,
  revises_thought: undefined,
  branch_from_thought: undefined,
  branch_id: undefined,
  needs_more_thoughts: false,
};

export const validThoughtDataWithOptionals: ThoughtData = {
  thought: "This is a revised thought that branches from previous thinking",
  thought_number: 3,
  total_thoughts: 5,
  next_thought_needed: true,
  is_revision: true,
  revises_thought: 2,
  branch_from_thought: 1,
  branch_id: "branch-a",
  needs_more_thoughts: true,
};

export const finalThoughtData: ThoughtData = {
  thought: "This is the final thought in the sequence",
  thought_number: 5,
  total_thoughts: 5,
  next_thought_needed: false,
  is_revision: false,
  revises_thought: undefined,
  branch_from_thought: undefined,
  branch_id: undefined,
  needs_more_thoughts: false,
};
// Invalid test data for schema validation testing
export const invalidThoughtData = {
  missingRequired: {
    thought: "Missing required fields",
    // Missing thought_number, total_thoughts, next_thought_needed
  },
  invalidTypes: {
    thought: 123, // Should be string
    thought_number: "not a number", // Should be number
    total_thoughts: -1, // Should be positive
    next_thought_needed: "yes", // Should be boolean
  },
  negativeNumbers: {
    thought: "Valid thought",
    thought_number: -1, // Should be positive
    total_thoughts: 0, // Should be positive
    next_thought_needed: true,
  },
  invalidOptionals: {
    thought: "Valid thought",
    thought_number: 1,
    total_thoughts: 3,
    next_thought_needed: true,
    revises_thought: -1, // Should be positive if provided
    branch_from_thought: 0, // Should be positive if provided
  },
};

// Sample MCP request data
export const sampleMcpRequest = {
  jsonrpc: "2.0" as const,
  id: "test-request-1",
  method: "tools/call" as const,
  params: {
    name: "sequentialthinking",
    arguments: validThoughtData,
  },
};

export const sampleMcpListToolsRequest = {
  jsonrpc: "2.0" as const,
  id: "test-list-tools",
  method: "tools/list" as const,
};

// Sample server responses
export const sampleSuccessResponse = {
  content: [
    {
      type: "text" as const,
      text: "Successfully processed thought",
    },
  ],
  isError: false,
};

export const sampleErrorResponse = {
  content: [
    {
      type: "text" as const,
      text: "Error: Invalid input data",
    },
  ],
  isError: true,
};

// Sample UI formatting test data
export const sampleBoxContent = {
  title: "🧠 Test Thinking Tool",
  sections: {
    "Current Thought": "This is a sample thought for testing the box formatting",
    "Progress": "Step 1 of 3",
    "Status": "Processing...",
    "Details": [
      "• First detail item",
      "• Second detail item",
      "• Third detail item with longer text that might wrap",
    ],
  },
};

export const sampleLongContent = {
  title: "📊 Performance Analysis",
  sections: {
    "Long Text Section": "This is a very long piece of text that should test the wrapping capabilities of the box formatting function. It contains multiple sentences and should demonstrate how the formatter handles content that exceeds the typical box width limits.",
    "Unicode Test": "🔥 Testing Unicode: 🚀 → ★ ♦ ◆ ■ ● ▲ ► ✓ ✗ ℹ ⚠ 🎯",
    "Multi-line Array": [
      "Line 1: Short line",
      "Line 2: This is a much longer line that tests how arrays are formatted within the box structure",
      "Line 3: Unicode mixed → ★ with regular text",
      "Line 4: Final line",
    ],
  },
};

// Error test fixtures
export const sampleErrors = {
  validationError: new Error("Validation failed: Invalid input"),
  networkError: new Error("Network connection failed"),
  mcpError: new Error("MCP protocol error"),
  timeoutError: new Error("Request timeout"),
};

// Session management test data
export const sampleSessionData = {
  sessionId: "test-session-123",
  userId: "test-user-456",
  createdAt: new Date('2024-01-01T10:00:00Z'),
  lastActivity: new Date('2024-01-01T10:05:00Z'),
  thoughtHistory: [validThoughtData, validThoughtDataWithOptionals],
  metadata: {
    userAgent: "test-agent/1.0",
    clientId: "test-client",
  },
};

// Tool recommendation test data
export const sampleRecommendationContext = {
  previousTools: ["sequentialthinking", "mentalmodel"],
  currentProblemType: "analysis",
  userPreferences: {
    verbosity: "detailed",
    style: "structured",
  },
  sessionLength: 15,
  successRate: 0.85,
};

export const expectedRecommendations = [
  {
    toolName: "sequentialthinking",
    confidence: 0.9,
    reason: "High success rate with analytical problems",
  },
  {
    toolName: "debugging",
    confidence: 0.7,
    reason: "Good for systematic problem breakdown",
  },
];
