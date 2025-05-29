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
 * Convert Zod schema to JSON schema for MCP tool definitions
 */
function zodToJsonSchema(zodSchema: z.ZodSchema): Record<string, unknown> {
  // Basic conversion for common Zod types
  // This is a simplified implementation - could be enhanced with a library like zod-to-json-schema
  
  if (zodSchema instanceof z.ZodObject) {
    const shape = zodSchema._def.shape();
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    
    for (const [key, fieldSchema] of Object.entries(shape)) {
      const field = fieldSchema as z.ZodSchema;
      properties[key] = getFieldSchema(field);
      
      // Check if field is required (not optional)
      if (!field.isOptional()) {
        required.push(key);
      }
    }
    
    return {
      type: "object",
      properties,
      required,
      additionalProperties: false
    };
  }
  
  // Fallback for non-object schemas
  return {
    type: "object",
    properties: {},
    required: []
  };
}

/**
 * Get JSON schema for individual Zod field
 */
function getFieldSchema(field: z.ZodSchema): Record<string, unknown> {
  if (field instanceof z.ZodString) {
    const schema: Record<string, unknown> = { type: "string" };
    if (field._def.checks) {
      for (const check of field._def.checks) {
        if (check.kind === "min") {
          schema.minLength = check.value;
        }
        if (check.kind === "max") {
          schema.maxLength = check.value;
        }
      }
    }
    return schema;
  }
  
  if (field instanceof z.ZodNumber) {
    const schema: Record<string, unknown> = { type: "number" };
    if (field._def.checks) {
      for (const check of field._def.checks) {
        if (check.kind === "min") {
          schema.minimum = check.value;
        }
        if (check.kind === "max") {
          schema.maximum = check.value;
        }
        if (check.kind === "int") {
          schema.type = "integer";
        }
      }
    }
    return schema;
  }
  
  if (field instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }
  
  if (field instanceof z.ZodArray) {
    return {
      type: "array",
      items: getFieldSchema(field._def.type)
    };
  }
  
  if (field instanceof z.ZodObject) {
    return zodToJsonSchema(field);
  }
  
  if (field instanceof z.ZodOptional) {
    return getFieldSchema(field._def.innerType);
  }
  
  if (field instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: field._def.values
    };
  }
  
  // Fallback for unknown types
  return { type: "string" };
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
   * Standardized process method for unified server interface
   * Default implementation delegates to handle method for backward compatibility
   * Servers can override this to provide standardized processing interface
   * @param validInput - Validated input data
   * @returns Processed output data
   */
  public process(validInput: TIn): TOut {
    return this.handle(validInput);
  }

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
      inputSchema: zodToJsonSchema(tool.schema)
    }));
  }
}
