import { BaseToolServer } from '../base/BaseToolServer.js';
import { MentalModelSchema, MentalModelData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Mental Model Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class MentalModelServer extends BaseToolServer<MentalModelData, any> {
  constructor() {
    super(MentalModelSchema);
  }

  protected handle(validInput: MentalModelData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for mental model
   * @param validInput - Validated mental model data
   * @returns Processed mental model result
   */
  public process(validInput: MentalModelData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatMentalModelOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      modelName: validInput.modelName,
      problem: validInput.problem,
      status: 'success',
      hasSteps: (validInput.steps?.length ?? 0) > 0,
      hasConclusion: !!validInput.conclusion,
      stepCount: validInput.steps?.length ?? 0,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  // Backward compatibility method for tests
  public processModel(input: unknown): { content: Array<{ type: string; text: string }>; data?: any; isError?: boolean } {
    try {
      const validatedInput = this.validate(input);
      const result = this.handle(validatedInput);
      const response = this.run(input);

      return {
        ...response,
        data: validatedInput  // Add the validated input data for test compatibility
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  private formatMentalModelOutput(modelData: MentalModelData): string {
    const sections: Record<string, string | string[]> = {
      'Model': modelData.modelName,
      'Problem': modelData.problem
    };

    if (modelData.steps && modelData.steps.length > 0) {
      sections['Steps'] = modelData.steps.map(step => `• ${step}`);
    }

    if (modelData.reasoning) {
      sections['Reasoning'] = modelData.reasoning;
    }

    if (modelData.conclusion) {
      sections['Conclusion'] = modelData.conclusion;
    }

    return boxed('🧠 Mental Model', sections);
  }
}
