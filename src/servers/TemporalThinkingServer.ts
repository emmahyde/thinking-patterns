import { BaseToolServer } from '../base/BaseToolServer.js';
import { TemporalThinkingSchema, TemporalThinkingData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Temporal Thinking Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class TemporalThinkingServer extends BaseToolServer<TemporalThinkingData, any> {
  constructor() {
    super(TemporalThinkingSchema);
  }

  protected handle(validInput: TemporalThinkingData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for temporal thinking
   * @param validInput - Validated temporal thinking data
   * @returns Processed temporal thinking result
   */
  public process(validInput: TemporalThinkingData): any {
    const formattedOutput = this.formatOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      ...validInput,
      status: 'success',
      stateCount: validInput.states.length,
      eventCount: validInput.events.length,
      transitionCount: validInput.transitions.length,
      timestamp: new Date().toISOString(),
    };
  }

  private formatOutput(data: TemporalThinkingData): string {
    const sections: Record<string, string | string[]> = {
      'Context': data.context,
      'Initial State': data.initialState,
    };

    sections['States'] = data.states.map(s => `• ${s.name}${s.description ? `: ${s.description}` : ''}`);
    sections['Events'] = data.events.map(e => `• ${e.name}${e.description ? `: ${e.description}` : ''}`);

    const transitionLines = data.transitions.map(t => {
      let line = `• (${t.from}) --[${t.event}]--> (${t.to})`;
      const details = [];
      if (t.guard) details.push(`if: ${t.guard}`);
      if (t.action) details.push(`do: ${t.action}`);
      if (details.length > 0) {
        line += ` { ${details.join(', ')} }`;
      }
      return line;
    });
    sections['Transitions'] = transitionLines;

    if (data.finalStates && data.finalStates.length > 0) {
      sections['Final States'] = data.finalStates.join(', ');
    }

    return boxed('⏳ Temporal Thinking: State Machine', sections);
  }
} 