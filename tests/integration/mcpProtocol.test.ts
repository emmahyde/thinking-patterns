/**
 * Integration tests for MCP protocol compliance
 * Tests ListTools and CallTool responses and error propagation
 */

import { ToolRegistry, BaseToolServer } from '../../src/base/BaseToolServer.js';
import { processToolRequest } from '../../src/base/toolRegistry.js';
import type { SequentialThoughtData as ThoughtData } from '../../src/schemas/SequentialThoughtSchema.js';
import { SequentialThoughtSchema, type SequentialThoughtData } from '../../src/schemas/SequentialThoughtSchema.js';
import {
  createMockMcpRequest,
  createMockThoughtData,
  createMockValidationError
} from '../helpers/mockFactories.js';
import { validSequentialThought, invalidSequentialThought, finalThoughtData } from '../helpers/testFixtures.js';
import { describe, it, expect, vi } from 'vitest';

// Mock MCP server implementation for testing
class MockMcpToolServer extends BaseToolServer<ThoughtData, { analysis: string; confidence: number }> {
  constructor() {
    super(SequentialThoughtSchema);
  }

  protected handle(validInput: ThoughtData): { analysis: string; confidence: number } {
    return {
      analysis: `MCP analysis of: ${validInput.thought}`,
      confidence: 0.95
    };
  }
}

// Mock MCP request/response types for testing
interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// Helper to simulate MCP server behavior
class McpServerSimulator {
  private tools: Map<string, BaseToolServer<any, any>> = new Map();

  registerTool(name: string, server: BaseToolServer<any, any>) {
    this.tools.set(name, server);
    ToolRegistry.register({
      name,
      schema: SequentialThoughtSchema,
      server,
      description: `MCP tool: ${name}`
    });
  }

  async handleRequest(request: McpRequest): Promise<McpResponse> {
    try {
      switch (request.method) {
        case "tools/list":
          return this.handleListTools(request);
        case "tools/call":
          return this.handleCallTool(request);
        default:
          return {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32601,
              message: "Method not found"
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: "Internal error",
          data: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  private handleListTools(request: McpRequest): McpResponse {
    const toolDefinitions = ToolRegistry.getToolDefinitions();

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        tools: toolDefinitions
      }
    };
  }

  private handleCallTool(request: McpRequest): McpResponse {
    const { name, arguments: args } = request.params || {};

    if (!name) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32602,
          message: "Invalid params: missing tool name"
        }
      };
    }

    try {
      // Use the central processing function which now returns the result directly or throws.
      const result = processToolRequest(name, args);

      return {
        jsonrpc: "2.0",
        id: request.id,
        result: result, // The result is the { tool_name, output } object
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: "Tool execution error",
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

describe('MCP Protocol Integration Tests', () => {
  let mcpServer: McpServerSimulator;
  let testToolServer: MockMcpToolServer;

  beforeEach(() => {
    mcpServer = new McpServerSimulator();
    testToolServer = new MockMcpToolServer();

    // Clear registry
    (ToolRegistry as any).tools = [];
  });

  afterEach(() => {
    (ToolRegistry as any).tools = [];
  });

  describe('tools/list method', () => {
    it('should return empty tools list when no tools registered', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "test-1",
        method: "tools/list"
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("test-1");
      expect(response.result).toBeDefined();
      expect(response.result.tools).toEqual([]);
      expect(response.error).toBeUndefined();
    });

    it('should return registered tools list', async () => {
      mcpServer.registerTool("sequential_thinking", testToolServer);
      mcpServer.registerTool("mental_model", testToolServer);

      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "test-2",
        method: "tools/list"
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("test-2");
      expect(response.result).toBeDefined();
      expect(response.result.tools).toHaveLength(2);

      const toolNames = response.result.tools.map((t: any) => t.name);
      expect(toolNames).toContain("sequential_thinking");
      expect(toolNames).toContain("mental_model");
    });

    it('should include proper tool metadata', async () => {
      mcpServer.registerTool("test-tool", testToolServer);

      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "test-3",
        method: "tools/list"
      };

      const response = await mcpServer.handleRequest(request);

      const tool = response.result.tools[0];
      expect(tool.name).toBe("test-tool");
      expect(tool.description).toContain("MCP tool: test-tool");
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    });
  });

  describe('tools/call method', () => {
    beforeEach(() => {
      mcpServer.registerTool("test-processor", testToolServer);
    });

    it('should execute tool with valid input', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-1",
        method: "tools/call",
        params: {
          name: "test-processor",
          arguments: validSequentialThought
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("call-1");
      expect(response.error).toBeUndefined();
      expect(response.result).toBeDefined();

      // The result is the { tool_name, output } object from our local processing
      const toolResult = response.result;
      expect(toolResult.tool_name).toBe("test-processor");
      expect(toolResult.output).toEqual({
        analysis: `MCP analysis of: ${validSequentialThought.thought}`,
        confidence: 0.95
      });
    });

    it('should return MCP error for invalid input', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-2",
        method: "tools/call",
        params: {
          name: "test-processor",
          arguments: invalidSequentialThought.missingRequired
        }
      };

      const response = await mcpServer.handleRequest(request);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32603);
      expect(response.error?.message).toBe("Tool execution error");
      expect(response.error?.data).toContain("Validation failed");
    });

    it('should return MCP error for unknown tool', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-3",
        method: "tools/call",
        params: {
          name: "unknown-tool",
          arguments: validSequentialThought
        }
      };

      const response = await mcpServer.handleRequest(request);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32603);
      expect(response.error?.message).toBe("Tool execution error");
      expect(response.error?.data).toContain("Tool not found: unknown-tool");
    });

    it('should return MCP error for missing tool name', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-4",
        method: "tools/call",
        params: {
          // No name provided
          arguments: validSequentialThought
        }
      };
      const response = await mcpServer.handleRequest(request);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32602);
      expect(response.error?.message).toBe("Invalid params: missing tool name");
    });
  });

  describe('Server error handling', () => {
    it('should handle internal errors during request processing gracefully', async () => {
      // Force an error in the handleListTools method
      vi.spyOn(ToolRegistry, 'getToolDefinitions').mockImplementation(() => {
        throw new Error("Internal enumeration error");
      });

      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "error-1",
        method: "tools/list"
      };

      const response = await mcpServer.handleRequest(request);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32603);
      expect(response.error?.message).toBe("Internal error");
      expect(response.error?.data).toBe("Internal enumeration error");
    });
  });
});
