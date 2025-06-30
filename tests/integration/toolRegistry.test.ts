/**
 * Integration tests for tool registry system
 * Tests tool discovery, routing, and registry-first vs legacy fallback
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToolRegistry, ToolRegistryEntry } from '../../src/base/BaseToolServer.js';
import { processToolRequest, getToolDefinitions } from '../../src/base/toolRegistry.js';
import { BaseToolServer } from '../../src/base/BaseToolServer.js';
import { SequentialThoughtSchema, SequentialThoughtData } from '../../src/schemas/SequentialThoughtSchema.js';
import { validSequentialThought } from '../helpers/testFixtures.js';

// Test implementation of BaseToolServer for registry testing
class TestToolServer extends BaseToolServer<SequentialThoughtData, { success: boolean; message: string }> {
  get toolName(): string {
    return 'test-tool';
  }

  constructor() {
    super(SequentialThoughtSchema);
  }

  protected handle(validInput: SequentialThoughtData): { success: boolean; message: string } {
    return {
      success: true,
      message: `Processed thought: ${validInput.thought}`
    };
  }
}

// Another test server for multiple tool testing
class AlternativeToolServer extends BaseToolServer<SequentialThoughtData, { result: string; processed: boolean }> {
  get toolName(): string {
    return 'alternative-tool';
  }

  constructor() {
    super(SequentialThoughtSchema);
  }

  protected handle(validInput: SequentialThoughtData): { result: string; processed: boolean } {
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
      const toolEntry: ToolRegistryEntry<SequentialThoughtData, { success: boolean; message: string }> = {
        name: "test-tool",
        schema: SequentialThoughtSchema,
        server: testToolServer,
        description: "Test tool for integration testing"
      };

      ToolRegistry.register(toolEntry);

      const registeredTools = ToolRegistry.getAllTools();
      expect(registeredTools).toHaveLength(1);
      expect(registeredTools[0].name).toBe("test-tool");
      expect(registeredTools[0].description).toBe("Test tool for integration testing");
      expect(registeredTools[0].server).toBeInstanceOf(TestToolServer);
    });

    it('should register multiple tools', () => {
      const toolEntry1: ToolRegistryEntry = {
        name: "tool-one",
        schema: SequentialThoughtSchema,
        server: testToolServer,
        description: "First test tool"
      };

      const toolEntry2: ToolRegistryEntry = {
        name: "tool-two",
        schema: SequentialThoughtSchema,
        server: alternativeToolServer,
        description: "Second test tool"
      };

      ToolRegistry.register(toolEntry1);
      ToolRegistry.register(toolEntry2);

      const registeredTools = ToolRegistry.getAllTools();
      expect(registeredTools).toHaveLength(2);

      const toolNames = registeredTools.map((tool: ToolRegistryEntry) => tool.name);
      expect(toolNames).toContain("tool-one");
      expect(toolNames).toContain("tool-two");
    });

    it('should throw an error if tool name is missing', () => {
      const invalidEntry: Omit<ToolRegistryEntry, 'name'> = {
        schema: SequentialThoughtSchema,
        server: testToolServer,
      };
      expect(() => ToolRegistry.register(invalidEntry as any)).toThrow('Tool name must be a non-empty string');
    });

    it('should throw an error if tool server is missing', () => {
      const invalidEntry: Omit<ToolRegistryEntry, 'server'> = {
        name: 'no-server-tool',
        schema: SequentialThoughtSchema,
      };
      expect(() => ToolRegistry.register(invalidEntry as any)).toThrow('Tool server must be provided');
    });

    it('should handle tool registration with minimal fields', () => {
      const minimalToolEntry: ToolRegistryEntry = {
        name: "minimal-tool",
        schema: SequentialThoughtSchema,
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
        name: "sequential_thinking",
        schema: SequentialThoughtSchema,
        server: testToolServer,
        description: "Sequential thinking tool"
      });

      ToolRegistry.register({
        name: "mental_model",
        schema: SequentialThoughtSchema,
        server: alternativeToolServer,
        description: "Mental model tool"
      });
    });

    it('should find registered tool by name', () => {
      const foundTool = ToolRegistry.findTool("sequential_thinking");

      expect(foundTool).toBeDefined();
      expect(foundTool?.name).toBe("sequential_thinking");
      expect(foundTool?.server).toBe(testToolServer);
    });

    it('should return undefined for non-existent tool', () => {
      const foundTool = ToolRegistry.findTool("nonexistent-tool");

      expect(foundTool).toBeUndefined();
    });

    it('should handle case-sensitive tool names correctly', () => {
      const foundTool = ToolRegistry.findTool("SequentialThinking"); // Different case
      expect(foundTool).toBeUndefined();

      const correctCaseTool = ToolRegistry.findTool("sequential_thinking");
      expect(correctCaseTool).toBeDefined();
    });

    it('should get all registered tools', () => {
      const allTools = ToolRegistry.getAllTools();

      expect(allTools).toHaveLength(2);
      expect(allTools.map((t: ToolRegistryEntry) => t.name)).toEqual(
        expect.arrayContaining(["sequential_thinking", "mental_model"])
      );
    });
  });

  describe('processToolRequest workflow', () => {
    beforeEach(() => {
      ToolRegistry.register({
        name: "test-processor",
        schema: SequentialThoughtSchema,
        server: testToolServer,
        description: "Test processing tool"
      });
    });

    it('should execute tool and return the correct tool response format', async () => {
      const response = await processToolRequest("test-processor", validSequentialThought);

      expect(response.tool_name).toBe("test-processor");
      expect(response.output).toEqual({
        success: true,
        message: "Processed thought: This is a test thought for validation"
      });
    });

    it('should throw a validation error for invalid input', async () => {
      const invalidInput = {
        thought: "Valid thought",
        // Missing required fields
      };

      try {
        await processToolRequest("test-processor", invalidInput);
        throw new Error('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        let msg = (error as Error).message.toString();
        let errStr = '';
        try {
          errStr = JSON.parse(msg).error;
        } catch { errStr = msg; }
        expect(errStr).toMatch(/Validation failed/);
      }
    });

    it('should throw an error for an unknown tool', async () => {
      try {
        await processToolRequest("unknown-tool", {});
        throw new Error('should have thrown');
      } catch (error) {
        // Print debug info
        // eslint-disable-next-line no-console
        console.log('ACTUAL ERROR.message:', error && (error as Error).message);
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Tool not found: unknown-tool');
      }
    });

    it('should route different tools correctly', async () => {
      ToolRegistry.register({
        name: "alternative-processor",
        schema: SequentialThoughtSchema,
        server: alternativeToolServer,
        description: "Alternative processing tool"
      });

      const response1 = await processToolRequest("test-processor", validSequentialThought);
      const response2 = await processToolRequest("alternative-processor", validSequentialThought);

      const output1 = response1.output as { success: boolean; message: string };
      const output2 = response2.output as { result: string; processed: boolean };

      // Different servers should produce different results
      expect(output1.message).toContain("Processed thought");
      expect(output2.result).toContain("Alternative processing");
      expect(output1).not.toEqual(output2);
    });

    it('should handle server-side errors gracefully', async () => {
      class ErrorThrowingServer extends BaseToolServer<SequentialThoughtData, any> {
        get toolName() { return 'error-tool'; }
        constructor() {
          super(SequentialThoughtSchema);
        }

        protected handle(_validInput: SequentialThoughtData): any {
          throw new Error("Server-side processing failed");
        }
      }

      ToolRegistry.register({
        name: 'error-tool',
        schema: SequentialThoughtSchema,
        server: new ErrorThrowingServer(),
      });

      try {
        await processToolRequest('error-tool', validSequentialThought);
        throw new Error('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        let msg = (error as Error).message.toString();
        let errStr = '';
        try {
          errStr = JSON.parse(msg).error;
        } catch { errStr = msg; }
        expect(errStr).toBe('Server-side processing failed');
      }
    });
  });

  describe('getToolDefinitions for MCP', () => {
    beforeEach(() => {
      ToolRegistry.register({
        name: "sequential_thinking",
        schema: SequentialThoughtSchema,
        server: testToolServer,
        description: "Sequential thinking for systematic analysis"
      });

      ToolRegistry.register({
        name: "debugging",
        schema: SequentialThoughtSchema,
        server: alternativeToolServer
        // No description, to test default
      });
    });

    it('should generate correct tool definitions, including defaults', () => {
      const defs = getToolDefinitions();

      expect(defs).toHaveLength(2);

      // Test tool with a provided description
      const sequentialTool = defs.find(t => t.name === "sequential_thinking");
      expect(sequentialTool).toBeDefined();
      expect(sequentialTool?.description).toBe("Sequential thinking for systematic analysis");
      expect(sequentialTool?.inputSchema).toBeDefined();

      // Test tool that gets a default description
      const debuggingTool = defs.find(t => t.name === "debugging");
      expect(debuggingTool).toBeDefined();
      expect(debuggingTool?.description).toBe("Tool for debugging operations");
      expect(debuggingTool?.inputSchema).toBeDefined();
    });

    it('should generate definitions with correct schema structure', () => {
      const defs = getToolDefinitions();
      const sequentialTool = defs.find(t => t.name === 'sequential_thinking');

      expect(sequentialTool?.inputSchema.type).toBe('object');
      expect(sequentialTool?.inputSchema.properties).toHaveProperty('thought');
      expect(sequentialTool?.inputSchema.properties).toHaveProperty('thoughtNumber');
      expect(sequentialTool?.inputSchema.required).toEqual(expect.arrayContaining(['thought', 'thoughtNumber']));
    });
  });


});
