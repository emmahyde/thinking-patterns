import { ScientificMethodServer } from '../servers/ScientificMethodServer.js';
import { MentalModelServer } from '../servers/MentalModelServer.js';
import { DebuggingApproachServer } from '../servers/DebuggingApproachServer.js';
import { SequentialThinkingServer } from '../servers/SequentialThinkingServer.js';
import { StochasticAlgorithmServer } from '../servers/StochasticAlgorithmServer.js';
import { DecisionFrameworkServer } from '../servers/DecisionFrameworkServer.js';
import { CollaborativeReasoningServer } from '../servers/CollaborativeReasoningServer.js';
import { MetacognitiveMonitoringServer } from '../servers/MetacognitiveMonitoringServer.js';
import { StructuredArgumentationServer } from '../servers/StructuredArgumentationServer.js';
import { VisualReasoningServer } from '../servers/VisualReasoningServer.js';

export interface ServerResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
  data?: any;
}

export interface ThinkingPatternServer {
  process(input: unknown): ServerResponse;
}

export class ServerRegistry {
  private servers: Map<string, ThinkingPatternServer> = new Map();

  constructor() {
    this.initializeServers();
  }

  private initializeServers(): void {
    // Register original servers using standardized run method which returns MCPResponse
    this.servers.set('scientific_method', {
      process: (input: unknown) => new ScientificMethodServer().run(input)
    });

    this.servers.set('mental_model', {
      process: (input: unknown) => new MentalModelServer().run(input)
    });

    this.servers.set('debugging_approach', {
      process: (input: unknown) => new DebuggingApproachServer().run(input)
    });

    this.servers.set('sequential_thinking', {
      process: (input: unknown) => new SequentialThinkingServer().run(input)
    });

    this.servers.set('stochastic_algorithm', {
      process: (input: unknown) => new StochasticAlgorithmServer().run(input)
    });

    // Register the additional imported servers using standardized run method
    this.servers.set('decision_framework', {
      process: (input: unknown) => new DecisionFrameworkServer().run(input)
    });

    this.servers.set('collaborative_reasoning', {
      process: (input: unknown) => new CollaborativeReasoningServer().run(input)
    });

    this.servers.set('metacognitive_monitoring', {
      process: (input: unknown) => new MetacognitiveMonitoringServer().run(input)
    });

    this.servers.set('structured_argumentation', {
      process: (input: unknown) => new StructuredArgumentationServer().run(input)
    });

    this.servers.set('visual_reasoning', {
      process: (input: unknown) => new VisualReasoningServer().run(input)
    });
  }

  public getServer(serverName: string): ThinkingPatternServer | undefined {
    return this.servers.get(serverName.toLowerCase());
  }

  public hasServer(serverName: string): boolean {
    return this.servers.has(serverName.toLowerCase());
  }

  public getAvailableServers(): string[] {
    return Array.from(this.servers.keys());
  }

  public processRequest(serverName: string, input: unknown): ServerResponse {
    const server = this.getServer(serverName);

    if (!server) {
      return {
        content: [{ type: "text", text: `Error: Server '${serverName}' not found` }],
        isError: true
      };
    }

    try {
      return server.process(input);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{ type: "text", text: `Error processing request: ${errorMessage}` }],
        isError: true
      };
    }
  }

  public getServerStats(): Record<string, any> {
    return {
      totalServers: this.servers.size,
      availableServers: this.getAvailableServers(),
      serverTypes: {
        scientific: ['scientific_method'],
        cognitive: ['mental_model', 'sequential_thinking', 'metacognitive_monitoring'],
        technical: ['debugging_approach'],
        probabilistic: ['stochastic_algorithm'],
        reasoning: ['collaborative_reasoning', 'structured_argumentation', 'visual_reasoning'],
        decision: ['decision_framework']
      }
    };
  }

  public registerCustomServer(name: string, server: ThinkingPatternServer): void {
    this.servers.set(name.toLowerCase(), server);
  }

  public unregisterServer(name: string): boolean {
    return this.servers.delete(name.toLowerCase());
  }
}
