import { ToolRegistry } from './BaseToolServer.js';
import {
  SequentialThoughtSchema,
  MentalModelSchema,
  DebuggingApproachSchema,
  StochasticAlgorithmSchema,
  CollaborativeReasoningSchema,
  DecisionFrameworkSchema,
  MetacognitiveMonitoringSchema,
  ScientificMethodSchema,
  StructuredArgumentationSchema,
  VisualReasoningSchema,
  DomainModelingSchema,
  ProblemDecompositionSchema,
  CriticalThinkingSchema,
  RecursiveThinkingSchema,
  TemporalThinkingSchema
} from '../schemas/index.js';

// Import all the thinking-patterns tool servers
import { SequentialThinkingServer } from '../servers/SequentialThinkingServer.js';
import { MentalModelServer } from '../servers/MentalModelServer.js';
import { DebuggingApproachServer } from '../servers/DebuggingApproachServer.js';
import { StochasticAlgorithmServer } from '../servers/StochasticAlgorithmServer.js';
import { CollaborativeReasoningServer } from '../servers/CollaborativeReasoningServer.js';
import { DecisionFrameworkServer } from '../servers/DecisionFrameworkServer.js';
import { MetacognitiveMonitoringServer } from '../servers/MetacognitiveMonitoringServer.js';
import { ScientificMethodServer } from '../servers/ScientificMethodServer.js';
import { StructuredArgumentationServer } from '../servers/StructuredArgumentationServer.js';
import { VisualReasoningServer } from '../servers/VisualReasoningServer.js';
import { DomainModelingServer } from '../servers/DomainModelingServer.js';
import { ProblemDecompositionServer } from '../servers/ProblemDecompositionServer.js';
import { CriticalThinkingServer } from '../servers/CriticalThinkingServer.js';
import { RecursiveThinkingServer } from '../servers/RecursiveThinkingServer.js';
import { TemporalThinkingServer } from '../servers/TemporalThinkingServer.js';

/**
 * Initialize and register all available thinking-patterns tools
 */
export function initializeToolRegistry(): void {
  // Register Sequential Thinking tool
  ToolRegistry.register({
    name: "sequential_thinking",
    schema: SequentialThoughtSchema,
    server: new SequentialThinkingServer(),
    description: "A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve."
  });

  // Register Mental Model tool
  ToolRegistry.register({
    name: "mental_model",
    schema: MentalModelSchema,
    server: new MentalModelServer(),
    description: "Tool for creating and analyzing mental models to understand complex problems and systems."
  });

  // Register Debugging Approach tool
  ToolRegistry.register({
    name: "debugging_approach",
    schema: DebuggingApproachSchema,
    server: new DebuggingApproachServer(),
    description: "Systematic debugging methodologies for troubleshooting and problem resolution."
  });

  // Register Stochastic Algorithm tool
  ToolRegistry.register({
    name: "stochastic_algorithm",
    schema: StochasticAlgorithmSchema,
    server: new StochasticAlgorithmServer(),
    description: "Probabilistic algorithms for decision-making under uncertainty, including MDPs, MCTS, and Bayesian optimization."
  });

  // Register Collaborative Reasoning tool
  ToolRegistry.register({
    name: "collaborative_reasoning",
    schema: CollaborativeReasoningSchema,
    server: new CollaborativeReasoningServer(),
    description: "Multi-perspective collaborative problem solving with diverse personas and structured contributions."
  });

  // Register Decision Framework tool
  ToolRegistry.register({
    name: "decision_framework",
    schema: DecisionFrameworkSchema,
    server: new DecisionFrameworkServer(),
    description: "Structured decision analysis and rational choice frameworks for complex decisions."
  });

  // Register Metacognitive Monitoring tool
  ToolRegistry.register({
    name: "metacognitive_monitoring",
    schema: MetacognitiveMonitoringSchema,
    server: new MetacognitiveMonitoringServer(),
    description: "Self-assessment of knowledge and reasoning quality for improved metacognition."
  });

  // Register Scientific Method tool
  ToolRegistry.register({
    name: "scientific_method",
    schema: ScientificMethodSchema,
    server: new ScientificMethodServer(),
    description: "Formal hypothesis testing and experimentation following the scientific method."
  });

  // Register Structured Argumentation tool
  ToolRegistry.register({
    name: "structured_argumentation",
    schema: StructuredArgumentationSchema,
    server: new StructuredArgumentationServer(),
    description: "Dialectical reasoning and argument analysis for structured debates and logical reasoning."
  });

  // Register Visual Reasoning tool
  ToolRegistry.register({
    name: "visual_reasoning",
    schema: VisualReasoningSchema,
    server: new VisualReasoningServer(),
    description: "Diagram-based thinking and problem solving with visual elements and transformations."
  });

  // Register Domain Modeling tool
  ToolRegistry.register({
    name: "domain_modeling",
    schema: DomainModelingSchema,
    server: new DomainModelingServer(),
    description: "Creating and refining conceptual models of a domain, including entities, relationships, and rules."
  });

  // Register Problem Decomposition tool
  ToolRegistry.register({
    name: "problem_decomposition",
    schema: ProblemDecompositionSchema,
    server: new ProblemDecompositionServer(),
    description: "Breaking down complex problems into manageable sub-problems and tasks."
  });

  // Register Critical Thinking tool
  ToolRegistry.register({
    name: "critical_thinking",
    schema: CriticalThinkingSchema,
    server: new CriticalThinkingServer(),
    description: "Systematic evaluation of arguments, assumptions, and potential issues to improve reasoning quality."
  });

  // Register Recursive Thinking tool
  ToolRegistry.register({
    name: "recursive_thinking",
    schema: RecursiveThinkingSchema,
    server: new RecursiveThinkingServer(),
    description: "Applying recursive strategies to solve problems with base and recursive cases, including optimizations."
  });

  // Register Temporal Thinking tool
  ToolRegistry.register({
    name: "temporal_thinking",
    schema: TemporalThinkingSchema,
    server: new TemporalThinkingServer(),
    description: "Modeling systems and reasoning across time using states, events, and transitions."
  });
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
export function processToolRequest(toolName: string, arguments_: unknown): { tool_name: string, output: any } {
  const tool = ToolRegistry.findTool(toolName);

  if (!tool) {
    // The handler in index.ts will catch this and convert it to a proper McpError
    throw new Error(`Tool not found: ${toolName}`);
  }

  // The 'run' method in BaseToolServer handles validation and returns standardized format
  const standardizedResult = tool.server.run(arguments_);

  // Check if this is an error response and throw if so
  if (standardizedResult.isError) {
    // Extract error message from content
    const errorText = standardizedResult.content[0]?.text;
    if (errorText) {
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorText);
      } catch {
        throw new Error(errorText);
      }
    }
    throw new Error('Unknown error occurred');
  }

  // Return the unwrapped data in the expected MCP format
  return {
    tool_name: toolName,
    output: standardizedResult.data
  };
}
