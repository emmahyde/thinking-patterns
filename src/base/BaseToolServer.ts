import { z } from 'zod';

/**
 * Tool registry entry type definition
 */
export interface ToolRegistryEntry<TIn = unknown, TOut = unknown> {
  name: string;
  schema: z.ZodSchema<TIn>;
  server: BaseToolServer<TIn, TOut>;
  description?: string;
}

/**
 * Standard MCP response envelope
 */
export interface MCPResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Abstract base class for all tool servers
 * Provides standardized validation, error handling, and response formatting
 */
export abstract class BaseToolServer<TIn, TOut> {
  protected schema: z.ZodSchema<TIn>;

  /**
   * Constructor that accepts a Zod schema for input validation
   * @param schema - Zod schema for validating input data
   */
  constructor(schema: z.ZodSchema<TIn>) {
    this.schema = schema;
  }

  /**
   * Validates input using the provided Zod schema
   * @param input - Raw input data to validate
   * @returns Validated and typed input data
   * @throws Error if validation fails
   */
  protected validate(input: unknown): TIn {
    try {
      return this.schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw error;
    }
  }

  /**
   * Abstract method to be implemented by concrete servers
   * Contains the core business logic for processing validated input
   * @param validInput - Validated input data
   * @returns Processed output data
   */
  protected abstract handle(validInput: TIn): TOut;

  /**
   * Main entry point that wraps validation, processing, and error handling
   * Provides standardized {content, isError} envelope response
   * @param rawInput - Raw input data from MCP request
   * @returns Standardized MCP response
   */
  public run(rawInput: unknown): MCPResponse {
    try {
      // Validate input using schema
      const validatedInput = this.validate(rawInput);

      // Process with concrete implementation
      const result = this.handle(validatedInput);

      // Format successful response
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      // Format error response
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed',
            timestamp: new Date().toISOString()
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * Optional method for servers that need custom response formatting
   * @param result - Result from handle method
   * @returns Formatted response content
   */
  protected formatResponse(result: TOut): Array<{ type: string; text: string }> {
    return [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }];
  }

  /**
   * Optional method for servers that need custom error formatting
   * @param error - Error that occurred during processing
   * @returns Formatted error response content
   */
  protected formatError(error: Error): Array<{ type: string; text: string }> {
    return [{
      type: "text",
      text: JSON.stringify({
        error: error.message,
        status: 'failed',
        timestamp: new Date().toISOString()
      }, null, 2)
    }];
  }
}

/**
 * Tool registry for managing all available tools
 */
export class ToolRegistry {
  private static tools: ToolRegistryEntry[] = [];

  /**
   * Register a new tool
   * @param entry - Tool registry entry
   */
  static register<TIn, TOut>(entry: ToolRegistryEntry<TIn, TOut>): void {
    this.tools.push(entry as ToolRegistryEntry);
  }

  /**
   * Find a tool by name
   * @param name - Tool name
   * @returns Tool registry entry or undefined
   */
  static findTool(name: string): ToolRegistryEntry | undefined {
    return this.tools.find(tool => tool.name === name);
  }

  /**
   * Get all registered tools
   * @returns Array of all tool registry entries
   */
  static getAllTools(): ToolRegistryEntry[] {
    return [...this.tools];
  }

  /**
   * Get tool names for MCP ListTools response
   * @returns Array of tool definitions for MCP
   */
  static getToolDefinitions(): Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }> {
    return this.tools.map(tool => ({
      name: tool.name,
      description: tool.description || `Tool for ${tool.name} operations`,
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    }));
  }
}
