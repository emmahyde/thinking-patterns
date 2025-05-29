/**
 * Integration tests for MCP protocol compliance
 * Tests ListTools and CallTool responses and error propagation
 */

import { ToolRegistry, BaseToolServer } from '../../src/base/BaseToolServer.js';
import { SequentialThoughtSchema, type ThoughtData } from '../../src/schemas/SequentialThoughtSchema.js';
import {
  createMockMcpRequest,
  createMockThoughtData,
  createMockValidationError
} from '../helpers/mockFactories.js';
import { validThoughtData, invalidThoughtData } from '../helpers/testFixtures.js';

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

    const tool = ToolRegistry.findTool(name);
    if (!tool) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32602,
          message: `Tool not found: ${name}`
        }
      };
    }

    try {
      const response = tool.server.run(args);

      if (response.isError) {
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32603,
            message: "Tool execution error",
            data: response.content[0]?.text
          }
        };
      }

      return {
        jsonrpc: "2.0",
        id: request.id,
        result: response
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: "Tool execution failed",
          data: error instanceof Error ? error.message : String(error)
        }
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
          arguments: validThoughtData
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("call-1");
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = response.result;
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.isError).toBeUndefined();

      const toolResult = JSON.parse(result.content[0].text);
      expect(toolResult.analysis).toContain("MCP analysis");
      expect(toolResult.confidence).toBe(0.95);
    });

    it('should handle validation errors properly', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-2",
        method: "tools/call",
        params: {
          name: "test-processor",
          arguments: invalidThoughtData.missingRequired
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("call-2");
      expect(response.error).toBeDefined();
      expect(response.result).toBeUndefined();

      expect(response.error?.code).toBe(-32603);
      expect(response.error?.message).toBe("Tool execution error");
      expect(response.error?.data).toContain("Validation failed");
    });

    it('should handle missing tool name', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-3",
        method: "tools/call",
        params: {
          arguments: validThoughtData
          // Missing name
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("call-3");
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32602);
      expect(response.error?.message).toContain("missing tool name");
    });

    it('should handle non-existent tool', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-4",
        method: "tools/call",
        params: {
          name: "nonexistent-tool",
          arguments: validThoughtData
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("call-4");
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32602);
      expect(response.error?.message).toContain("Tool not found: nonexistent-tool");
    });

    it('should handle missing params', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "call-5",
        method: "tools/call"
        // Missing params
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("call-5");
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32602);
    });
  });

  describe('protocol compliance', () => {
    it('should handle unknown methods', async () => {
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "unknown-1",
        method: "unknown/method"
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("unknown-1");
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toBe("Method not found");
    });

    it('should maintain request ID correlation', async () => {
      const requests = [
        { jsonrpc: "2.0" as const, id: "req-1", method: "tools/list" },
        { jsonrpc: "2.0" as const, id: 42, method: "tools/list" },
        { jsonrpc: "2.0" as const, id: "req-3", method: "tools/list" }
      ];

      for (const request of requests) {
        const response = await mcpServer.handleRequest(request);
        expect(response.id).toBe(request.id);
        expect(response.jsonrpc).toBe("2.0");
      }
    });

    it('should handle concurrent requests', async () => {
      mcpServer.registerTool("concurrent-tool", testToolServer);

      const requests = Array.from({ length: 10 }, (_, i) => ({
        jsonrpc: "2.0" as const,
        id: `concurrent-${i}`,
        method: "tools/call",
        params: {
          name: "concurrent-tool",
          arguments: createMockThoughtData({ thoughtNumber: i + 1 })
        }
      }));

      const responses = await Promise.all(
        requests.map(req => mcpServer.handleRequest(req))
      );

      expect(responses).toHaveLength(10);

      responses.forEach((response, i) => {
        expect(response.jsonrpc).toBe("2.0");
        expect(response.id).toBe(`concurrent-${i}`);
        expect(response.result).toBeDefined();
        expect(response.error).toBeUndefined();
      });
    });
  });

  describe('error propagation', () => {
    it('should propagate tool server errors correctly', async () => {
      class ErrorThrowingServer extends BaseToolServer<ThoughtData, any> {
        constructor() {
          super(SequentialThoughtSchema);
        }

        protected handle(_validInput: ThoughtData): any {
          throw new Error("Intentional server error");
        }
      }

      mcpServer.registerTool("error-tool", new ErrorThrowingServer());

      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "error-1",
        method: "tools/call",
        params: {
          name: "error-tool",
          arguments: validThoughtData
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32603);
      expect(response.error?.message).toBe("Tool execution error");
      expect(response.error?.data).toContain("Intentional server error");
    });

    it('should handle schema validation errors gracefully', async () => {
      mcpServer.registerTool("validation-tool", testToolServer);

      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "validation-1",
        method: "tools/call",
        params: {
          name: "validation-tool",
          arguments: invalidThoughtData.invalidTypes
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32603);
      expect(response.error?.data).toContain("Validation failed");
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedRequest = {
        jsonrpc: "1.0", // Wrong version
        id: "malformed-1",
        method: "tools/call"
      } as any;

      // The simulator should handle this gracefully
      const response = await mcpServer.handleRequest(malformedRequest);

      expect(response.jsonrpc).toBe("2.0");
      expect(response.id).toBe("malformed-1");
    });
  });

  describe('performance and scalability', () => {
    it('should handle multiple tool registrations efficiently', async () => {
      // Register many tools
      for (let i = 0; i < 50; i++) {
        mcpServer.registerTool(`perf-tool-${i}`, testToolServer);
      }

      const start = Date.now();
      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "perf-1",
        method: "tools/list"
      };

      const response = await mcpServer.handleRequest(request);
      const elapsed = Date.now() - start;

      expect(response.result.tools).toHaveLength(50);
      expect(elapsed).toBeLessThan(100); // Should be fast
    });

    it('should handle rapid tool calls efficiently', async () => {
      mcpServer.registerTool("rapid-tool", testToolServer);

      const requests = Array.from({ length: 20 }, (_, i) => ({
        jsonrpc: "2.0" as const,
        id: `rapid-${i}`,
        method: "tools/call",
        params: {
          name: "rapid-tool",
          arguments: validThoughtData
        }
      }));

      const start = Date.now();
      const responses = await Promise.all(
        requests.map(req => mcpServer.handleRequest(req))
      );
      const elapsed = Date.now() - start;

      expect(responses).toHaveLength(20);
      expect(elapsed).toBeLessThan(1000); // Should complete quickly

      responses.forEach(response => {
        expect(response.result).toBeDefined();
        expect(response.error).toBeUndefined();
      });
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very large input data', async () => {
      mcpServer.registerTool("large-input-tool", testToolServer);

      const largeThought = "x".repeat(10000);
      const largeInput = createMockThoughtData({ thought: largeThought });

      const request: McpRequest = {
        jsonrpc: "2.0",
        id: "large-1",
        method: "tools/call",
        params: {
          name: "large-input-tool",
          arguments: largeInput
        }
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should handle empty and null arguments', async () => {
      mcpServer.registerTool("null-test-tool", testToolServer);

      const testCases = [
        { arguments: null },
        { arguments: undefined },
        { arguments: {} }
      ];

      for (const testCase of testCases) {
        const request: McpRequest = {
          jsonrpc: "2.0",
          id: `null-test-${Math.random()}`,
          method: "tools/call",
          params: {
            name: "null-test-tool",
            ...testCase
          }
        };

        const response = await mcpServer.handleRequest(request);
        // Should handle gracefully (likely with validation error)
        expect(response.jsonrpc).toBe("2.0");
        expect(response.id).toBeDefined();
      }
    });

    it('should handle special characters in tool names', async () => {
      const specialNames = [
        "tool-with-dashes",
        "toolWithUnderscores",
        "tool.with.dots",
        "tool123numbers"
      ];

      for (const name of specialNames) {
        mcpServer.registerTool(name, testToolServer);

        const request: McpRequest = {
          jsonrpc: "2.0",
          id: `special-${name}`,
          method: "tools/call",
          params: {
            name,
            arguments: validThoughtData
          }
        };

        const response = await mcpServer.handleRequest(request);
        expect(response.result).toBeDefined();
        expect(response.error).toBeUndefined();
      }
    });
  });
});
