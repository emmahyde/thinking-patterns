import { BaseToolServer } from '../base/BaseToolServer.js';
import { TemporalThinkingSchema, TemporalThinking } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

export class TemporalThinkingServer extends BaseToolServer<TemporalThinking, any> {
  constructor() {
    super(TemporalThinkingSchema);
  }

  protected handle(validInput: TemporalThinking): any {
    return this.process(validInput);
  }

  public process(validInput: TemporalThinking): any {
    const formattedOutput = this.formatOutput(validInput);

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

  private formatOutput(data: TemporalThinking): string {
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