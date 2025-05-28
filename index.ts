#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

// Import the registry system
import { initializeToolRegistry, getToolDefinitions, processToolRequest } from './src/base/toolRegistry.js';

// Initialize the tool registry
initializeToolRegistry();

// Create and configure the MCP server
const server = new Server(
  {
    name: "thinking-patterns-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Request Handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Get all tools from the registry
  const tools = getToolDefinitions();

  return {
    tools: tools
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Use the registry for all tool processing
    const result = processToolRequest(request.params.name, request.params.arguments);
    return result;
  } catch (error) {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Tool '${request.params.name}' not found. Available tools: ${getToolDefinitions().map(t => t.name).join(', ')}`
    );
  }
});

// Server startup
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Thinking Patterns MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
