import { ToolRegistry, BaseToolServer } from './BaseToolServer.js';
import { ThoughtSchema, ThoughtData } from '../schemas/index.js';

/**
 * Simple implementation of SequentialThinking using BaseToolServer
 * This demonstrates the new framework pattern
 */
class SequentialThinkingServerAdapter extends BaseToolServer<ThoughtData, any> {
  constructor() {
    super(ThoughtSchema);
  }

  protected handle(validInput: ThoughtData): any {
    // For now, return a simple demonstration response
    // This will be replaced with proper server logic in future phases
    return {
      thought_number: validInput.thought_number,
      total_thoughts: validInput.total_thoughts,
      next_thought_needed: validInput.next_thought_needed,
      thought: validInput.thought,
      status: 'success',
      timestamp: new Date().toISOString(),
      framework_version: 'BaseToolServer v1.0',
      note: 'This is processed through the new registry system!'
    };
  }
}
/**
 /**
  * Initialize and register all available tools
  */
 export function initializeToolRegistry(): void {
   // Register the SequentialThinking tool
   ToolRegistry.register({
     name: "sequentialthinking",
     schema: ThoughtSchema,
     server: new SequentialThinkingServerAdapter(),
     description: "A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve."
   });

   // TODO: Register other tools as they are migrated to BaseToolServer
  //   name: "mentalmodel",
  //   schema: MentalModelSchema,
  //   server: new MentalModelServerAdapter(),
  //   description: "Tool for creating and analyzing mental models"
  // });
}

/**
 * Get tool definitions for MCP ListTools response
 */
export function getToolDefinitions(): Array<{
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}> {
  return ToolRegistry.getToolDefinitions();
}

/**
 * Process tool request using registry
 */
export function processToolRequest(toolName: string, arguments_: unknown): {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
} {
  const tool = ToolRegistry.findTool(toolName);

  if (!tool) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: `Unknown tool: ${toolName}`,
          status: 'failed',
          timestamp: new Date().toISOString()
        }, null, 2)
      }],
      isError: true
    };
  }

  return tool.server.run(arguments_);
}
