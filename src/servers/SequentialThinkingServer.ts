import chalk from 'chalk';
import { EnhancedThoughtData, ToolContext, CurrentStep } from '../interfaces/ThoughtData.js';
import { ToolRecommendationEngine } from '../services/ToolRecommendationEngine.js';

export class EnhancedSequentialThinkingServer {
  private recommendationEngine: ToolRecommendationEngine;
  private availableTools: string[] = [
    'mentalmodel',
    'debuggingapproach',
    'stochasticalgorithm',
    'collaborativereasoning',
    'decisionframework',
    'metacognitivemonitoring',
    'scientificmethod',
    'structuredargumentation',
    'visualreasoning'
  ];

  constructor() {
    this.recommendationEngine = new ToolRecommendationEngine();
  }

  private validateEnhancedThoughtData(input: unknown): EnhancedThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      is_revision: data.is_revision as boolean | undefined,
      revises_thought: data.revises_thought as number | undefined,
      branch_from_thought: data.branch_from_thought as number | undefined,
      branch_id: data.branch_id as string | undefined,
      needs_more_thoughts: data.needs_more_thoughts as boolean | undefined,
      current_step: data.current_step as CurrentStep | undefined,
      previous_steps: data.previous_steps as any[] | undefined,
      remaining_steps: data.remaining_steps as string[] | undefined,
      tool_usage_history: data.tool_usage_history as any[] | undefined
    };
  }

  private createToolContext(sessionId?: string, userPreferences?: Record<string, any>): ToolContext {
    return {
      available_tools: this.availableTools,
      user_preferences: userPreferences || {},
      session_history: [], // TODO: Integrate with SessionManager
      problem_domain: 'general' // TODO: Infer from context or allow user specification
    };
  }

  private formatEnhancedThought(thoughtData: EnhancedThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, is_revision, revises_thought,
      branch_from_thought, branch_id, current_step } = thoughtData;

    let prefix = '';
    let context = '';

    if (is_revision) {
      prefix = chalk.yellow('🔄 Revision');
      context = ` (revising thought ${revises_thought})`;
    } else if (branch_from_thought) {
      prefix = chalk.green('🌿 Branch');
      context = ` (from thought ${branch_from_thought}, ID: ${branch_id})`;
    } else {
      prefix = chalk.blue('💭 Thought');
      context = '';
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    let output = `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │`;

    // Add current step information if available
    if (current_step) {
      output += `
├${border}┤
│ ${chalk.cyan('📋 Current Step:')} ${current_step.step_description.padEnd(border.length - 18)} │
│ ${chalk.cyan('🎯 Expected:')} ${current_step.expected_outcome.padEnd(border.length - 14)} │
│ ${chalk.cyan('⏱️  Duration:')} ${current_step.estimated_duration?.padEnd(border.length - 14) || 'N/A'.padEnd(border.length - 14)} │`;

      // Add tool recommendations
      if (current_step.recommended_tools.length > 0) {
        output += `
├${border}┤
│ ${chalk.magenta('🛠️  Recommended Tools:')} ${' '.repeat(border.length - 22)} │`;

        current_step.recommended_tools.slice(0, 3).forEach((tool, index) => {
          const confidenceBar = '█'.repeat(Math.round(tool.confidence * 10));
          const confidence = `${(tool.confidence * 100).toFixed(0)}%`;
          const toolLine = `${index + 1}. ${tool.tool_name} (${confidence}) ${confidenceBar}`;
          output += `
│ ${toolLine.padEnd(border.length - 2)} │`;

          // Add rationale on next line if it fits
          const rationale = tool.rationale.length > border.length - 4
            ? tool.rationale.substring(0, border.length - 7) + '...'
            : tool.rationale;
          output += `
│    ${rationale.padEnd(border.length - 6)} │`;
        });
      }

      // Add next step conditions
      if (current_step.next_step_conditions.length > 0) {
        output += `
├${border}┤
│ ${chalk.green('✅ Next Step Conditions:')} ${' '.repeat(border.length - 25)} │`;

        current_step.next_step_conditions.slice(0, 3).forEach(condition => {
          const conditionText = condition.length > border.length - 6
            ? condition.substring(0, border.length - 9) + '...'
            : condition;
          output += `
│ • ${conditionText.padEnd(border.length - 4)} │`;
        });
      }
    }

    output += `
└${border}┘`;

    return output;
  }

  public processThought(
    input: unknown,
    sessionId?: string,
    userPreferences?: Record<string, any>
  ): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateEnhancedThoughtData(input);

      // Adjust total thoughts if needed
      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      // Generate current step if not provided
      if (!validatedInput.current_step) {
        const toolContext = this.createToolContext(sessionId, userPreferences);
        validatedInput.current_step = this.recommendationEngine.generateCurrentStep(
          validatedInput.thought,
          validatedInput.thoughtNumber,
          validatedInput.totalThoughts,
          toolContext
        );
      }

      // TODO: Store in SessionManager instead of memory
      // sessionManager.addThought(sessionId, validatedInput);

      const formattedThought = this.formatEnhancedThought(validatedInput);
      console.error(formattedThought);

      // Create response object
      const response = {
        thoughtNumber: validatedInput.thoughtNumber,
        totalThoughts: validatedInput.totalThoughts,
        nextThoughtNeeded: validatedInput.nextThoughtNeeded,
        current_step: validatedInput.current_step,
        recommended_tools: validatedInput.current_step?.recommended_tools || [],
        step_progress: {
          stage: this.determineStage(validatedInput.thoughtNumber, validatedInput.totalThoughts),
          completion_percentage: Math.round((validatedInput.thoughtNumber / validatedInput.totalThoughts) * 100)
        },
        session_info: {
          session_id: sessionId || 'default',
          timestamp: new Date().toISOString()
        }
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error) {
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

  private determineStage(thoughtNumber: number, totalThoughts: number): string {
    const progress = thoughtNumber / totalThoughts;
    if (progress <= 0.3) return 'initial';
    if (progress >= 0.7) return 'final';
    return 'middle';
  }

  // Method to update available tools dynamically
  public updateAvailableTools(tools: string[]): void {
    this.availableTools = tools;
  }

  // Method to get current tool recommendations for a thought
  public getToolRecommendations(
    thought: string,
    thoughtNumber: number,
    totalThoughts: number,
    sessionId?: string
  ): any {
    const toolContext = this.createToolContext(sessionId);
    return this.recommendationEngine.generateRecommendations(
      thought,
      thoughtNumber,
      totalThoughts,
      toolContext
    );
  }
}
