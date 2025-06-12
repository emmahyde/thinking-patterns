import { BaseToolServer } from '../base/BaseToolServer.js';
import { RecursiveThinkingSchema, RecursiveThinkingData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Recursive Thinking Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class RecursiveThinkingServer extends BaseToolServer<RecursiveThinkingData, any> {
  constructor() {
    super(RecursiveThinkingSchema);
  }

  protected handle(validInput: RecursiveThinkingData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for recursive thinking
   * @param validInput - Validated recursive thinking data
   * @returns Processed recursive thinking result
   */
  public process(validInput: RecursiveThinkingData): any {
    const formattedOutput = this.formatOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      ...validInput,
      status: 'success',
      timestamp: new Date().toISOString(),
      baseCaseCount: validInput.baseCases.length,
      recursiveCaseCount: validInput.recursiveCases.length,
      optimizationCount: validInput.optimizations?.length || 0,
      alternativeCount: validInput.iterativeAlternatives?.length || 0,
    };
  }

  private formatOutput(data: RecursiveThinkingData): string {
    const sections: Record<string, string | string[]> = {
      'Problem': data.problem,
    };

    if (data.baseCases && data.baseCases.length > 0) {
      sections['Base Cases'] = data.baseCases.map(item => `• ${item.condition}: ${item.solution}`);
    }
    if (data.recursiveCases && data.recursiveCases.length > 0) {
      sections['Recursive Cases'] = data.recursiveCases.map(item => `• ${item.condition}: ${item.decomposition}`);
    }
    if (data.terminationConditions && data.terminationConditions.length > 0) {
      sections['Termination Conditions'] = data.terminationConditions.map(item => `• ${item}`);
    }
    if (data.iterativeAlternatives && data.iterativeAlternatives.length > 0) {
      sections['Iterative Alternatives'] = data.iterativeAlternatives.map(alt => `• ${alt.approach}: ${alt.description}`);
    }

    return boxed('🔄 Recursive Thinking', sections);
  }
} 