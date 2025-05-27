/**
 * Integration tests for tool registry system
 * Tests tool discovery, routing, and registry-first vs legacy fallback
 */

import { ToolRegistry, BaseToolServer, ToolRegistryEntry } from '../../src/base/BaseToolServer.js';
import { ThoughtSchema, type ThoughtData } from '../../src/schemas/ThoughtSchema.js';
import {
  createMockThoughtData,
  createMockMcpRequest,
  createMockMcpResponse
} from '../helpers/mockFactories.js';
import { validThoughtData } from '../helpers/testFixtures.js';

// Test implementation of BaseToolServer for registry testing
class TestToolServer extends BaseToolServer<ThoughtData, { success: boolean; message: string }> {
  constructor() {
    super(ThoughtSchema);
  }

  protected handle(validInput: ThoughtData): { success: boolean; message: string } {
    return {
      success: true,
      message: `Processed thought: ${validInput.thought}`
    };
  }
}

// Another test server for multiple tool testing
class AlternativeToolServer extends BaseToolServer<ThoughtData, { result: string; processed: boolean }> {
  constructor() {
    super(ThoughtSchema);
  }

  protected handle(validInput: ThoughtData): { result: string; processed: boolean } {
    return {
      result: `Alternative processing of: ${validInput.thought}`,
      processed: true
    };
  }
}

describe('Tool Registry Integration Tests', () => {
  let testToolServer: TestToolServer;
  let alternativeToolServer: AlternativeToolServer;

  beforeEach(() => {
    testToolServer = new TestToolServer();
    alternativeToolServer = new AlternativeToolServer();

    // Clear the registry before each test
    (ToolRegistry as any).tools = [];
  });

  afterEach(() => {
    // Clean up after each test
    (ToolRegistry as any).tools = [];
  });

  describe('tool registration', () => {
    it('should register a tool successfully', () => {
      const toolEntry: ToolRegistryEntry<ThoughtData, { success: boolean; message: string }> = {
        name: "test-tool",
        schema: ThoughtSchema,
        server: testToolServer,
        description: "Test tool for integration testing"
      };

      ToolRegistry.register(toolEntry);

      const registeredTools = ToolRegistry.getAllTools();
      expect(registeredTools).toHaveLength(1);
      expect(registeredTools[0].name).toBe("test-tool");
      expect(registeredTools[0].description).toBe("Test tool for integration testing");
    });

    it('should register multiple tools', () => {
      const toolEntry1: ToolRegistryEntry = {
        name: "tool-one",
        schema: ThoughtSchema,
        server: testToolServer,
        description: "First test tool"
      };

      const toolEntry2: ToolRegistryEntry = {
        name: "tool-two",
        schema: ThoughtSchema,
        server: alternativeToolServer,
        description: "Second test tool"
      };

      ToolRegistry.register(toolEntry1);
      ToolRegistry.register(toolEntry2);

      const registeredTools = ToolRegistry.getAllTools();
      expect(registeredTools).toHaveLength(2);

      const toolNames = registeredTools.map(tool => tool.name);
      expect(toolNames).toContain("tool-one");
      expect(toolNames).toContain("tool-two");
    });

    it('should handle tool registration with minimal fields', () => {
      const minimalToolEntry: ToolRegistryEntry = {
        name: "minimal-tool",
        schema: ThoughtSchema,
        server: testToolServer
        // No description provided
      };

      ToolRegistry.register(minimalToolEntry);

      const registeredTools = ToolRegistry.getAllTools();
      expect(registeredTools).toHaveLength(1);
      expect(registeredTools[0].name).toBe("minimal-tool");
      expect(registeredTools[0].description).toBeUndefined();
    });
  });

  describe('tool discovery', () => {
    beforeEach(() => {
      // Register test tools
      ToolRegistry.register({
        name: "sequentialthinking",
        schema: ThoughtSchema,
        server: testToolServer,
        description: "Sequential thinking tool"
      });

      ToolRegistry.register({
        name: "mentalmodel",
        schema: ThoughtSchema,
        server: alternativeToolServer,
        description: "Mental model tool"
      });
    });

    it('should find registered tool by name', () => {
      const foundTool = ToolRegistry.findTool("sequentialthinking");

      expect(foundTool).toBeDefined();
      expect(foundTool?.name).toBe("sequentialthinking");
      expect(foundTool?.server).toBe(testToolServer);
    });

    it('should return undefined for non-existent tool', () => {
      const foundTool = ToolRegistry.findTool("nonexistent-tool");

      expect(foundTool).toBeUndefined();
    });

    it('should handle case-sensitive tool names', () => {
      const foundTool = ToolRegistry.findTool("SequentialThinking"); // Different case

      expect(foundTool).toBeUndefined();
    });

    it('should get all registered tools', () => {
      const allTools = ToolRegistry.getAllTools();

      expect(allTools).toHaveLength(2);
      expect(allTools.map(t => t.name)).toEqual(
        expect.arrayContaining(["sequentialthinking", "mentalmodel"])
      );
    });
  });

  describe('tool execution workflow', () => {
    beforeEach(() => {
      ToolRegistry.register({
        name: "test-processor",
        schema: ThoughtSchema,
        server: testToolServer,
        description: "Test processing tool"
      });
    });

    it('should execute tool through registry', () => {
      const tool = ToolRegistry.findTool("test-processor");
      expect(tool).toBeDefined();

      const response = tool!.server.run(validThoughtData);

      expect(response.isError).toBeUndefined();
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe("text");

      const result = JSON.parse(response.content[0].text);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Processed thought");
    });

    it('should handle validation errors in registry workflow', () => {
      const tool = ToolRegistry.findTool("test-processor");
      expect(tool).toBeDefined();

      const invalidInput = {
        thought: "Valid thought",
        // Missing required fields
      };

      const response = tool!.server.run(invalidInput);

      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);

      const error = JSON.parse(response.content[0].text);
      expect(error.error).toContain("Validation failed");
    });

    it('should route different tools correctly', () => {
      ToolRegistry.register({
        name: "alternative-processor",
        schema: ThoughtSchema,
        server: alternativeToolServer,
        description: "Alternative processing tool"
      });

      const tool1 = ToolRegistry.findTool("test-processor");
      const tool2 = ToolRegistry.findTool("alternative-processor");

      const response1 = tool1!.server.run(validThoughtData);
      const response2 = tool2!.server.run(validThoughtData);

      const result1 = JSON.parse(response1.content[0].text);
      const result2 = JSON.parse(response2.content[0].text);

      // Different servers should produce different results
      expect(result1.message).toContain("Processed thought");
      expect(result2.result).toContain("Alternative processing");
      expect(result1).not.toEqual(result2);
    });
  });

  describe('MCP tool definitions generation', () => {
    beforeEach(() => {
      ToolRegistry.register({
        name: "sequentialthinking",
        schema: ThoughtSchema,
        server: testToolServer,
        description: "Sequential thinking for systematic analysis"
      });

      ToolRegistry.register({
        name: "debugging",
        schema: ThoughtSchema,
        server: alternativeToolServer
        // No description
      });
    });

    it('should generate tool definitions for MCP protocol', () => {
      const toolDefinitions = ToolRegistry.getToolDefinitions();

      expect(toolDefinitions).toHaveLength(2);

      const sequentialTool = toolDefinitions.find(t => t.name === "sequentialthinking");
      expect(sequentialTool).toBeDefined();
      expect(sequentialTool?.description).toBe("Sequential thinking for systematic analysis");
      expect(sequentialTool?.inputSchema).toBeDefined();
      expect(sequentialTool?.inputSchema.type).toBe("object");

      const debuggingTool = toolDefinitions.find(t => t.name === "debugging");
      expect(debuggingTool).toBeDefined();
      expect(debuggingTool?.description).toBe("Tool for debugging operations");
    });

    it('should provide default description when none specified', () => {
      const toolDefinitions = ToolRegistry.getToolDefinitions();
      const toolWithoutDescription = toolDefinitions.find(t => t.name === "debugging");

      expect(toolWithoutDescription?.description).toBe("Tool for debugging operations");
    });

    it('should include proper input schema structure', () => {
      const toolDefinitions = ToolRegistry.getToolDefinitions();

      toolDefinitions.forEach(toolDef => {
        expect(toolDef.inputSchema).toEqual({
          type: "object",
          properties: {},
          required: []
        });
      });
    });
  });

  describe('registry isolation and cleanup', () => {
    it('should maintain registry state across tests properly', () => {
      // This test should start with empty registry
      expect(ToolRegistry.getAllTools()).toHaveLength(0);

      ToolRegistry.register({
        name: "isolation-test",
        schema: ThoughtSchema,
        server: testToolServer
      });

      expect(ToolRegistry.getAllTools()).toHaveLength(1);
    });

    it('should handle multiple registrations of same name', () => {
      const tool1 = {
        name: "duplicate-name",
        schema: ThoughtSchema,
        server: testToolServer,
        description: "First registration"
      };

      const tool2 = {
        name: "duplicate-name",
        schema: ThoughtSchema,
        server: alternativeToolServer,
        description: "Second registration"
      };

      ToolRegistry.register(tool1);
      ToolRegistry.register(tool2);

      const allTools = ToolRegistry.getAllTools();
      expect(allTools).toHaveLength(2); // Both should be registered

      // Should find the first one registered
      const foundTool = ToolRegistry.findTool("duplicate-name");
      expect(foundTool?.description).toBe("First registration");
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle server errors gracefully', () => {
      class ErrorThrowingServer extends BaseToolServer<ThoughtData, any> {
        constructor() {
          super(ThoughtSchema);
        }

        protected handle(_validInput: ThoughtData): any {
          throw new Error("Server processing error");
        }
      }

      ToolRegistry.register({
        name: "error-server",
        schema: ThoughtSchema,
        server: new ErrorThrowingServer()
      });

      const tool = ToolRegistry.findTool("error-server");
      const response = tool!.server.run(validThoughtData);

      expect(response.isError).toBe(true);
      const error = JSON.parse(response.content[0].text);
      expect(error.error).toBe("Server processing error");
    });

    it('should handle empty tool name', () => {
      ToolRegistry.register({
        name: "",
        schema: ThoughtSchema,
        server: testToolServer
      });

      const foundTool = ToolRegistry.findTool("");
      expect(foundTool).toBeDefined();
      expect(foundTool?.name).toBe("");
    });

    it('should handle null/undefined search', () => {
      ToolRegistry.register({
        name: "valid-tool",
        schema: ThoughtSchema,
        server: testToolServer
      });

      expect(ToolRegistry.findTool(null as any)).toBeUndefined();
      expect(ToolRegistry.findTool(undefined as any)).toBeUndefined();
    });
  });

  describe('performance and scalability', () => {
    it('should handle large number of tool registrations efficiently', () => {
      const start = Date.now();

      // Register 100 tools
      for (let i = 0; i < 100; i++) {
        ToolRegistry.register({
          name: `performance-tool-${i}`,
          schema: ThoughtSchema,
          server: testToolServer,
          description: `Performance test tool ${i}`
        });
      }

      const registrationTime = Date.now() - start;
      expect(registrationTime).toBeLessThan(1000); // Should be fast

      // Test lookup performance
      const lookupStart = Date.now();
      for (let i = 0; i < 100; i++) {
        const tool = ToolRegistry.findTool(`performance-tool-${i}`);
        expect(tool).toBeDefined();
      }
      const lookupTime = Date.now() - lookupStart;
      expect(lookupTime).toBeLessThan(500); // Lookups should be fast

      expect(ToolRegistry.getAllTools()).toHaveLength(100);
    });

    it('should handle tool definition generation for many tools efficiently', () => {
      // Register multiple tools
      for (let i = 0; i < 50; i++) {
        ToolRegistry.register({
          name: `def-tool-${i}`,
          schema: ThoughtSchema,
          server: testToolServer,
          description: `Definition test tool ${i}`
        });
      }

      const start = Date.now();
      const definitions = ToolRegistry.getToolDefinitions();
      const elapsed = Date.now() - start;

      expect(definitions).toHaveLength(50);
      expect(elapsed).toBeLessThan(200); // Should be fast
    });
  });
});
