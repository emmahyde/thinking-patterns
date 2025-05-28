import { BaseToolServer } from '../base/BaseToolServer.js';
import { MentalModelSchema, MentalModelData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Mental Model Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class ClearThoughtMentalModelServer extends BaseToolServer<MentalModelData, any> {
  constructor() {
    super(MentalModelSchema);
  }

  protected handle(validInput: MentalModelData): any {
    // Format output using prettyBox utility
    const formattedOutput = this.formatMentalModelOutput(validInput);

    // Log formatted output to console
    console.error(formattedOutput);

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
