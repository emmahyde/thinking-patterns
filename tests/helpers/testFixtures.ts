/**
 * Test fixtures and sample data for testing
 */

import { ThoughtData } from '../../src/schemas/SequentialThoughtSchema.js';

// Sample thought data for testing
// Sample thought data for testing
export const validThoughtData: ThoughtData = {
  thought: "This is a test thought for validation",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,
  isRevision: false,
  revisesThought: undefined,
  branchFromThought: undefined,
  branchId: undefined,
  needsMoreThoughts: false,
};

export const validThoughtDataWithOptionals: ThoughtData = {
  thought: "This is a revised thought that branches from previous thinking",
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,
  isRevision: true,
  revisesThought: 2,
  branchFromThought: 1,
  branchId: "branch-a",
  needsMoreThoughts: true,
};

export const finalThoughtData: ThoughtData = {
  thought: "This is the final thought in the sequence",
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,
  isRevision: false,
  revisesThought: undefined,
  branchFromThought: undefined,
  branchId: undefined,
  needsMoreThoughts: false,
};
// Invalid test data for schema validation testing
export const invalidThoughtData = {
  missingRequired: {
    thought: "Missing required fields",
    // Missing thoughtNumber, totalThoughts, nextThoughtNeeded
  },
  invalidTypes: {
    thought: 123, // Should be string
    thoughtNumber: "not a number", // Should be number
    totalThoughts: -1, // Should be positive
    nextThoughtNeeded: "yes", // Should be boolean
  },
  negativeNumbers: {
    thought: "Valid thought",
    thoughtNumber: -1, // Should be positive
    totalThoughts: 0, // Should be positive
    nextThoughtNeeded: true,
  },
  invalidOptionals: {
    thought: "Valid thought",
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    revisesThought: -1, // Should be positive if provided
    branchFromThought: 0, // Should be positive if provided
  },
};

// Sample MCP request data
export const sampleMcpRequest = {
  jsonrpc: "2.0" as const,
  id: "test-request-1",
  method: "tools/call" as const,
  params: {
    name: "sequential_thinking",
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
  previousTools: ["sequential_thinking", "mental_model"],
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
    toolName: "sequential_thinking",
    confidence: 0.9,
    reason: "High success rate with analytical problems",
  },
  {
    toolName: "debugging",
    confidence: 0.7,
    reason: "Good for systematic problem breakdown",
  },
];
