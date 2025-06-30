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
  // Extract description if available
  const description = field._def.description;

  if (field instanceof z.ZodString) {
    const schema: Record<string, unknown> = { type: "string" };
    if (description) {
      schema.description = description;
    }
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
    if (description) {
      schema.description = description;
    }
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
    const schema: Record<string, unknown> = { type: "boolean" };
    if (description) {
      schema.description = description;
    }
    return schema;
  }

  if (field instanceof z.ZodArray) {
    const schema: Record<string, unknown> = {
      type: "array",
      items: getFieldSchema(field._def.type)
    };
    if (description) {
      schema.description = description;
    }
    return schema;
  }

  if (field instanceof z.ZodObject) {
    const schema = zodToJsonSchema(field);
    if (description) {
      schema.description = description;
    }
    return schema;
  }

  if (field instanceof z.ZodOptional) {
    const innerSchema = getFieldSchema(field._def.innerType);
    // Preserve description from the optional wrapper if it exists
    if (description && !innerSchema.description) {
      innerSchema.description = description;
    }
    return innerSchema;
  }

  if (field instanceof z.ZodEnum) {
    const schema: Record<string, unknown> = {
      type: "string",
      enum: field._def.values
    };
    if (description) {
      schema.description = description;
    }
    return schema;
  }

  if (field instanceof z.ZodRecord) {
    const schema: Record<string, unknown> = {
      type: "object",
      additionalProperties: getFieldSchema(field._def.valueType)
    };
    if (description) {
      schema.description = description;
    }
    return schema;
  }

  if (field instanceof z.ZodUnion) {
    // Handle union types by taking the first option as primary schema
    // This is a simplified approach - could be enhanced to use anyOf/oneOf
    const options = field._def.options;
    if (options && options.length > 0) {
      const primarySchema = getFieldSchema(options[0]);
      if (description) {
        primarySchema.description = description;
      }
      return primarySchema;
    }
  }

  // Fallback for unknown types
  const schema: Record<string, unknown> = { type: "string" };
  if (description) {
    schema.description = description;
  }
  return schema;
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
   * @returns Standardized response with content array and optional error flag
   */
  public run(rawInput: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean; data?: any } {
    try {
      // Validate input using schema
      const validatedInput = this.validate(rawInput);

      // Process with concrete implementation
      const result = this.handle(validatedInput);

      // Return standardized success response
      return {
        content: this.formatResponse(result),
        data: result
      };

    } catch (error) {
      // Return standardized error response instead of throwing
      return {
        content: this.formatError(error instanceof Error ? error : new Error(String(error))),
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
      text: JSON.stringify(result)
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
      })
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
    // Validate required fields
    if (!entry.name || typeof entry.name !== 'string') {
      throw new Error('Tool name must be a non-empty string');
    }

    if (!entry.server) {
      throw new Error('Tool server must be provided');
    }

    if (!entry.schema) {
      throw new Error('Tool schema must be provided');
    }

    // Check for duplicate names
    if (this.tools.find(tool => tool.name === entry.name)) {
      throw new Error(`Tool with name '${entry.name}' is already registered`);
    }

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
