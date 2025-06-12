import { BaseToolServer } from '../base/BaseToolServer.js';
import { RecursiveThinkingSchema, RecursiveThinking } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

export class RecursiveThinkingServer extends BaseToolServer<RecursiveThinking, any> {
  constructor() {
    super(RecursiveThinkingSchema);
  }

  protected handle(validInput: RecursiveThinking): any {
    return this.process(validInput);
  }

  public process(validInput: RecursiveThinking): any {
    const formattedOutput = this.formatOutput(validInput);

    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      problem: validInput.problem,
      baseCases: validInput.baseCases,
      recursiveCases: validInput.recursiveCases,
      terminationConditions: validInput.terminationConditions,
      iterativeAlternative: validInput.iterativeAlternative,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  private formatOutput(data: RecursiveThinking): string {
    const sections: Record<string, string | string[]> = {
      'Problem': data.problem,
    };

    if (data.baseCases && data.baseCases.length > 0) {
      sections['Base Cases'] = data.baseCases.map(item => `• ${item}`);
    }
    if (data.recursiveCases && data.recursiveCases.length > 0) {
      sections['Recursive Cases'] = data.recursiveCases.map(item => `• ${item}`);
    }
    if (data.terminationConditions && data.terminationConditions.length > 0) {
      sections['Termination Conditions'] = data.terminationConditions.map(item => `• ${item}`);
    }
    if (data.iterativeAlternative) {
      sections['Iterative Alternative'] = data.iterativeAlternative;
    }

    return boxed('🔄 Recursive Thinking', sections);
  }
} 